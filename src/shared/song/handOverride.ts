import type { Hand, Note } from './types';

export type HandOverride = { kind: 'auto' } | { kind: 'split'; pitch: number } | { kind: 'swap' };

export const AUTO_HANDS: HandOverride = { kind: 'auto' };

export function resolveHand(note: Pick<Note, 'pitch' | 'autoHand'>, override: HandOverride): Hand {
  switch (override.kind) {
    case 'auto':
      return note.autoHand;
    case 'split':
      return note.pitch >= override.pitch ? 'right' : 'left';
    case 'swap':
      return note.autoHand === 'left' ? 'right' : 'left';
  }
}
