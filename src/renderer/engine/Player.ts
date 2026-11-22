import { MIN_SESSION_SECONDS } from '@shared/history';
import type { HandFocus, OtherHandMode, PracticeMode } from '@shared/settings';
import { resolveHand, type Beat, type HandOverride, type Note, type Song } from '@shared/song';
import type { NoteInputEvent } from '@renderer/input';
import type { Clock } from './clock';
import { EventScheduler } from './EventScheduler';
import { loopFrom, loopStartAt, type LoopRegion } from './loop';
import { EMPTY_STATS, PracticeSession, type KeyFeedback, type PracticeStats } from './practice';
import { Transport } from './Transport';

export const LEAD_IN = 2;
const TICK_MS = 25;

export type NoteSink = {
  play(pitch: number, velocity: number, when: number, duration: number): void;
  stopAll(): void;
};

export type PlayerAudio = {
  notes: NoteSink;
  click(when: number, accent: boolean): void;
  resume(): void;
};

export type PlayerOptions = {
  mode: PracticeMode;
  metronome: boolean;
  focus: HandFocus;
  otherHand: OtherHandMode;
  hands: HandOverride;
};

export type PlayerState = PlayerOptions & {
  loop: LoopRegion | null;
  loopDraftStart: number | null;
  stats: PracticeStats;
};

export type PracticeSegment = {
  mode: PracticeMode;
  focus: HandFocus;
  tempo: number;
  playTime: number;
  stats: PracticeStats;
  completed: boolean;
  startedAt: number;
};

export type PlayerHooks = {
  onSegment?: (segment: PracticeSegment) => void;
  wallNow?: () => number;
};

type Segment = {
  playTime: number;
  rateTime: number;
  startedAt: number | null;
  fromTop: boolean;
  skipped: boolean;
  looped: boolean;
};

const freshSegment = (): Segment => ({
  playTime: 0,
  rateTime: 0,
  startedAt: null,
  fromTop: false,
  skipped: false,
  looped: false,
});

const TOP_TOLERANCE = 0.5;
const SKIP_TOLERANCE = 1;

export const isNoteActive = (note: Note, focus: HandFocus) =>
  focus === 'both' || note.hand === focus;

export class Player {
  readonly transport: Transport;
  private readonly notes: EventScheduler<Note>;
  private readonly beats: EventScheduler<Beat>;
  private readonly timer: ReturnType<typeof setInterval>;
  private readonly unsubscribe: () => void;
  private practice: PracticeSession;
  private state: PlayerState;
  private listeners = new Set<() => void>();
  private resumeAfterScrub = false;
  private segment = freshSegment();
  private lastTick: number;

  constructor(
    readonly song: Song,
    private readonly clock: Clock,
    private readonly audio: PlayerAudio,
    options: PlayerOptions,
    private readonly hooks: PlayerHooks = {},
  ) {
    this.lastTick = clock.now();
    this.transport = new Transport(clock, { duration: song.duration, start: -LEAD_IN });
    this.state = { ...options, loop: null, loopDraftStart: null, stats: EMPTY_STATS };
    this.applyHands(options.hands);
    this.practice = this.createPractice();

    this.notes = new EventScheduler(song.notes, this.transport, clock, (note, when, rate) => {
      if (this.shouldSound(note)) {
        audio.notes.play(note.pitch, note.velocity, when, note.duration / rate);
      }
    });
    this.beats = new EventScheduler(song.beats, this.transport, clock, (beat, when) => {
      if (this.state.metronome) audio.click(when, beat.downbeat);
    });

    this.unsubscribe = this.transport.subscribe((event) => {
      if (event === 'play') return audio.resume();
      if (event === 'end') {
        this.finishSegment(true);
        this.restartPractice({});
      }
      audio.notes.stopAll();
      if (event === 'seek') this.practice.reset();
      this.notes.reset();
      this.beats.reset();
    });

    this.timer = setInterval(this.tick, TICK_MS);
  }

  getState = (): PlayerState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  position = (): number => this.transport.position();

  isActive = (note: Note): boolean => isNoteActive(note, this.state.focus);

  keyFeedback(): ReadonlyMap<number, KeyFeedback> {
    return this.practice.keyFeedback();
  }

