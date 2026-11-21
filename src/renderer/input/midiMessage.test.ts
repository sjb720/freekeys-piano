import { describe, expect, it } from 'vitest';
import { parseMidiMessage } from './midiMessage';

describe('parseMidiMessage', () => {
  it('parses note on for any channel', () => {
    expect(parseMidiMessage(new Uint8Array([0x93, 60, 127]))).toEqual({
      type: 'on',
      pitch: 60,
      velocity: 1,
    });
  });

  it('treats note on with zero velocity as note off', () => {
    expect(parseMidiMessage(new Uint8Array([0x90, 60, 0]))?.type).toBe('off');
  });

  it('parses note off', () => {
    expect(parseMidiMessage(new Uint8Array([0x80, 61, 40]))?.type).toBe('off');
  });

  it('ignores other messages', () => {
    expect(parseMidiMessage(new Uint8Array([0xb0, 64, 127]))).toBeNull();
    expect(parseMidiMessage(new Uint8Array([0xf8]))).toBeNull();
    expect(parseMidiMessage(null)).toBeNull();
  });
});
