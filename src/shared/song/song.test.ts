import { Midi } from '@tonejs/midi';
import { describe, expect, it } from 'vitest';
import { handsByTrack } from './hands';
import { beatTicks, measureStartTicks } from './measures';
import { parseMidi } from './parseMidi';
import { forEachNoteInWindow, lowerBound, measureBounds, measureIndexAt } from './query';
import type { Note } from './types';

function buildMidi(setup: (midi: Midi) => void): Uint8Array {
  const midi = new Midi();
  midi.header.setTempo(120);
  setup(midi);
  return midi.toArray();
}

describe('parseMidi', () => {
  it('assigns hands by track name', () => {
    const bytes = buildMidi((m) => {
      const lh = m.addTrack();
      lh.name = 'Left Hand';
      lh.addNote({ midi: 64, time: 0, duration: 0.5 });
      const rh = m.addTrack();
      rh.name = 'Right Hand';
      rh.addNote({ midi: 48, time: 0, duration: 0.5 });
    });
    const song = parseMidi(bytes, 'x');
    expect(song.notes.find((n) => n.pitch === 64)!.hand).toBe('left');
    expect(song.notes.find((n) => n.pitch === 48)!.hand).toBe('right');
  });

  it('assigns hands by mean pitch for unnamed tracks', () => {
    const bytes = buildMidi((m) => {
      m.addTrack().addNote({ midi: 72, time: 0, duration: 1 });
      m.addTrack().addNote({ midi: 40, time: 0, duration: 1 });
    });
    const hands = parseMidi(bytes, 'x').notes.map((n) => [n.pitch, n.hand]);
    expect(hands).toEqual([
      [40, 'left'],
      [72, 'right'],
    ]);
  });

  it('splits a single track at middle C', () => {
    const bytes = buildMidi((m) => {
      const t = m.addTrack();
      t.addNote({ midi: 59, time: 0, duration: 1 });
      t.addNote({ midi: 60, time: 0, duration: 1 });
    });
    expect(parseMidi(bytes, 'x').notes.map((n) => n.hand)).toEqual(['left', 'right']);
  });

  it('sorts notes, assigns ids, and computes metadata', () => {
    const bytes = buildMidi((m) => {
      const t = m.addTrack();
      t.addNote({ midi: 67, time: 1, duration: 2 });
      t.addNote({ midi: 60, time: 0, duration: 0.5 });
    });
    const song = parseMidi(bytes, 'Fallback');
    expect(song.title).toBe('Fallback');
    expect(song.notes.map((n) => [n.id, n.pitch])).toEqual([
      [0, 60],
      [1, 67],
    ]);
    expect(song.duration).toBeCloseTo(3);
    expect(song.pitchRange).toEqual({ min: 60, max: 67 });
    expect(song.maxNoteDuration).toBeCloseTo(2);
    expect(song.measures[0]).toBe(0);
    expect(song.measures[1]).toBeCloseTo(2);
  });

  it('ignores percussion', () => {
    const bytes = buildMidi((m) => {
      const drums = m.addTrack();
      drums.channel = 9;
      drums.addNote({ midi: 36, time: 0, duration: 0.1 });
      m.addTrack().addNote({ midi: 60, time: 0, duration: 1 });
    });
    expect(parseMidi(bytes, 'x').notes).toHaveLength(1);
  });
});

describe('handsByTrack', () => {
  it('returns null for a single track', () => {
    expect(handsByTrack([{ index: 0, name: '', meanPitch: 60 }])).toBeNull();
  });
});

describe('measureStartTicks', () => {
  it('defaults to 4/4', () => {
    expect(measureStartTicks([], 480 * 8, 480)).toEqual([0, 1920]);
  });

  it('handles signature changes', () => {
    const sigs = [
      { ticks: 0, numerator: 3, denominator: 4 },
      { ticks: 1440 * 2, numerator: 6, denominator: 8 },
    ];
    expect(measureStartTicks(sigs, 1440 * 4, 480)).toEqual([0, 1440, 2880, 4320]);
  });
});

describe('beatTicks', () => {
  it('marks downbeats per signature', () => {
    const beats = beatTicks([{ ticks: 0, numerator: 3, denominator: 4 }], 480 * 6, 480);
    expect(beats.map((b) => b.downbeat)).toEqual([true, false, false, true, false, false]);
  });

  it('uses the denominator for beat length', () => {
    const beats = beatTicks([{ ticks: 0, numerator: 6, denominator: 8 }], 240 * 6, 480);
    expect(beats.map((b) => b.ticks)).toEqual([0, 240, 480, 720, 960, 1200]);
  });
});

describe('measures', () => {
  const song = { measures: [0, 2, 4, 6], duration: 7 };

  it('finds the measure containing a time', () => {
    expect(measureIndexAt(song, -1)).toBe(0);
    expect(measureIndexAt(song, 2)).toBe(1);
    expect(measureIndexAt(song, 5.9)).toBe(2);
    expect(measureIndexAt(song, 100)).toBe(3);
  });

  it('returns measure bounds, ending the last at the duration', () => {
    expect(measureBounds(song, 1)).toEqual({ start: 2, end: 4 });
    expect(measureBounds(song, 3)).toEqual({ start: 6, end: 7 });
  });
});

describe('query', () => {
  const note = (id: number, start: number, duration: number): Note => ({
    id,
    pitch: 60,
    start,
    duration,
    velocity: 1,
    hand: 'right',
    track: 0,
  });
  const notes = [note(0, 0, 4), note(1, 1, 0.5), note(2, 2, 0.5), note(3, 5, 1)];
  const song = {
    notes,
    maxNoteDuration: 4,
  } as Parameters<typeof forEachNoteInWindow>[0];

  it('lowerBound finds first note at or after time', () => {
    expect(lowerBound(notes, 1)).toBe(1);
    expect(lowerBound(notes, 1.5)).toBe(2);
    expect(lowerBound(notes, 10)).toBe(4);
  });

  it('visits notes overlapping the window, including long earlier notes', () => {
    const seen: number[] = [];
    forEachNoteInWindow(song, 1.8, 3, (n) => seen.push(n.id));
    expect(seen).toEqual([0, 2]);
  });
});
