import type { Song } from '@shared/song';
import type { Clock } from './clock';
import { Scheduler, type NoteSink } from './Scheduler';
import { Transport } from './Transport';

export const LEAD_IN = 2;
const TICK_MS = 25;

export class Player {
  readonly transport: Transport;
  private readonly scheduler: Scheduler;
  private readonly timer: ReturnType<typeof setInterval>;
  private readonly unsubscribe: () => void;
  private resumeAfterScrub = false;

  constructor(
    readonly song: Song,
    clock: Clock,
    sink: NoteSink,
    private readonly onPlay: () => void = () => {},
  ) {
    this.transport = new Transport(clock, { duration: song.duration, start: -LEAD_IN });
    this.scheduler = new Scheduler(song, this.transport, clock, sink);
    this.unsubscribe = this.transport.subscribe((event) => {
      if (event === 'play') this.onPlay();
      if (event !== 'play') this.scheduler.reset();
    });
    this.timer = setInterval(() => {
      this.transport.tick();
      this.scheduler.update();
    }, TICK_MS);
  }

  position = (): number => this.transport.position();

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
    this.transport.seek(this.transport.getState().start);
  }

  destroy(): void {
    clearInterval(this.timer);
    this.unsubscribe();
    this.scheduler.reset();
  }
}
