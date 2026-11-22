import { lowerBound, type Beat, type Hand, type Note } from '../song';

export type HandFeatures = {
  noteCount: number;
  meanRate: number;
  peakRate: number;
  chordSize: number;
  maxPolyphony: number;
  span: number;
  leap: number;
  range: number;
  blackKeys: number;
  offGrid: number;
};

export const SLICE = 0.03;
const PEAK_WINDOW = 2;
const REST_GAP = 1.5;
const BLACK = new Set([1, 3, 6, 8, 10]);

type Slice = { start: number; pitches: number[] };

function slices(notes: readonly Note[]): Slice[] {
  const out: Slice[] = [];
  for (const note of notes) {
    const last = out.at(-1);
    if (last && note.start - last.start <= SLICE) last.pitches.push(note.pitch);
    else out.push({ start: note.start, pitches: [note.pitch] });
  }
  return out;
}

export function percentile(values: readonly number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!;
}

function playingTime(groups: readonly Slice[], notes: readonly Note[]): number {
  let total = 0;
  for (let i = 1; i < groups.length; i++) {
    total += Math.min(groups[i]!.start - groups[i - 1]!.start, REST_GAP);
  }
  const last = notes.at(-1);
  return total + (last ? Math.min(last.duration, REST_GAP) : 0);
}

function peakRate(notes: readonly Note[]): number {
  let peak = 0;
  for (let i = 0, j = 0; i < notes.length; i++) {
    while (notes[i]!.start - notes[j]!.start > PEAK_WINDOW) j++;
    peak = Math.max(peak, i - j + 1);
  }
  return peak / PEAK_WINDOW;
}

function offGridRatio(groups: readonly Slice[], beats: readonly Beat[]): number {
  if (beats.length < 2 || !groups.length) return 0;
  let off = 0;
  for (const { start } of groups) {
    const i = Math.max(0, Math.min(lowerBound(beats, start + 1e-6) - 1, beats.length - 2));
    const a = beats[i]!.start;
    const b = beats[i + 1]!.start;
    const eighths = ((start - a) / (b - a)) * 2;
    if (Math.abs(eighths - Math.round(eighths)) > 0.12) off++;
  }
  return off / groups.length;
}

export function handFeatures(notes: readonly Note[], beats: readonly Beat[]): HandFeatures {
  if (!notes.length) {
    return {
      noteCount: 0,
      meanRate: 0,
      peakRate: 0,
      chordSize: 0,
      maxPolyphony: 0,
      span: 0,
      leap: 0,
      range: 0,
      blackKeys: 0,
      offGrid: 0,
    };
  }
  const groups = slices(notes);
  const spans = groups.map((g) => Math.max(...g.pitches) - Math.min(...g.pitches));
  const centers = groups.map((g) => g.pitches.reduce((a, b) => a + b, 0) / g.pitches.length);
  const leaps = centers.slice(1).map((c, i) => Math.abs(c - centers[i]!));
  const pitches = notes.map((n) => n.pitch);

  return {
    noteCount: notes.length,
    meanRate: notes.length / Math.max(playingTime(groups, notes), 0.5),
    peakRate: peakRate(notes),
    chordSize: notes.length / groups.length,
    maxPolyphony: Math.max(...groups.map((g) => g.pitches.length)),
    span: percentile(spans, 0.9),
    leap: percentile(leaps, 0.9),
    range: Math.max(...pitches) - Math.min(...pitches),
    blackKeys: pitches.filter((p) => BLACK.has(p % 12)).length / pitches.length,
    offGrid: offGridRatio(groups, beats),
  };
}

export function handIndependence(notes: readonly Note[]): number {
  const onsets = (hand: Hand) =>
    new Set(notes.filter((n) => n.hand === hand).map((n) => Math.round(n.start / SLICE)));
  const left = onsets('left');
  const right = onsets('right');
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const t of left) if (right.has(t) || right.has(t - 1) || right.has(t + 1)) shared++;
  return 1 - shared / (left.size + right.size - shared);
}
