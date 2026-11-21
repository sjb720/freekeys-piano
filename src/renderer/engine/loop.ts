import { measureBounds, measureIndexAt, type Song } from '@shared/song';

export type LoopRegion = { start: number; end: number };

export function loopStartAt(song: Pick<Song, 'measures' | 'duration'>, time: number): number {
  return measureBounds(song, measureIndexAt(song, Math.max(time, 0))).start;
}

export function loopFrom(
  song: Pick<Song, 'measures' | 'duration'>,
  start: number,
  time: number,
): LoopRegion {
  const end = measureBounds(song, measureIndexAt(song, Math.max(time, start))).end;
  return { start, end: Math.max(end, measureBounds(song, measureIndexAt(song, start)).end) };
}
