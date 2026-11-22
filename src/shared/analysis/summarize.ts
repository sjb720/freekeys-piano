import { parseMidi, resolveHand, type HandOverride, type HandSource } from '../song';
import { analyzeDifficulty, type Difficulty } from './difficulty';

export type SongSummary = {
  title: string;
  duration: number;
  noteCount: number;
  handSource: HandSource;
  difficulty: Difficulty;
};

export function summarizeSong(
  bytes: Uint8Array,
  fallbackTitle: string,
  hands?: HandOverride,
): SongSummary {
  const song = parseMidi(bytes, fallbackTitle);
  if (hands) for (const note of song.notes) note.hand = resolveHand(note, hands);
  return {
    title: song.title,
    duration: song.duration,
    noteCount: song.notes.length,
    handSource: song.handSource,
    difficulty: analyzeDifficulty(song),
  };
}
