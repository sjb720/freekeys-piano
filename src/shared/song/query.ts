import type { Note, Song } from './types';

export function lowerBound(notes: readonly Note[], time: number): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (notes[mid]!.start < time) lo = mid + 1;
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
