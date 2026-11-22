import { MAX_NOTES, SLICE_WINDOW } from './separateHands';
import type { Hand } from './types';

export type TrackSummary = { index: number; name: string; meanPitch: number };
export type TrackNote = { track: number; pitch: number; start: number };

const RIGHT_NAME = /\b(right|rh|treble)\b|right hand|^(up|upper)(I{1,3}|IV)?\b/i;
const LEFT_NAME = /\b(left|lh|bass)\b|left hand|^(down|lower)(I{1,3}|IV)?\b/i;

export const SPLIT_PITCH = 60;
// A tenth: the widest chord one hand can play at once.
export const REACH = 16;

const MAX_FREE_TRACKS = 8;
const CROWD_PENALTY = 10;
const HOME = { left: 48, right: 72 };
const HOME_WEIGHT = 1e-3;
// Above this share of unplayable onsets, whole-track assignment is wrong and notes are split one by one.
export const MAX_UNPLAYABLE = 0.05;

type Slice = { track: number; pitch: number }[];

function onsetSlices(notes: readonly TrackNote[]): Slice[] {
  const sorted = [...notes].sort((a, b) => a.start - b.start);
  const slices: Slice[] = [];
  for (let i = 0; i < sorted.length;) {
    const start = sorted[i]!.start;
    const slice: Slice = [];
    while (i < sorted.length && sorted[i]!.start - start <= SLICE_WINDOW) slice.push(sorted[i++]!);
    slices.push(slice);
  }
  return slices;
}

function sliceCost(slice: Slice, hands: Map<number, Hand>): number {
  let leftLo = Infinity;
  let leftHi = -Infinity;
  let rightLo = Infinity;
  let rightHi = -Infinity;
  let left = 0;
  let right = 0;
  for (const { track, pitch } of slice) {
    if (hands.get(track) === 'left') {
      left++;
      leftLo = Math.min(leftLo, pitch);
      leftHi = Math.max(leftHi, pitch);
    } else {
      right++;
      rightLo = Math.min(rightLo, pitch);
      rightHi = Math.max(rightHi, pitch);
    }
  }
  let cost = 0;
  if (left) cost += Math.max(0, leftHi - leftLo - REACH);
  if (right) cost += Math.max(0, rightHi - rightLo - REACH);
  cost += Math.max(0, left - MAX_NOTES, right - MAX_NOTES) * CROWD_PENALTY;
  if (left && right) cost += Math.max(0, leftHi - rightLo);
  return cost;
}

// Tries every left/right split of the unfixed tracks and keeps the one with the fewest unplayable onsets.
export function handsByPlayability(
  tracks: readonly TrackSummary[],
  notes: readonly TrackNote[],
  fixed: ReadonlyMap<number, Hand> = new Map(),
): Map<number, Hand> | null {
  const free = tracks.filter((t) => !fixed.has(t.index));
  if (free.length > MAX_FREE_TRACKS || tracks.length < 2) return null;
  const slices = onsetSlices(notes);
  const counts = new Map<number, number>();
  for (const n of notes) counts.set(n.track, (counts.get(n.track) ?? 0) + 1);

  let best: { hands: Map<number, Hand>; cost: number; unplayable: number } | null = null;
  for (let mask = 0; mask < 1 << free.length; mask++) {
    const hands = new Map(fixed);
    free.forEach((t, bit) => hands.set(t.index, mask & (1 << bit) ? 'right' : 'left'));
    const used = new Set(hands.values());
    if (used.size < 2) continue;

    let cost = 0;
    let unplayable = 0;
    for (const slice of slices) {
      const c = sliceCost(slice, hands);
      cost += c;
      if (c > 0) unplayable++;
    }
    for (const t of tracks) {
      const hand = hands.get(t.index)!;
      cost += Math.abs(t.meanPitch - HOME[hand]) * (counts.get(t.index) ?? 0) * HOME_WEIGHT;
    }
    if (!best || cost < best.cost) best = { hands, cost, unplayable };
  }
  if (!best || best.unplayable > slices.length * MAX_UNPLAYABLE) return null;
  return best.hands;
}

export function handsByTrack(
  tracks: readonly TrackSummary[],
  notes: readonly TrackNote[] = [],
): Map<number, Hand> | null {
  if (tracks.length < 2) return null;
  const named = new Map<number, Hand>();

  for (const t of tracks) {
    if (RIGHT_NAME.test(t.name)) named.set(t.index, 'right');
    else if (LEFT_NAME.test(t.name)) named.set(t.index, 'left');
  }
  if (named.size === tracks.length && new Set(named.values()).size === 2) return named;

  if (tracks.length === 2) {
    const [a, b] = tracks as [TrackSummary, TrackSummary];
    const [high, low] = a.meanPitch >= b.meanPitch ? [a, b] : [b, a];
    return new Map([
      [high.index, 'right'],
      [low.index, 'left'],
    ]);
  }
  return handsByPlayability(tracks, notes, named);
}

type HandedNote = { pitch: number; start: number; hand: Hand };

const span = (notes: readonly HandedNote[]) =>
  notes.length
    ? Math.max(...notes.map((n) => n.pitch)) - Math.min(...notes.map((n) => n.pitch))
    : 0;

// Gives a hand's outermost note to the other hand when a chord is wider than one hand can reach.
export function repairReach(notes: HandedNote[]): number {
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  let moved = 0;
  for (let i = 0; i < sorted.length;) {
    const start = sorted[i]!.start;
    let j = i;
    while (j < sorted.length && sorted[j]!.start - start <= SLICE_WINDOW) j++;
    const slice = sorted.slice(i, j);
    for (let pass = 0; pass < slice.length; pass++) {
      const left = slice.filter((n) => n.hand === 'left');
      const right = slice.filter((n) => n.hand === 'right');
      const candidate =
        span(left) > REACH ? left.at(-1) : span(right) > REACH ? right[0] : undefined;
      if (!candidate) break;
      const to: Hand = candidate.hand === 'left' ? 'right' : 'left';
      if (span([...(to === 'left' ? left : right), candidate]) > REACH) break;
      candidate.hand = to;
      moved++;
    }
    i = j;
  }
  return moved;
}

export const handBySplit = (pitch: number): Hand => (pitch >= SPLIT_PITCH ? 'right' : 'left');
