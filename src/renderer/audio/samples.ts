export const SAMPLE_LOW = 21;
export const SAMPLE_HIGH = 108;
export const SAMPLE_STEP = 3;

export const SAMPLE_PITCHES: readonly number[] = Array.from(
  { length: (SAMPLE_HIGH - SAMPLE_LOW) / SAMPLE_STEP + 1 },
  (_, i) => SAMPLE_LOW + i * SAMPLE_STEP,
);

export function nearestSample(pitch: number): number {
  const clamped = Math.min(SAMPLE_HIGH, Math.max(SAMPLE_LOW, pitch));
  return SAMPLE_LOW + Math.round((clamped - SAMPLE_LOW) / SAMPLE_STEP) * SAMPLE_STEP;
}

export const playbackRateFor = (pitch: number, sample: number) => 2 ** ((pitch - sample) / 12);
