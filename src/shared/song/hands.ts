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
  if (hands.size === tracks.length) return hands;

  const highest = tracks.reduce((a, b) => (b.meanPitch > a.meanPitch ? b : a));
  for (const t of tracks) {
    if (hands.has(t.index)) continue;
    hands.set(t.index, t === highest || t.meanPitch >= SPLIT_PITCH ? 'right' : 'left');
  }
  return hands;
}

export const handBySplit = (pitch: number): Hand => (pitch >= SPLIT_PITCH ? 'right' : 'left');
