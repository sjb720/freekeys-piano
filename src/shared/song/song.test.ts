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

  it('separates a single track with the heuristic', () => {
    const bytes = buildMidi((m) => {
      const t = m.addTrack();
      t.addNote({ midi: 48, time: 0, duration: 1 });
      t.addNote({ midi: 72, time: 0, duration: 1 });
    });
    const song = parseMidi(bytes, 'x');
    expect(song.handSource).toBe('heuristic');
    expect(song.notes.map((n) => [n.hand, n.autoHand])).toEqual([
      ['left', 'left'],
      ['right', 'right'],
    ]);
  });

  it('uses the heuristic for three or more unnamed tracks', () => {
    const bytes = buildMidi((m) => {
      m.addTrack().addNote({ midi: 40, time: 0, duration: 1 });
      m.addTrack().addNote({ midi: 64, time: 0, duration: 1 });
      m.addTrack().addNote({ midi: 76, time: 0, duration: 1 });
    });
    expect(parseMidi(bytes, 'x').handSource).toBe('heuristic');
  });

  it('uses the embedded title and decodes UTF-8 text', () => {
    const named = (name: string) =>
      buildMidi((m) => {
        m.name = name;
        m.addTrack().addNote({ midi: 60, time: 0, duration: 1 });
      });
    expect(parseMidi(named('Für Elise'), 'x').title).toBe('Für Elise');
    const utf8 = String.fromCharCode(...new TextEncoder().encode('월광 소나타\0'));
    expect(parseMidi(named(utf8), 'x').title).toBe('월광 소나타');
  });

  it('falls back to the filename for placeholder titles', () => {
    for (const name of ['control track', 'Track 1', 'Untitled', '  ', 'Sequence-2']) {
      const bytes = buildMidi((m) => {
        m.name = name;
        m.addTrack().addNote({ midi: 60, time: 0, duration: 1 });
      });
      expect(parseMidi(bytes, 'Fallback').title).toBe('Fallback');
    }
  });

  it('treats a format 1 name on a track with notes as a track name, not a title', () => {
    const hex = (text: string) => text.split(' ').map((h) => parseInt(h, 16));
    const chunk = (id: string, body: number[]) => [
      ...Array.from(id, (c) => c.charCodeAt(0)),
      ...[24, 16, 8, 0].map((shift) => (body.length >> shift) & 0xff),
      ...body,
    ];
    const end = hex('00 ff 2f 00');
    // Track 1: named "Flute", plays C5. Track 2: unnamed, plays C3.
    const bytes = Uint8Array.from([
      ...chunk('MThd', hex('00 01 00 02 01 e0')),
      ...chunk('MTrk', [...hex('00 ff 03 05 46 6c 75 74 65 00 90 48 40 83 60 80 48 00'), ...end]),
      ...chunk('MTrk', [...hex('00 91 30 40 83 60 81 30 00'), ...end]),
    ]);
    const song = parseMidi(bytes, 'Fallback');
    expect(song.title).toBe('Fallback');
    expect(song.tracks.map((t) => t.name)).toEqual(['Flute', '']);
  });

  it('summarizes each note track', () => {
    const bytes = buildMidi((m) => {
      const t = m.addTrack();
      t.name = 'Right Hand';
      t.addNote({ midi: 67, time: 0, duration: 1 });
      t.addNote({ midi: 72, time: 1, duration: 1 });
      m.addTrack();
    });
    expect(parseMidi(bytes, 'x').tracks).toEqual([
      {
        index: 0,
        name: 'Right Hand',
        instrument: 'acoustic grand piano',
        noteCount: 2,
        minPitch: 67,
        maxPitch: 72,
      },
    ]);
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

  it('uses names for any number of tracks when both hands are named', () => {
    const hands = handsByTrack([
      { index: 0, name: 'RH', meanPitch: 50 },
      { index: 1, name: 'Bass', meanPitch: 70 },
      { index: 2, name: 'Treble 2', meanPitch: 72 },
    ]);
    expect([...hands!.entries()]).toEqual([
      [0, 'right'],
      [1, 'left'],
      [2, 'right'],
    ]);
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
    autoHand: 'right',
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
