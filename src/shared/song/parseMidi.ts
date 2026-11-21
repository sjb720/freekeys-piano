import { Midi } from '@tonejs/midi';
import { handBySplit, handsByTrack, type TrackSummary } from './hands';
import { measureStartTicks } from './measures';
import type { Note, Song } from './types';

const PERCUSSION_CHANNEL = 9;

export function parseMidi(bytes: Uint8Array, fallbackTitle: string): Song {
  const midi = new Midi(bytes);
  const { header } = midi;

  const tracks = midi.tracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => track.notes.length > 0 && track.channel !== PERCUSSION_CHANNEL);

  const summaries: TrackSummary[] = tracks.map(({ track, index }) => ({
    index,
    name: track.name,
    meanPitch: track.notes.reduce((sum, n) => sum + n.midi, 0) / track.notes.length,
  }));
  const trackHands = handsByTrack(summaries);

  const notes: Note[] = tracks
    .flatMap(({ track, index }) =>
      track.notes.map((n) => ({
        id: 0,
        pitch: n.midi,
        start: n.time,
        duration: n.duration,
        velocity: n.velocity,
        hand: trackHands?.get(index) ?? handBySplit(n.midi),
        track: index,
      })),
    )
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  notes.forEach((n, i) => (n.id = i));

  const endTicks = Math.max(midi.durationTicks, 1);
  const measures = measureStartTicks(
    header.timeSignatures.map((s) => ({
      ticks: s.ticks,
      numerator: s.timeSignature[0] ?? 4,
      denominator: s.timeSignature[1] ?? 4,
    })),
    endTicks,
    header.ppq,
  ).map((t) => header.ticksToSeconds(t));

  const pitches = notes.map((n) => n.pitch);

  return {
    title: midi.name.trim() || fallbackTitle,
    duration: notes.reduce((end, n) => Math.max(end, n.start + n.duration), 0),
    notes,
    tempos: header.tempos.map((t) => ({ time: header.ticksToSeconds(t.ticks), bpm: t.bpm })),
    timeSignatures: header.timeSignatures.map((s) => ({
      time: header.ticksToSeconds(s.ticks),
      numerator: s.timeSignature[0] ?? 4,
      denominator: s.timeSignature[1] ?? 4,
    })),
    measures,
    pitchRange: {
      min: pitches.length ? Math.min(...pitches) : 60,
      max: pitches.length ? Math.max(...pitches) : 72,
    },
    maxNoteDuration: notes.reduce((max, n) => Math.max(max, n.duration), 0),
  };
}
