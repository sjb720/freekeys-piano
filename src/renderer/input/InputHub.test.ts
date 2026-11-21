import { describe, expect, it } from 'vitest';
import { InputHub } from './InputHub';
import type { NoteInputEvent } from './types';

const on = (pitch: number, source: NoteInputEvent['source'] = 'midi'): NoteInputEvent => ({
  type: 'on',
  pitch,
  velocity: 1,
  source,
});
const off = (pitch: number, source: NoteInputEvent['source'] = 'midi'): NoteInputEvent => ({
  type: 'off',
  pitch,
  velocity: 0,
  source,
});

describe('InputHub', () => {
  it('tracks held notes and notifies listeners', () => {
    const hub = new InputHub();
    const seen: string[] = [];
    hub.subscribe((e) => seen.push(`${e.type}${e.pitch}`));
    hub.emit(on(60));
    hub.emit(on(64));
    hub.emit(off(60));
    expect([...hub.heldNotes().keys()]).toEqual([64]);
    expect(seen).toEqual(['on60', 'on64', 'off60']);
  });

  it('drops note off for notes that are not held', () => {
    const hub = new InputHub();
    const seen: string[] = [];
    hub.subscribe((e) => seen.push(e.type));
    hub.emit(off(60));
    expect(seen).toEqual([]);
  });

  it('releases every note from one source', () => {
    const hub = new InputHub();
    hub.emit(on(60, 'touch'));
    hub.emit(on(62, 'midi'));
    hub.releaseSource('touch');
    expect([...hub.heldNotes().keys()]).toEqual([62]);
  });
});
