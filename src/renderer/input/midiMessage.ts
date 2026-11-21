export type MidiNoteMessage = { type: 'on' | 'off'; pitch: number; velocity: number };

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;

export function parseMidiMessage(data: Uint8Array | null | undefined): MidiNoteMessage | null {
  if (!data || data.length < 3) return null;
  const command = data[0]! & 0xf0;
  const pitch = data[1]!;
  const velocity = data[2]!;
  if (command === NOTE_ON && velocity > 0) return { type: 'on', pitch, velocity: velocity / 127 };
  if (command === NOTE_OFF || command === NOTE_ON) return { type: 'off', pitch, velocity: 0 };
  return null;
}
