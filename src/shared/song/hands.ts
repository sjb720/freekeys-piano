import type { Hand } from './types';

export type TrackSummary = { index: number; name: string; meanPitch: number };

const RIGHT_NAME = /\b(right|rh|treble)\b|right hand/i;
const LEFT_NAME = /\b(left|lh|bass)\b|left hand/i;

export const SPLIT_PITCH = 60;

export function handsByTrack(tracks: TrackSummary[]): Map<number, Hand> | null {
  if (tracks.length < 2) return null;
  const hands = new Map<number, Hand>();

  for (const t of tracks) {
    if (RIGHT_NAME.test(t.name)) hands.set(t.index, 'right');
    else if (LEFT_NAME.test(t.name)) hands.set(t.index, 'left');
  }
  const named = new Set(hands.values());
  if (hands.size === tracks.length && named.size === 2) return hands;
  if (tracks.length !== 2) return null;

  const [a, b] = tracks as [TrackSummary, TrackSummary];
  const [high, low] = a.meanPitch >= b.meanPitch ? [a, b] : [b, a];
  return new Map([
    [high.index, 'right'],
    [low.index, 'left'],
  ]);
}

export const handBySplit = (pitch: number): Hand => (pitch >= SPLIT_PITCH ? 'right' : 'left');
