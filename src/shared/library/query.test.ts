import { describe, expect, it } from 'vitest';
import type { SongRef } from '../ipc';
import { DEFAULT_SONG_QUERY, querySongs, type SongQuery } from './query';

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
