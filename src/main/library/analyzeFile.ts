import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { summarizeSong, type SongSummary } from '@shared/analysis';
import type { HandOverride } from '@shared/song';

export type AnalyzeResult =
  { path: string; id: string; summary: SongSummary } | { path: string; error: string };

export const MIDI_EXTENSIONS = new Set(['.mid', '.midi']);

export const titleFromPath = (path: string) =>
  basename(path, extname(path))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const songIdFor = (bytes: Uint8Array) =>
  createHash('sha1').update(bytes).digest('hex').slice(0, 16);

export function analyzeFile(path: string, overrides: Record<string, HandOverride>): AnalyzeResult {
  try {
    const bytes = new Uint8Array(readFileSync(path));
    const id = songIdFor(bytes);
    return { path, id, summary: summarizeSong(bytes, titleFromPath(path), overrides[id]) };
  } catch (error) {
    return { path, error: error instanceof Error ? error.message : String(error) };
  }
}
