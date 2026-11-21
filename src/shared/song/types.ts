export type Hand = 'left' | 'right';

export type Note = {
  id: number;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
  hand: Hand;
  autoHand: Hand;
  track: number;
};

export type HandSource = 'tracks' | 'heuristic';

export type Timed = { start: number };

export type Beat = { start: number; downbeat: boolean };

export type TempoEvent = { time: number; bpm: number };
export type TimeSignatureEvent = { time: number; numerator: number; denominator: number };

export type Song = {
  title: string;
  duration: number;
  notes: Note[];
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  measures: number[];
  beats: Beat[];
  pitchRange: { min: number; max: number };
  maxNoteDuration: number;
  handSource: HandSource;
};
