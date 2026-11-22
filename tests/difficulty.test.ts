import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyzeDifficulty } from '@shared/analysis';
import { parseMidi } from '@shared/song';

const load = (path: string) => parseMidi(new Uint8Array(readFileSync(path)), path);
const demos = join(process.cwd(), 'resources', 'songs');
const local = join(process.cwd(), 'fixtures', 'local');
const list = (dir: string) => {
  try {
    return readdirSync(dir).filter((f) => /\.midi?$/i.test(f));
  } catch {
    return [];
  }
};

const report = (dir: string, file: string) => {
  const d = analyzeDifficulty(load(join(dir, file)));
  console.log(
    `${file}: score ${d.score} level ${d.level} (L ${d.left.score}, R ${d.right.score}, indep ${d.independence.toFixed(2)}) — ` +
      d.factors
        .map((f) => `${f.label}${f.hand ? ` (${f.hand})` : ''} ${f.impact.toFixed(2)}`)
        .join(', '),
  );
  return d;
};

describe('difficulty on real files', () => {
  it.each(list(demos))('rates the demo %s as beginner', (file) => {
    expect(report(demos, file).level).toBeLessThanOrEqual(3);
  });

  it.skipIf(list(local).length === 0).each(list(local))('reports %s', (file) => {
    expect(report(local, file).level).toBeGreaterThanOrEqual(1);
  });
});