  handleInput(event: NoteInputEvent): void {
    if (event.type === 'on') this.practice.noteOn(event.pitch);
    else this.practice.noteOff(event.pitch);
  }

  setMode(mode: PracticeMode): void {
    if (mode !== this.state.mode) this.restartPractice({ mode });
  }

  setFocus(focus: HandFocus): void {
    if (focus !== this.state.focus) this.restartPractice({ focus });
  }

  setHands(hands: HandOverride): void {
    this.applyHands(hands);
    this.restartPractice({ hands });
  }

  setOtherHand(otherHand: OtherHandMode): void {
    this.update({ otherHand });
  }

  setMetronome(metronome: boolean): void {
    this.update({ metronome });
  }

  cycleLoop(): void {
    const { loop, loopDraftStart } = this.state;
    const position = this.position();
    if (loop) return this.update({ loop: null, loopDraftStart: null });
    if (loopDraftStart === null) {
      return this.update({ loopDraftStart: loopStartAt(this.song, position) });
    }
    const region = loopFrom(this.song, loopDraftStart, position);
    this.segment.looped = true;
    this.update({ loop: region, loopDraftStart: null });
    this.transport.seek(region.start);
  }

  beginScrub(): void {
    this.resumeAfterScrub = this.transport.getState().playing;
    this.transport.pause();
  }

  scrubTo(time: number): void {
    if (time > this.position() + SKIP_TOLERANCE) this.segment.skipped = true;
    this.transport.seek(time);
  }

  endScrub(): void {
    if (this.resumeAfterScrub) this.transport.play();
    this.resumeAfterScrub = false;
  }

  restart(): void {
    this.transport.seek(this.state.loop?.start ?? this.transport.getState().start);
    this.restartPractice({});
  }

  destroy(): void {
    this.finishSegment(false);
    clearInterval(this.timer);
    this.unsubscribe();
    this.practice.dispose();
    this.audio.notes.stopAll();
  }

  private tick = (): void => {
    this.transport.tick();
    this.trackTime();
    const { loop } = this.state;
    if (loop && this.transport.getState().playing && this.position() >= loop.end) {
      this.transport.seek(loop.start);
    }
    this.practice.update();
    this.notes.update();
    this.beats.update();
  };

  private shouldSound(note: Note): boolean {
    const { mode, otherHand } = this.state;
    if (mode === 'watch') return true;
    return !this.isActive(note) && otherHand === 'play';
  }

  private applyHands(override: HandOverride): void {
    for (const note of this.song.notes) note.hand = resolveHand(note, override);
  }

  private trackTime(): void {
    const now = this.clock.now();
    const dt = now - this.lastTick;
    this.lastTick = now;
    const { playing, rate } = this.transport.getState();
    if (!playing || dt <= 0) return;
    const seg = this.segment;
    if (seg.startedAt === null) {
      seg.startedAt = (this.hooks.wallNow ?? Date.now)();
      seg.fromTop = this.position() <= (this.song.notes[0]?.start ?? 0) + TOP_TOLERANCE;
    }
    seg.playTime += dt;
    seg.rateTime += dt * rate;
  }

  private finishSegment(reachedEnd: boolean): void {
    const seg = this.segment;
    this.segment = freshSegment();
    if (seg.playTime < MIN_SESSION_SECONDS || seg.startedAt === null) return;
    const { mode, focus, stats, loop } = this.state;
    this.hooks.onSegment?.({
      mode,
      focus,
      stats,
      playTime: seg.playTime,
      tempo: seg.rateTime / seg.playTime,
      completed: reachedEnd && seg.fromTop && !seg.skipped && !seg.looped && !loop,
      startedAt: seg.startedAt,
    });
  }

  private restartPractice(patch: Partial<PlayerState>): void {
    this.finishSegment(false);
    this.practice.dispose();
    this.state = { ...this.state, ...patch, stats: EMPTY_STATS };
    this.practice = this.createPractice();
    this.update({});
  }

  private createPractice(): PracticeSession {
    return new PracticeSession(this.state.mode, this.song, this.transport, this.isActive, (stats) =>
      this.update({ stats }),
    );
  }

  private update(patch: Partial<PlayerState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
