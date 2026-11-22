import { useEffect, useState, useSyncExternalStore } from 'react';
import { dayKey } from '@shared/history';
import { parseMidi, type Song } from '@shared/song';
import { getAudioContext, loadPianoSampler, Metronome, type PianoSampler } from '@renderer/audio';
import {
  audioClock,
  Player,
  type PlayerState,
  type Transport,
  type TransportState,
} from '@renderer/engine';
import { inputHub, PedalTaps } from '@renderer/input';
import { useSetting, useSettingsStore } from '@renderer/state/settingsStore';

export type PlayerSession =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; player: Player; song: Song; songId: string };

export function usePlayerSession(songId: string): PlayerSession {
  const [session, setSession] = useState<PlayerSession>({ status: 'loading' });
  const [sampler, setSampler] = useState<PianoSampler | null>(null);
  const volume = useSetting('volume');
  const metronome = useSetting('metronome');
  const otherHand = useSetting('otherHand');
  const player = session.status === 'ready' ? session.player : null;

  useEffect(() => {
    let created: Player | null = null;
    let live = true;

    (async () => {
      const file = await window.api.songs.load(songId);
      if (!file) throw new Error('Song not found.');
      const song = parseMidi(file.bytes, file.ref.title);
      const ctx = getAudioContext();
      const loaded = await loadPianoSampler(ctx);
      if (!live) return;
      const click = new Metronome(ctx, loaded.output);
      const settings = useSettingsStore.getState().values;
      created = new Player(
        song,
        audioClock(ctx),
        {
          notes: loaded,
          click: (when, accent) => click.click(when, accent),
          resume: () => void ctx.resume(),
        },
        {
          mode: settings.practiceMode,
          metronome: settings.metronome,
          otherHand: settings.otherHand,
          focus: 'both',
          hands: file.ref.hands,
        },
        {
          onSegment: ({ stats, ...segment }) =>
            void window.api.history
              .record({
                ...segment,
                songId,
                hits: stats.hits,
                misses: stats.misses,
                wrong: stats.wrong,
                day: dayKey(new Date(segment.startedAt)),
              })
              .catch((error: unknown) => console.error('Could not save practice', error)),
        },
      );
      setSampler(loaded);
      setSession({ status: 'ready', player: created, song, songId });
    })().catch((error: unknown) => {
      if (live) setSession({ status: 'error', message: String(error) });
    });

    return () => {
      live = false;
      created?.destroy();
    };
  }, [songId]);

  useEffect(() => sampler?.setVolume(volume), [sampler, volume]);
  useEffect(() => player?.setMetronome(metronome), [player, metronome]);
  useEffect(() => player?.setOtherHand(otherHand), [player, otherHand]);
  usePlayerInput(player, sampler);
  usePedalControl(player);

  return session;
}

function usePlayerInput(player: Player | null, sampler: PianoSampler | null): void {
  useEffect(() => {
    if (!player) return;
    const voices = new Map<number, () => void>();
    const unsubscribe = inputHub.subscribe((event) => {
      player.handleInput(event);
      if (event.source !== 'touch' || !sampler) return;
      voices.get(event.pitch)?.();
      voices.delete(event.pitch);
      if (event.type === 'on') {
        const release = sampler.noteOn(event.pitch, event.velocity);
        if (release) voices.set(event.pitch, release);
      }
    });
    return () => {
      unsubscribe();
      inputHub.releaseSource('touch');
      for (const release of voices.values()) release();
    };
  }, [player, sampler]);
}

function usePedalControl(player: Player | null): void {
  const pedal = useSetting('pedalControl');
  useEffect(() => {
    if (!player || pedal === 'off') return;
    const taps = new PedalTaps((tap) => {
      if (tap === 'single') return player.transport.toggle();
      player.restart();
      player.transport.play();
    });
    return inputHub.subscribePedal((event) => {
      if (event.pedal === pedal) taps.update(event.down, performance.now());
    });
  }, [player, pedal]);
}

export function useTransportState(transport: Transport): TransportState {
  return useSyncExternalStore(transport.subscribe, transport.getState);
}

export function usePlayerState(player: Player): PlayerState {
  return useSyncExternalStore(player.subscribe, player.getState);
}

export function usePosition(player: Player, fps = 15): number {
  const [position, setPosition] = useState(player.position);
  useEffect(() => {
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last >= 1000 / fps) {
        last = now;
        setPosition(player.position());
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [player, fps]);
  return position;
}
