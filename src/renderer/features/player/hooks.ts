import { useEffect, useState, useSyncExternalStore } from 'react';
import { parseMidi, type Song } from '@shared/song';
import { getAudioContext, loadPianoSampler, type PianoSampler } from '@renderer/audio';
import { audioClock, Player, type Transport, type TransportState } from '@renderer/engine';
import { useSetting } from '@renderer/state/settingsStore';

export type PlayerSession =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; player: Player; song: Song };

export function usePlayerSession(songId: string): PlayerSession {
  const [session, setSession] = useState<PlayerSession>({ status: 'loading' });
  const [sampler, setSampler] = useState<PianoSampler | null>(null);
  const volume = useSetting('volume');

  useEffect(() => {
    let player: Player | null = null;
    let live = true;

    (async () => {
      const file = await window.api.songs.load(songId);
      if (!file) throw new Error('Song not found.');
      const song = parseMidi(file.bytes, file.ref.title);
      const ctx = getAudioContext();
      const loaded = await loadPianoSampler(ctx);
      if (!live) return;
      player = new Player(song, audioClock(ctx), loaded, () => void ctx.resume());
      setSampler(loaded);
      setSession({ status: 'ready', player, song });
    })().catch((error: unknown) => {
      if (live) setSession({ status: 'error', message: String(error) });
    });

    return () => {
      live = false;
      player?.destroy();
    };
  }, [songId]);

  useEffect(() => sampler?.setVolume(volume), [sampler, volume]);

  return session;
}

export function useTransportState(transport: Transport): TransportState {
  return useSyncExternalStore(transport.subscribe, transport.getState);
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
