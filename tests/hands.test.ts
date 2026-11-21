import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { handBySplit, parseMidi, separateHands } from '@shared/song';

const load = (path: string) => parseMidi(new Uint8Array(readFileSync(path)), path);

describe('separateHands on real files', () => {
  it.each(['ode-to-joy.mid', 'c-major-scale.mid'])('recovers the hand tracks of %s', (file) => {
    const song = load(join(process.cwd(), 'resources', 'songs', file));
    const guessed = separateHands(song.notes);
    expect(song.notes.every((note, i) => note.hand === guessed[i])).toBe(true);
  });

  const local = join(process.cwd(), 'fixtures', 'local');
  const files = (() => {
    try {
      return readdirSync(local).filter((f) => /\.midi?$/i.test(f));
    } catch {
      return [];
    }
  })();

  it.skipIf(files.length === 0).each(files)('reports the split for %s', (file) => {
    const song = load(join(local, file));
    const guessed = separateHands(song.notes);
    const left = guessed.filter((h) => h === 'left').length;
    const differsFromMiddleC = song.notes.filter((n, i) => handBySplit(n.pitch) !== guessed[i]);
    console.log(
      `${file}: left ${left}/${song.notes.length}, differs from middle-C split on ` +
        `${differsFromMiddleC.length} notes (pitches ${[...new Set(differsFromMiddleC.map((n) => n.pitch))].sort((a, b) => a - b).join(',')})`,
    );
    expect(left).toBeGreaterThan(0);
  });
});
