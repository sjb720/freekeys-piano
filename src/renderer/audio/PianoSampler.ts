import { nearestSample, playbackRateFor, SAMPLE_PITCHES } from './samples';

const RELEASE = 0.12;
const SAMPLE_DIR = 'audio/piano/';

type Voice = { source: AudioBufferSourceNode; gain: GainNode };

export class PianoSampler {
  readonly output: GainNode;
  private buffers = new Map<number, AudioBuffer>();
  private voices = new Set<Voice>();

  constructor(private readonly ctx: AudioContext) {
    this.output = ctx.createGain();
    this.output.connect(ctx.destination);
  }

  async load(): Promise<void> {
    await Promise.all(
      SAMPLE_PITCHES.map(async (pitch) => {
        const response = await fetch(new URL(`${SAMPLE_DIR}${pitch}.mp3`, document.baseURI));
        this.buffers.set(pitch, await this.ctx.decodeAudioData(await response.arrayBuffer()));
      }),
    );
  }

  setVolume(volume: number): void {
    this.output.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
  }

  play(pitch: number, velocity: number, when: number, duration: number): void {
    const sample = nearestSample(pitch);
    const buffer = this.buffers.get(sample);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRateFor(pitch, sample);

    const gain = this.ctx.createGain();
    const end = when + Math.max(duration, 0.05);
    gain.gain.setValueAtTime(velocity ** 1.5, when);
    gain.gain.setTargetAtTime(0, end, RELEASE);

    source.connect(gain).connect(this.output);
    source.start(when);
    source.stop(end + RELEASE * 6);

    const voice = { source, gain };
    this.voices.add(voice);
    source.onended = () => {
      gain.disconnect();
      this.voices.delete(voice);
    };
  }

  stopAll(): void {
    const now = this.ctx.currentTime;
    for (const { source, gain } of this.voices) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.03);
      source.stop(now + 0.2);
    }
  }
}

let shared: Promise<PianoSampler> | null = null;

export function loadPianoSampler(ctx: AudioContext): Promise<PianoSampler> {
  shared ??= (async () => {
    const sampler = new PianoSampler(ctx);
    await sampler.load();
    return sampler;
  })().catch((error: unknown) => {
    shared = null;
    throw error;
  });
  return shared;
}
