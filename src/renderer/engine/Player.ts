import type { PracticeMode } from '@shared/settings';
import type { Beat, Note, Song } from '@shared/song';
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

export type PlayerState = {
  mode: PracticeMode;
  metronome: boolean;
  loop: LoopRegion | null;
  loopDraftStart: number | null;
  stats: PracticeStats;
};

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

  constructor(
    readonly song: Song,
    clock: Clock,
    private readonly audio: PlayerAudio,
    options: { mode: PracticeMode; metronome: boolean },
  ) {
    this.transport = new Transport(clock, { duration: song.duration, start: -LEAD_IN });
    this.state = { ...options, loop: null, loopDraftStart: null, stats: EMPTY_STATS };
    this.practice = this.createPractice(options.mode);

    this.notes = new EventScheduler(song.notes, this.transport, clock, (note, when, rate) => {
      if (this.state.mode === 'watch' || !this.practice.isActive(note)) {
        audio.notes.play(note.pitch, note.velocity, when, note.duration / rate);
      }
    });
    this.beats = new EventScheduler(song.beats, this.transport, clock, (beat, when) => {
      if (this.state.metronome) audio.click(when, beat.downbeat);
    });

    this.unsubscribe = this.transport.subscribe((event) => {
      if (event === 'play') return audio.resume();
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

  keyFeedback(): ReadonlyMap<number, KeyFeedback> {
    return this.practice.keyFeedback();
  }

  handleInput(event: NoteInputEvent): void {
    if (event.type === 'on') this.practice.noteOn(event.pitch);
    else this.practice.noteOff(event.pitch);
  }

  setMode(mode: PracticeMode): void {
    if (mode === this.state.mode) return;
    this.practice.dispose();
    this.practice = this.createPractice(mode);
    this.update({ mode, stats: EMPTY_STATS });
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
    this.update({ loop: region, loopDraftStart: null });
    this.transport.seek(region.start);
  }

  beginScrub(): void {
    this.resumeAfterScrub = this.transport.getState().playing;
    this.transport.pause();
  }

  scrubTo(time: number): void {
    this.transport.seek(time);
  }

  endScrub(): void {
    if (this.resumeAfterScrub) this.transport.play();
    this.resumeAfterScrub = false;
  }

  restart(): void {
    this.practice.dispose();
    this.transport.seek(this.state.loop?.start ?? this.transport.getState().start);
    this.practice = this.createPractice(this.state.mode);
    this.update({ stats: EMPTY_STATS });
  }

  destroy(): void {
    clearInterval(this.timer);
    this.unsubscribe();
    this.practice.dispose();
    this.audio.notes.stopAll();
  }

  private tick = (): void => {
    this.transport.tick();
    const { loop } = this.state;
    if (loop && this.transport.getState().playing && this.position() >= loop.end) {
      this.transport.seek(loop.start);
    }
    this.practice.update();
    this.notes.update();
    this.beats.update();
  };

  private createPractice(mode: PracticeMode): PracticeSession {
    return new PracticeSession(
      mode,
      this.song,
      this.transport,
      () => true,
      (stats) => this.update({ stats }),
    );
  }

  private update(patch: Partial<PlayerState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
