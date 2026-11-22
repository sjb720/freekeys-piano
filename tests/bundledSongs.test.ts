import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCredits } from '../src/shared/credits';

const songs = join(process.cwd(), 'resources', 'songs');
const midis = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return midis(path);
    return name.endsWith('.mid') ? [relative(songs, path)] : [];
  });

describe('bundled songs', () => {
  const credits = parseCredits(readFileSync(join(songs, 'CREDITS.md'), 'utf8'));

  it('credits every downloaded song and nothing missing', () => {
    const downloaded = midis(songs)
      .filter((path) => path.includes('/'))
      .sort();
    expect(credits.map((c) => c.file).sort()).toEqual(downloaded);
  });

  it('names a typesetter and license for each', () => {
    for (const credit of credits) {
      expect(credit.credit, credit.file).not.toBe('');
      expect(credit.license, credit.file).toMatch(/^(Public Domain|CC BY(-SA)? \d\.\d)$/);
    }
  });
});
