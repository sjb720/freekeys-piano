import type { Hand, Note } from './types';

export type HandOverride =
  | { kind: 'auto' }
  | { kind: 'split'; pitch: number }
  | { kind: 'swap' }
  | { kind: 'tracks'; hands: Partial<Record<number, Hand>> };

export const AUTO_HANDS: HandOverride = { kind: 'auto' };

export function resolveHand(
  note: Pick<Note, 'pitch' | 'autoHand' | 'track'>,
  override: HandOverride,
): Hand {
  switch (override.kind) {
    case 'auto':
      return note.autoHand;
    case 'split':
      return note.pitch >= override.pitch ? 'right' : 'left';
    case 'swap':
      return note.autoHand === 'left' ? 'right' : 'left';
    case 'tracks':
      return override.hands[note.track] ?? note.autoHand;
  }
}

// Starts each track on the hand most of its notes were detected in.
export function handsByMajority(
  notes: readonly Pick<Note, 'track' | 'autoHand'>[],
): Partial<Record<number, Hand>> {
  const counts = new Map<number, number>();
  for (const n of notes)
    counts.set(n.track, (counts.get(n.track) ?? 0) + (n.autoHand === 'right' ? 1 : -1));
  return Object.fromEntries([...counts].map(([track, c]) => [track, c >= 0 ? 'right' : 'left']));
}
