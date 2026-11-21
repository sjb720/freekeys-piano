import { describe, expect, it } from 'vitest';
import type { Note, Song } from '@shared/song';
import { Transport } from '../Transport';
import { PlayAlongGrader } from './PlayAlongGrader';
import { PracticeSession, type PracticeStats } from './PracticeSession';
import { buildSteps } from './steps';
import { WaitMode } from './WaitMode';

let nextId = 0;
const note = (start: number, pitch: number, hand: Note['hand'] = 'right'): Note => ({
  id: nextId++,
  pitch,
  start,
  duration: 0.4,
  velocity: 0.8,
  hand,
  track: 0,
});

const all = () => true;

describe('buildSteps', () => {
  it('groups near-simultaneous notes into chords and filters inactive notes', () => {
    const notes = [note(0, 60), note(0.02, 64), note(0, 48, 'left'), note(1, 62)].sort(
      (a, b) => a.start - b.start,
    );
    const steps = buildSteps(notes, (n) => n.hand === 'right');
    expect(steps.map((s) => [s.start, [...s.pitches]])).toEqual([
      [0, [60, 64]],
      [1, [62]],
    ]);
  });
});

describe('WaitMode', () => {
  const steps = buildSteps([note(1, 60), note(1, 64), note(2, 62)], all);

  it('advances only when every pitch of the chord is played', () => {
    const wait = new WaitMode(steps);
    wait.reset(0);
    expect(wait.gate()).toBe(1);
    expect(wait.onNoteOn(60, 1, 1)).toBe('correct');
    expect(wait.gate()).toBe(1);
    expect(wait.onNoteOn(60, 1, 1)).toBe('ignored');
    expect(wait.onNoteOn(64, 1, 1)).toBe('correct');
    expect(wait.gate()).toBe(2);
  });

  it('rejects wrong pitches and presses that are too early', () => {
    const wait = new WaitMode(steps);
    wait.reset(0);
    expect(wait.onNoteOn(61, 1, 1)).toBe('wrong');
    expect(wait.onNoteOn(60, 0.5, 1)).toBe('wrong');
    expect(wait.onNoteOn(60, 0.8, 1)).toBe('correct');
  });

  it('resets to the first step at or after the position', () => {
    const wait = new WaitMode(steps);
    wait.reset(1.5);
    expect(wait.gate()).toBe(2);
    wait.reset(1);
    expect(wait.gate()).toBe(1);
  });

  it('has no gate after the last step', () => {
    const wait = new WaitMode(steps);
    wait.reset(3);
    expect(wait.gate()).toBeNull();
  });
});

describe('PlayAlongGrader', () => {
  const notes = [note(1, 60), note(1.1, 60), note(2, 62)];

  it('matches the nearest unmatched note within the window', () => {
    const grader = new PlayAlongGrader(notes);
    expect(grader.onNoteOn(60, 1.12, 1)).toMatchObject({
      judgement: 'correct',
      noteId: notes[1]!.id,
    });
    expect(grader.onNoteOn(60, 1.0, 1)).toMatchObject({
      judgement: 'correct',
      noteId: notes[0]!.id,
    });
    expect(grader.onNoteOn(60, 1.05, 1).judgement).toBe('wrong');
  });

  it('scales the window by rate', () => {
    const grader = new PlayAlongGrader(notes);
    expect(grader.onNoteOn(62, 1.8, 1).judgement).toBe('wrong');
    expect(grader.onNoteOn(62, 1.8, 1.5).judgement).toBe('correct');
  });

  it('counts each unmatched note as a miss once', () => {
    const grader = new PlayAlongGrader(notes);
    grader.onNoteOn(60, 1, 1);
    expect(grader.collectMisses(1.5, 1)).toBe(1);
    expect(grader.collectMisses(3, 1)).toBe(1);
    expect(grader.collectMisses(3, 1)).toBe(0);
  });
});

describe('PracticeSession', () => {
  const notes = [note(0, 60), note(1, 62)];
  const song = { notes } as Song;

  function setup(mode: 'wait' | 'playAlong' | 'watch') {
    let time = 0;
    const transport = new Transport({ now: () => time }, { duration: 3 });
    let stats: PracticeStats | null = null;
    const session = new PracticeSession(mode, song, transport, all, (s) => (stats = s));
    return { transport, session, stats: () => stats, advance: (s: number) => (time += s) };
  }

  it('wait mode gates the transport until the step is played', () => {
    const { transport, session, advance, stats } = setup('wait');
    transport.play();
    advance(0.5);
    expect(transport.position()).toBe(0);
    session.noteOn(60);
    expect(transport.getGate()).toBe(1);
    advance(5);
    expect(transport.position()).toBe(1);
    session.noteOn(61);
    expect(session.keyFeedback().get(61)).toBe('wrong');
    session.noteOn(62);
    expect(transport.getGate()).toBeNull();
    expect(stats()).toEqual({ hits: 2, misses: 0, wrong: 1, accuracy: 2 / 3 });
  });

  it('play-along counts misses as time passes', () => {
    const { transport, session, advance, stats } = setup('playAlong');
    transport.play();
    advance(0.05);
    session.noteOn(60);
    advance(2);
    session.update();
    expect(stats()).toMatchObject({ hits: 1, misses: 1, accuracy: 0.5 });
  });

  it('watch mode only reports pressed keys', () => {
    const { session, stats } = setup('watch');
    session.noteOn(60);
    expect(session.keyFeedback().get(60)).toBe('pressed');
    session.noteOff(60);
    expect(session.keyFeedback().size).toBe(0);
    expect(stats()).toBeNull();
  });

  it('dispose releases the gate', () => {
    const { transport, session } = setup('wait');
    expect(transport.getGate()).toBe(0);
    session.dispose();
    expect(transport.getGate()).toBeNull();
  });
});
