import type { Hand } from './types';

export type HandNote = { pitch: number; start: number; duration: number };

export const SLICE_WINDOW = 0.03;
export const MAX_SPAN = 14;
export const MAX_NOTES = 5;

const START = { left: 48, right: 72 };
const SPAN_PENALTY = 40;
const CROSS_PENALTY = 25;
const FOLLOW = 0.4;

type HandState = { pos: number; held: { pitch: number; end: number }[] };

function spanCost(pitches: readonly number[], held: HandState['held']): number {
  if (!pitches.length) return 0;
  let lo = pitches[0]!;
  let hi = pitches.at(-1)!;
  for (const h of held) {
    lo = Math.min(lo, h.pitch);
    hi = Math.max(hi, h.pitch);
  }
  return Math.max(0, hi - lo - MAX_SPAN) * SPAN_PENALTY;
}

function splitCost(low: number[], high: number[], left: HandState, right: HandState): number {
  if (low.length > MAX_NOTES || high.length > MAX_NOTES) return Infinity;
  let cost = 0;
  for (const p of low) cost += Math.abs(p - left.pos);
  for (const p of high) cost += Math.abs(p - right.pos);
  cost += spanCost(low, left.held) + spanCost(high, right.held);

  const rightHeldLow = Math.min(...right.held.map((h) => h.pitch));
  const leftHeldHigh = Math.max(...left.held.map((h) => h.pitch));
  if (low.length && low.at(-1)! > rightHeldLow) cost += CROSS_PENALTY;
  if (high.length && high[0]! < leftHeldHigh) cost += CROSS_PENALTY;
  return cost;
}

function assign(hand: HandState, pitches: number[], end: number): void {
  if (!pitches.length) return;
  const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  hand.pos += (mean - hand.pos) * FOLLOW;
  for (const pitch of pitches) hand.held.push({ pitch, end });
}

export function separateHands(notes: readonly HandNote[]): Hand[] {
  const hands: Hand[] = new Array(notes.length);
  const left: HandState = { pos: START.left, held: [] };
  const right: HandState = { pos: START.right, held: [] };

  for (let i = 0; i < notes.length;) {
    const start = notes[i]!.start;
    let j = i;
    while (j < notes.length && notes[j]!.start - start <= SLICE_WINDOW) j++;

    for (const hand of [left, right]) hand.held = hand.held.filter((h) => h.end > start + 1e-3);

    const order = Array.from({ length: j - i }, (_, k) => i + k).sort(
      (a, b) => notes[a]!.pitch - notes[b]!.pitch,
    );
    const pitches = order.map((k) => notes[k]!.pitch);

    // Chords too big for any split keep the middle split rather than all going right.
    let bestSplit = Math.floor(pitches.length / 2);
    let bestCost = Infinity;
    for (let s = 0; s <= pitches.length; s++) {
      const cost = splitCost(pitches.slice(0, s), pitches.slice(s), left, right);
      if (cost < bestCost) {
        bestCost = cost;
        bestSplit = s;
      }
    }

    order.forEach((k, rank) => (hands[k] = rank < bestSplit ? 'left' : 'right'));
    const end = (k: number) => notes[k]!.start + notes[k]!.duration;
    const lowEnd = Math.max(start, ...order.slice(0, bestSplit).map(end));
    const highEnd = Math.max(start, ...order.slice(bestSplit).map(end));
    assign(left, pitches.slice(0, bestSplit), lowEnd);
    assign(right, pitches.slice(bestSplit), highEnd);
    i = j;
  }
  return hands;
}
