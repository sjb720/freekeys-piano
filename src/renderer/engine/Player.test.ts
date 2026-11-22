import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Note, Song } from '@shared/song';
import { Player, type PlayerOptions, type PracticeSegment } from './Player';

const note = (id: number, start: number, pitch: number): Note => ({
  id,
  pitch,
  start,
  duration: 0.4,
  velocity: 0.8,
  hand: pitch < 60 ? 'left' : 'right',
  autoHand: pitch < 60 ? 'left' : 'right',
  track: 0,
});

const song = {
  notes: [note(0, 0, 60), note(1, 0, 48), note(2, 1, 62), note(3, 3, 64)],
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
  const segments: PracticeSegment[] = [];
  const create = (
    mode: 'watch' | 'wait' | 'playAlong',
    metronome = false,
    extra: Partial<PlayerOptions> = {},
    source: Song = song,
  ) =>
    new Player(
      structuredClone(source),
      { now: () => time },
      audio,
      {
        mode,
        metronome,
        focus: 'both',
        otherHand: 'play',
        hands: { kind: 'auto' },
        ...extra,
      },
      { onSegment: (s) => segments.push(s), wallNow: () => 5000 },
    );

  beforeEach(() => {
    vi.useFakeTimers();
    time = 0;
    played.length = 0;
    clicks.length = 0;
    segments.length = 0;
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
    expect(played).toEqual([60, 48, 62, 64]);
    player.destroy();
  });

  it('stays silent for active notes and waits in wait mode', () => {
    const player = create('wait');
    player.transport.play();
    run(5);
    expect(player.position()).toBe(0);
    player.handleInput({ type: 'on', pitch: 60, velocity: 1, source: 'touch' });
    player.handleInput({ type: 'on', pitch: 48, velocity: 1, source: 'touch' });
    run(1.5);
    expect(player.position()).toBe(1);
    expect(played).toEqual([]);
    player.destroy();
  });

  it('plays the other hand when focusing one hand', () => {
    const player = create('wait', false, { focus: 'right' });
    player.transport.play();
    run(2.5);
    expect(player.position()).toBe(0);
    player.handleInput({ type: 'on', pitch: 60, velocity: 1, source: 'touch' });
    run(0.2);
    expect(played).toEqual([48]);
    player.destroy();
  });

  it('mutes the other hand when asked', () => {
    const player = create('wait', false, { focus: 'right', otherHand: 'mute' });
    player.transport.play();
    run(2.5);
    player.handleInput({ type: 'on', pitch: 60, velocity: 1, source: 'touch' });
    run(0.2);
    expect(played).toEqual([]);
    player.destroy();
  });

  it('reassigns hands from an override and keeps the auto hand', () => {
    const player = create('watch');
    player.setHands({ kind: 'swap' });
    expect(player.song.notes.map((n) => n.hand)).toEqual(['left', 'right', 'left', 'left']);
    player.setHands({ kind: 'split', pitch: 62 });
    expect(player.song.notes.map((n) => n.hand)).toEqual(['left', 'left', 'right', 'right']);
    player.setHands({ kind: 'auto' });
    expect(player.song.notes.map((n) => n.hand)).toEqual(['right', 'left', 'right', 'right']);
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

  const long = { ...song, duration: 20 } as Song;

  it('reports a completed run when the song plays through', () => {
    const player = create('playAlong', false, {}, long);
    player.transport.play();
    run(23);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ mode: 'playAlong', completed: true, startedAt: 5000 });
    expect(segments[0]!.playTime).toBeCloseTo(22, 0);
    expect(segments[0]!.stats.misses).toBe(4);
    player.destroy();
    expect(segments).toHaveLength(1);
  });

  it('does not count skipped runs as completed', () => {
    const player = create('watch', false, {}, long);
    player.transport.play();
    run(1);
    player.scrubTo(10);
    run(12);
    expect(segments[0]?.completed).toBe(false);
    player.destroy();
  });

  it('reports a partial run on mode change and ignores short ones', () => {
    const player = create('watch', false, {}, long);
    player.transport.play();
    run(3);
    player.setMode('wait');
    expect(segments).toHaveLength(0);
    run(12);
    player.destroy();
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ mode: 'wait', completed: false, tempo: 1 });
  });
});
