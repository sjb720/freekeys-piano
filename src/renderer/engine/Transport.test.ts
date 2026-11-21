import { beforeEach, describe, expect, it } from 'vitest';
import { Transport } from './Transport';

let time = 0;
const clock = { now: () => time };

describe('Transport', () => {
  let t: Transport;
  beforeEach(() => {
    time = 100;
    t = new Transport(clock, { duration: 10, start: -2 });
  });

  it('starts paused at the lead-in position', () => {
    expect(t.position()).toBe(-2);
    expect(t.getState().playing).toBe(false);
  });

  it('advances with the clock while playing', () => {
    t.play();
    time += 3;
    expect(t.position()).toBe(1);
  });

  it('holds position while paused', () => {
    t.play();
    time += 3;
    t.pause();
    time += 5;
    expect(t.position()).toBe(1);
  });

  it('scales by rate', () => {
    t.seek(0);
    t.setRate(0.5);
    t.play();
    time += 4;
    expect(t.position()).toBe(2);
  });

  it('keeps position continuous across rate changes', () => {
    t.seek(0);
    t.play();
    time += 2;
    t.setRate(0.5);
    time += 2;
    expect(t.position()).toBe(3);
  });

  it('maps song time to clock time', () => {
    t.seek(0);
    t.setRate(0.5);
    t.play();
    expect(t.toClockTime(2)).toBe(104);
  });

  it('clamps seek and rate', () => {
    t.seek(-50);
    expect(t.position()).toBe(-2);
    t.seek(50);
    expect(t.position()).toBe(10);
    t.setRate(10);
    expect(t.getState().rate).toBe(1.5);
  });

  it('ends at the duration and restarts on play', () => {
    const events: string[] = [];
    t.subscribe((e) => events.push(e));
    t.seek(9);
    t.play();
    time += 2;
    t.tick();
    expect(t.getState().playing).toBe(false);
    expect(t.position()).toBe(10);
    t.play();
    expect(t.position()).toBe(-2);
    expect(events).toEqual(['seek', 'play', 'end', 'play']);
  });

  it('replaces state snapshot only on change', () => {
    const before = t.getState();
    expect(t.getState()).toBe(before);
    t.play();
    expect(t.getState()).not.toBe(before);
  });
});
