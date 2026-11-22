import { Midi } from '@tonejs/midi';
import { handsByTrack, type TrackSummary } from './hands';
import { beatTicks, measureStartTicks } from './measures';
import { decodeMidiText, isPlaceholderTitle } from './midiText';
import { firstTrackHasNotes, midiFormat, midiTrackCount } from './rawMidi';
import { separateHands } from './separateHands';
import type { Note, Song, SongTrack } from './types';

const PERCUSSION_CHANNEL = 9;

// In format 1 the first track should be a conductor; a name on a track with notes names that track.
function embeddedTitle(midi: Midi, bytes: Uint8Array): string {
  const title = decodeMidiText(midi.name);
  const namesTrack =
    midiFormat(bytes) === 1 && midiTrackCount(bytes) > 1 && firstTrackHasNotes(bytes);
  return namesTrack || isPlaceholderTitle(title) ? '' : title;
}

export function parseMidi(bytes: Uint8Array, fallbackTitle: string): Song {
  const midi = new Midi(bytes);
  const { header } = midi;

  const tracks = midi.tracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => track.notes.length > 0 && track.channel !== PERCUSSION_CHANNEL);

  const songTracks: SongTrack[] = tracks.map(({ track, index }) => {
    const pitches = track.notes.map((n) => n.midi);
    return {
      index,
      name: decodeMidiText(track.name),
      instrument: track.instrument.name,
      noteCount: pitches.length,
      minPitch: Math.min(...pitches),
      maxPitch: Math.max(...pitches),
    };
  });

  const summaries: TrackSummary[] = songTracks.map((t, i) => ({
    index: t.index,
    name: t.name,
    meanPitch: tracks[i]!.track.notes.reduce((sum, n) => sum + n.midi, 0) / t.noteCount,
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
        hand: trackHands?.get(index) ?? 'right',
        autoHand: trackHands?.get(index) ?? 'right',
        track: index,
      })),
    )
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  notes.forEach((n, i) => (n.id = i));
  if (!trackHands) {
    separateHands(notes).forEach((hand, i) => (notes[i]!.hand = notes[i]!.autoHand = hand));
  }

  const endTicks = Math.max(midi.durationTicks, 1);
  const signatures = header.timeSignatures.map((s) => ({
    ticks: s.ticks,
    numerator: s.timeSignature[0] ?? 4,
    denominator: s.timeSignature[1] ?? 4,
  }));
  const measures = measureStartTicks(signatures, endTicks, header.ppq).map((t) =>
    header.ticksToSeconds(t),
  );
  const beats = beatTicks(signatures, endTicks, header.ppq).map((b) => ({
    start: header.ticksToSeconds(b.ticks),
    downbeat: b.downbeat,
  }));

  const pitches = notes.map((n) => n.pitch);

  return {
    title: embeddedTitle(midi, bytes) || fallbackTitle,
    tracks: songTracks,
    duration: notes.reduce((end, n) => Math.max(end, n.start + n.duration), 0),
    notes,
    tempos: header.tempos.map((t) => ({ time: header.ticksToSeconds(t.ticks), bpm: t.bpm })),
    timeSignatures: header.timeSignatures.map((s) => ({
      time: header.ticksToSeconds(s.ticks),
      numerator: s.timeSignature[0] ?? 4,
      denominator: s.timeSignature[1] ?? 4,
    })),
    measures,
    beats,
    pitchRange: {
      min: pitches.length ? Math.min(...pitches) : 60,
      max: pitches.length ? Math.max(...pitches) : 72,
    },
    maxNoteDuration: notes.reduce((max, n) => Math.max(max, n.duration), 0),
    handSource: trackHands ? 'tracks' : 'heuristic',
  };
}
