import { describe, expect, it } from 'vitest';
import type { Note, Song } from '@shared/song';
import { Scheduler } from './Scheduler';
import { Transport } from './Transport';

const note = (id: number, start: number, pitch = 60): Note => ({
  id,
  pitch,
  start,
  duration: 0.5,
  velocity: 0.8,
  hand: pitch >= 60 ? 'right' : 'left',
  track: 0,
});

const song = { notes: [note(0, 0), note(1, 0.05, 48), note(2, 0.5), note(3, 1)] } as Song;

function setup(shouldPlay?: (n: Note) => boolean) {
  let time = 10;
  const clock = { now: () => time };
  const played: { pitch: number; when: number }[] = [];
  let stops = 0;
  const transport = new Transport(clock, { duration: 2 });
  const scheduler = new Scheduler(
    song,
    transport,
    clock,
    { play: (pitch, _v, when) => played.push({ pitch, when }), stopAll: () => stops++ },
    shouldPlay,
  );
  return { transport, scheduler, played, advance: (s: number) => (time += s), stops: () => stops };
}

describe('Scheduler', () => {
  it('schedules notes inside the lookahead window once', () => {
    const { transport, scheduler, played, advance } = setup();
    transport.play();
    scheduler.update();
    scheduler.update();
    expect(played.map((p) => p.pitch)).toEqual([60, 48]);
    advance(0.45);
    scheduler.update();
    expect(played).toHaveLength(3);
    expect(played[2]!.when).toBeCloseTo(10.5);
  });

  it('does nothing while paused', () => {
    const { scheduler, played } = setup();
    scheduler.update();
    expect(played).toHaveLength(0);
  });

  it('restarts from the new position after reset', () => {
    const { transport, scheduler, played, stops } = setup();
    transport.play();
    scheduler.update();
    transport.seek(0.95);
    scheduler.reset();
    scheduler.update();
    expect(stops()).toBe(1);
    expect(played.at(-1)!.pitch).toBe(60);
    expect(played).toHaveLength(3);
  });

  it('applies the note filter', () => {
    const { transport, scheduler, played } = setup((n) => n.hand === 'right');
    transport.play();
    scheduler.update();
    expect(played.map((p) => p.pitch)).toEqual([60]);
  });
});
