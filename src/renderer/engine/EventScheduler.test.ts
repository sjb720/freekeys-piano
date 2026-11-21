import { describe, expect, it } from 'vitest';
import { EventScheduler } from './EventScheduler';
import { Transport } from './Transport';

const events = [0, 0.05, 0.5, 1].map((start, id) => ({ id, start }));

function setup() {
  let time = 10;
  const clock = { now: () => time };
  const emitted: { id: number; when: number }[] = [];
  const transport = new Transport(clock, { duration: 2 });
  const scheduler = new EventScheduler(events, transport, clock, (e, when) =>
    emitted.push({ id: e.id, when }),
  );
  return { transport, scheduler, emitted, advance: (s: number) => (time += s) };
}

describe('EventScheduler', () => {
  it('emits events inside the lookahead window once', () => {
    const { transport, scheduler, emitted, advance } = setup();
    transport.play();
    scheduler.update();
    scheduler.update();
    expect(emitted.map((e) => e.id)).toEqual([0, 1]);
    advance(0.45);
    scheduler.update();
    expect(emitted).toHaveLength(3);
    expect(emitted[2]!.when).toBeCloseTo(10.5);
  });

  it('does nothing while paused', () => {
    const { scheduler, emitted } = setup();
    scheduler.update();
    expect(emitted).toHaveLength(0);
  });

  it('restarts from the new position after reset', () => {
    const { transport, scheduler, emitted } = setup();
    transport.play();
    scheduler.update();
    transport.seek(0.95);
    scheduler.reset();
    scheduler.update();
    expect(emitted.map((e) => e.id)).toEqual([0, 1, 3]);
  });

  it('never schedules past the gate', () => {
    const { transport, scheduler, emitted, advance } = setup();
    transport.setGate(0.5);
    transport.play();
    advance(1);
    scheduler.update();
    expect(emitted.map((e) => e.id)).toEqual([0, 1]);
    transport.setGate(null);
    scheduler.update();
    expect(emitted.map((e) => e.id)).toEqual([0, 1, 2]);
    expect(emitted[2]!.when).toBe(11);
  });
});
