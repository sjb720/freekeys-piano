import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Note, Song } from '@shared/song';
import { Player } from './Player';

const note = (id: number, start: number, pitch: number): Note => ({
  id,
  pitch,
  start,
  duration: 0.4,
  velocity: 0.8,
  hand: 'right',
  track: 0,
});

const song = {
  notes: [note(0, 0, 60), note(1, 1, 62), note(2, 3, 64)],
  beats: [0, 1, 2, 3].map((start) => ({ start, downbeat: start === 0 })),
  measures: [0, 2, 4],
  duration: 4,
} as Song;

describe('Player', () => {
  let time = 0;
  const played: number[] = [];
  const clicks: number[] = [];
  const audio = {
    notes: { play: (pitch: number) => played.push(pitch), stopAll: () => {} },
    click: (when: number) => clicks.push(when),
    resume: () => {},
  };
  const create = (mode: 'watch' | 'wait' | 'playAlong', metronome = false) =>
    new Player(song, { now: () => time }, audio, { mode, metronome });

  beforeEach(() => {
    vi.useFakeTimers();
    time = 0;
    played.length = 0;
    clicks.length = 0;
  });
  afterEach(() => vi.useRealTimers());

  const run = (seconds: number) => {
    for (let t = 0; t < seconds; t += 0.025) {
      time += 0.025;
      vi.advanceTimersByTime(25);
    }
  };

  it('plays every note in watch mode', () => {
    const player = create('watch');
    player.transport.play();
    run(6.5);
    expect(played).toEqual([60, 62, 64]);
    player.destroy();
  });

  it('stays silent for active notes and waits in wait mode', () => {
    const player = create('wait');
    player.transport.play();
    run(5);
    expect(player.position()).toBe(0);
    player.handleInput({ type: 'on', pitch: 60, velocity: 1, source: 'touch' });
    run(1.5);
    expect(player.position()).toBe(1);
    expect(played).toEqual([]);
    player.destroy();
  });

  it('clicks the metronome only when enabled', () => {
    const player = create('watch', true);
    player.transport.play();
    run(3.5);
    expect(clicks.length).toBeGreaterThanOrEqual(2);
    player.setMetronome(false);
    const count = clicks.length;
    run(2);
    expect(clicks.length).toBe(count);
    player.destroy();
  });

  it('cycles loop: draft start, region, clear', () => {
    const player = create('watch');
    player.scrubTo(0.5);
    player.cycleLoop();
    expect(player.getState().loopDraftStart).toBe(0);
    player.scrubTo(2.5);
    player.cycleLoop();
    expect(player.getState().loop).toEqual({ start: 0, end: 4 });
    expect(player.position()).toBe(0);
    player.cycleLoop();
    expect(player.getState().loop).toBeNull();
    player.destroy();
  });

  it('jumps back to the loop start at the loop end', () => {
    const player = create('watch');
    player.scrubTo(0);
    player.cycleLoop();
    player.cycleLoop();
    expect(player.getState().loop).toEqual({ start: 0, end: 2 });
    player.transport.play();
    run(2.1);
    expect(player.position()).toBeLessThan(0.5);
    player.destroy();
  });

  it('resets stats when the mode changes', () => {
    const player = create('playAlong');
    player.handleInput({ type: 'on', pitch: 50, velocity: 1, source: 'touch' });
    expect(player.getState().stats.wrong).toBe(1);
    player.setMode('wait');
    expect(player.getState().stats.wrong).toBe(0);
    player.destroy();
  });
});
