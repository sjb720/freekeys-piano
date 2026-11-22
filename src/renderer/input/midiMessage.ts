import type { PedalKind } from './types';

export type MidiNoteMessage = { type: 'on' | 'off'; pitch: number; velocity: number };
export type MidiPedalMessage = { type: 'pedal'; pedal: PedalKind; down: boolean };
export type MidiMessage = MidiNoteMessage | MidiPedalMessage;

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const CONTROL_CHANGE = 0xb0;
const PEDALS: Record<number, PedalKind> = { 64: 'sustain', 66: 'sostenuto', 67: 'soft' };
// Continuous (half-pedal) controllers send 0–127; the General MIDI threshold is 64.
const PEDAL_DOWN = 64;

export function parseMidiMessage(data: Uint8Array | null | undefined): MidiMessage | null {
  if (!data || data.length < 3) return null;
  const command = data[0]! & 0xf0;
  const first = data[1]!;
  const second = data[2]!;
  if (command === NOTE_ON && second > 0)
    return { type: 'on', pitch: first, velocity: second / 127 };
  if (command === NOTE_OFF || command === NOTE_ON)
    return { type: 'off', pitch: first, velocity: 0 };
  const pedal = command === CONTROL_CHANGE ? PEDALS[first] : undefined;
  if (pedal) return { type: 'pedal', pedal, down: second >= PEDAL_DOWN };
  return null;
}
