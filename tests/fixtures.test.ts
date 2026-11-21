import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMidi } from '@shared/song';

const DIR = join(process.cwd(), 'fixtures', 'local');
const files = (() => {
  try {
    return readdirSync(DIR).filter((f) => /\.midi?$/i.test(f));
  } catch {
    return [];
  }
})();

describe.skipIf(files.length === 0)('local MIDI fixtures', () => {
  it.each(files)('%s parses into a playable song', (file) => {
    const song = parseMidi(new Uint8Array(readFileSync(join(DIR, file))), file);
    expect(song.notes.length).toBeGreaterThan(0);
    expect(song.duration).toBeGreaterThan(0);
    expect(song.measures.length).toBeGreaterThan(0);
    expect(song.beats.length).toBeGreaterThan(0);
    expect(new Set(song.notes.map((n) => n.hand)).size).toBe(2);
    console.log(
      `${file}: ${song.notes.length} notes, ${song.duration.toFixed(1)}s, ` +
        `${song.measures.length} measures, range ${song.pitchRange.min}-${song.pitchRange.max}, ` +
        `left ${song.notes.filter((n) => n.hand === 'left').length}`,
    );
  });
});
