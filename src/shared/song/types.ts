export type Hand = 'left' | 'right';

export type Note = {
  id: number;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
  hand: Hand;
  track: number;
};

export type TempoEvent = { time: number; bpm: number };
export type TimeSignatureEvent = { time: number; numerator: number; denominator: number };

export type Song = {
  title: string;
  duration: number;
  notes: Note[];
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  measures: number[];
  pitchRange: { min: number; max: number };
  maxNoteDuration: number;
};
