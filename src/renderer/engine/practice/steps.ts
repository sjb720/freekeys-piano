import type { Note } from '@shared/song';

export type Step = { start: number; pitches: ReadonlySet<number>; noteIds: readonly number[] };

export const CHORD_WINDOW = 0.05;

export function buildSteps(notes: readonly Note[], isActive: (note: Note) => boolean): Step[] {
  const steps: { start: number; pitches: Set<number>; noteIds: number[] }[] = [];
  for (const note of notes) {
    if (!isActive(note)) continue;
    const last = steps.at(-1);
    if (last && note.start - last.start <= CHORD_WINDOW) {
      last.pitches.add(note.pitch);
      last.noteIds.push(note.id);
    } else {
      steps.push({ start: note.start, pitches: new Set([note.pitch]), noteIds: [note.id] });
    }
  }
  return steps;
}
