import { copyFileSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { analyzeFile, Library, type AnalyzeRunner } from '../src/main/library';

const demos = join(process.cwd(), 'resources', 'songs');
const inline: AnalyzeRunner = async (paths, overrides, onResult) => {
  for (const path of paths) onResult(analyzeFile(path, overrides));
};

describe('Library', () => {
  let dir: string;
  let library: Library;
  let runs: number;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'library-'));
    mkdirSync(join(dir, 'bundled'));
    mkdirSync(join(dir, 'music', 'nested'), { recursive: true });
    copyFileSync(join(demos, 'c-major-scale.mid'), join(dir, 'bundled', 'scale.mid'));
    runs = 0;
    library = new Library({
      dbPath: join(dir, 'library.db'),
      bundledDir: join(dir, 'bundled'),
      runner: (paths, overrides, onResult) => {
        runs += paths.length;
        return inline(paths, overrides, onResult);
      },
      onStatus: () => {},
    });
  });

  afterEach(() => {
    library.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('indexes bundled songs and library folders recursively', async () => {
    copyFileSync(join(demos, 'ode-to-joy.mid'), join(dir, 'music', 'nested', 'ode.MID'));
    writeFileSync(join(dir, 'music', 'notes.txt'), 'not midi');
    library.addFolder(join(dir, 'music'));
    await library.scanner.scan();
    const songs = library.list();
    expect(songs.map((s) => s.source).sort()).toEqual(['bundled', 'library']);
    expect(songs.every((s) => s.difficulty.level >= 1)).toBe(true);
  });

  it('skips unchanged files and reanalyzes changed ones', async () => {
    await library.scanner.scan();
    expect(runs).toBe(1);
    await library.scanner.scan();
    expect(runs).toBe(1);
    utimesSync(join(dir, 'bundled', 'scale.mid'), new Date(), new Date(Date.now() + 5000));
    await library.scanner.scan();
    expect(runs).toBe(2);
  });

  it('dedupes identical files and drops removed ones', async () => {
    copyFileSync(join(demos, 'c-major-scale.mid'), join(dir, 'music', 'copy.mid'));
    library.addFolder(join(dir, 'music'));
    await library.scanner.scan();
    expect(library.list()).toHaveLength(1);
    expect(library.list()[0]!.source).toBe('bundled');
    rmSync(join(dir, 'bundled', 'scale.mid'));
    await library.scanner.scan();
    expect(library.list()[0]!.source).toBe('library');
    library.removeFolder(join(dir, 'music'));
    expect(library.list()).toHaveLength(0);
  });

  it('records unreadable files without retrying them', async () => {
    writeFileSync(join(dir, 'bundled', 'broken.mid'), 'nope');
    await library.scanner.scan();
    expect(library.scanner.getStatus().failed).toBe(1);
    await library.scanner.scan();
    expect(runs).toBe(2);
  });

  it('keeps favorites and hand overrides across rescans', async () => {
    await library.scanner.scan();
    const [song] = library.list();
    library.setFavorite(song!.id, true);
    const updated = library.setHands(song!.id, { kind: 'swap' });
    expect(updated?.hands).toEqual({ kind: 'swap' });
    expect(updated?.difficulty.left.score).toBe(song!.difficulty.right.score);
    utimesSync(join(dir, 'bundled', 'scale.mid'), new Date(), new Date(Date.now() + 5000));
    await library.scanner.scan();
    const after = library.get(song!.id)!;
    expect(after.favorite).toBe(true);
    expect(after.hands).toEqual({ kind: 'swap' });
    expect(after.difficulty.left.score).toBe(song!.difficulty.right.score);
  });

  it('imports a single file', async () => {
    const path = join(dir, 'single.mid');
    copyFileSync(join(demos, 'twinkle-twinkle.mid'), path);
    const ref = await library.importFile(path);
    expect(ref?.source).toBe('file');
    expect((await library.load(ref!.id))?.bytes.length).toBeGreaterThan(0);
  });
});
