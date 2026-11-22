import { levelFor } from '../analysis';
import type { SongRef } from '../ipc';
import type { HandFocus } from '../settings';

export const LEVEL_BANDS = {
  all: { label: 'All', min: 1, max: 10 },
  beginner: { label: 'Beginner', min: 1, max: 3 },
  intermediate: { label: 'Intermediate', min: 4, max: 6 },
  advanced: { label: 'Advanced', min: 7, max: 10 },
} as const;

export type LevelBand = keyof typeof LEVEL_BANDS;
export const LEVEL_BAND_KEYS = Object.keys(LEVEL_BANDS) as LevelBand[];

export const SONG_SORTS = ['easiest', 'hardest', 'title', 'recent'] as const;
export type SongSort = (typeof SONG_SORTS)[number];

export type SongQuery = {
  search: string;
  band: LevelBand;
  hand: HandFocus;
  sort: SongSort;
  favorites: boolean;
};

export const DEFAULT_SONG_QUERY: SongQuery = {
  search: '',
  band: 'all',
  hand: 'both',
  sort: 'easiest',
  favorites: false,
};

export const bandOf = (level: number): Exclude<LevelBand, 'all'> =>
  level <= 3 ? 'beginner' : level <= 6 ? 'intermediate' : 'advanced';

export function songScore(song: SongRef, hand: HandFocus): number {
  const { difficulty } = song;
  return hand === 'both' ? difficulty.score : difficulty[hand].score;
}

export const songLevel = (song: SongRef, hand: HandFocus) =>
  hand === 'both' ? song.difficulty.level : levelFor(song.difficulty[hand].score);

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function querySongs(songs: readonly SongRef[], query: SongQuery): SongRef[] {
  const terms = normalize(query.search).split(/\s+/).filter(Boolean);
  const band = LEVEL_BANDS[query.band];
  const byTitle = (a: SongRef, b: SongRef) => a.title.localeCompare(b.title);
  const byScore = (a: SongRef, b: SongRef) =>
    songScore(a, query.hand) - songScore(b, query.hand) || byTitle(a, b);

  const compare: Record<SongSort, (a: SongRef, b: SongRef) => number> = {
    easiest: byScore,
    hardest: (a, b) => byScore(b, a),
    title: byTitle,
    recent: (a, b) => b.addedAt - a.addedAt || byTitle(a, b),
  };

  return songs
    .filter((song) => {
      if (query.favorites && !song.favorite) return false;
      const level = songLevel(song, query.hand);
      if (level < band.min || level > band.max) return false;
      const title = normalize(song.title);
      return terms.every((t) => title.includes(t));
    })
    .sort(compare[query.sort]);
}
