import { describe, expect, it } from 'vitest';
import type { SongRef } from '../ipc';
import {
  bandCounts,
  clearFilters,
  DEFAULT_SONG_QUERY,
  isFiltered,
  querySongs,
  type SongQuery,
} from './query';

const song = (
  id: string,
  title: string,
  score: number,
  left: number,
  right: number,
  extra: Partial<SongRef> = {},
): SongRef =>
  ({
    id,
    title,
    source: 'library',
    favorite: false,
    hands: { kind: 'auto' },
    addedAt: 0,
    duration: 60,
    noteCount: 100,
    handSource: 'tracks',
    difficulty: {
      version: 1,
      score,
      level: Math.max(1, Math.ceil(score / 10)),
      left: { score: left, features: {} },
      right: { score: right, features: {} },
      independence: 0,
      factors: [],
    },
    ...extra,
  }) as SongRef;

const songs = [
  song('a', 'Für Elise', 45, 30, 50, { addedAt: 3 }),
  song('b', 'Twinkle', 8, 3, 5, { favorite: true, addedAt: 1 }),
  song('c', 'Fantaisie-Impromptu', 71, 58, 68, { addedAt: 2 }),
];
const ids = (q: Partial<SongQuery>) =>
  querySongs(songs, { ...DEFAULT_SONG_QUERY, ...q }).map((s) => s.id);

describe('querySongs', () => {
  it('sorts by difficulty, title, and recency', () => {
    expect(ids({})).toEqual(['b', 'a', 'c']);
    expect(ids({ sort: 'hardest' })).toEqual(['c', 'a', 'b']);
    expect(ids({ sort: 'title' })).toEqual(['c', 'a', 'b']);
    expect(ids({ sort: 'recent' })).toEqual(['a', 'c', 'b']);
  });

  it('filters by band using the chosen hand', () => {
    expect(ids({ band: 'beginner' })).toEqual(['b']);
    expect(ids({ band: 'intermediate' })).toEqual(['a']);
    expect(ids({ band: 'beginner', hand: 'left' })).toEqual(['b', 'a']);
    expect(ids({ band: 'intermediate', hand: 'left' })).toEqual(['c']);
  });

  it('searches titles ignoring case and accents', () => {
    expect(ids({ search: 'fur' })).toEqual(['a']);
    expect(ids({ search: 'IMPROMPTU fant' })).toEqual(['c']);
  });

  it('shows only favorites when asked', () => {
    expect(ids({ favorites: true })).toEqual(['b']);
  });
});

describe('bandCounts', () => {
  it('counts each band, ignoring the selected band but honoring other filters', () => {
    const query = { ...DEFAULT_SONG_QUERY, band: 'advanced' as const };
    expect(bandCounts(songs, query)).toEqual({ all: 3, beginner: 1, intermediate: 1, advanced: 1 });
    expect(bandCounts(songs, { ...query, favorites: true })).toEqual({
      all: 1,
      beginner: 1,
      intermediate: 0,
      advanced: 0,
    });
  });

  it('uses the hand level', () => {
    expect(bandCounts(songs, { ...DEFAULT_SONG_QUERY, hand: 'left' })).toEqual({
      all: 3,
      beginner: 2,
      intermediate: 1,
      advanced: 0,
    });
  });
});

describe('isFiltered / clearFilters', () => {
  it('treats search, band, and favorites as filters but not sort or hand', () => {
    expect(isFiltered({ ...DEFAULT_SONG_QUERY, sort: 'title', hand: 'left' })).toBe(false);
    expect(isFiltered({ ...DEFAULT_SONG_QUERY, search: ' a ' })).toBe(true);
    const cleared = clearFilters({
      ...DEFAULT_SONG_QUERY,
      band: 'beginner',
      favorites: true,
      sort: 'title',
    });
    expect(isFiltered(cleared)).toBe(false);
    expect(cleared.sort).toBe('title');
  });
});
