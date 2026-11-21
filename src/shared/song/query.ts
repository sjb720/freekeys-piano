import type { Note, Song, Timed } from './types';

export function lowerBound(items: readonly Timed[], time: number): number {
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (items[mid]!.start < time) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function forEachNoteInWindow(
  song: Song,
  from: number,
  to: number,
  visit: (note: Note) => void,
): void {
  const notes = song.notes;
  for (let i = lowerBound(notes, from - song.maxNoteDuration); i < notes.length; i++) {
    const note = notes[i]!;
    if (note.start >= to) break;
    if (note.start + note.duration > from) visit(note);
  }
}

export function measureIndexAt(song: Pick<Song, 'measures'>, time: number): number {
  let lo = 0;
  let hi = song.measures.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (song.measures[mid]! <= time) lo = mid;
    else hi = mid - 1;
  }
  return Math.max(lo, 0);
}

export function measureBounds(
  song: Pick<Song, 'measures' | 'duration'>,
  index: number,
): { start: number; end: number } {
  const i = Math.min(Math.max(index, 0), song.measures.length - 1);
  return { start: song.measures[i] ?? 0, end: song.measures[i + 1] ?? song.duration };
}
