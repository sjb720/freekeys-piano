import { mkdir, open, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { ImportResult, ScanStatus, SongFile, SongRef } from '@shared/ipc';
import type { HandOverride } from '@shared/song';
import { analyzeFile, songIdFor, type AnalyzeResult } from './analyzeFile';
import { LibraryDb } from './LibraryDb';
import { Scanner, type AnalyzeRunner } from './Scanner';

export type LibraryOptions = {
  db: DatabaseSync;
  profile: () => string | null;
  bundledDir: string;
  importDir: string;
  runner: AnalyzeRunner;
  onStatus: (status: ScanStatus) => void;
};

const HEADER_BYTES = 14;

const isMidi = (header: Uint8Array) =>
  header.length === HEADER_BYTES && String.fromCharCode(...header.subarray(0, 4)) === 'MThd';

// Reads only the header so a large non-MIDI file is rejected without loading it.
async function readHeader(path: string): Promise<Uint8Array | null> {
  const file = await open(path, 'r').catch(() => null);
  if (!file) return null;
  try {
    const { bytesRead, buffer } = await file.read(new Uint8Array(HEADER_BYTES), 0, HEADER_BYTES, 0);
    return buffer.subarray(0, bytesRead);
  } catch {
    return null;
  } finally {
    await file.close();
  }
}

// Only strip a real MIDI extension: "Nocturne Op. 9 no. 2" has no extension to remove.
const importStem = (name: string) => name.replace(/\.midi?$/i, '').trim() || 'Song';

export class Library {
  readonly db: LibraryDb;
  readonly scanner: Scanner;
  readonly importDir: string;

  private readonly profile: () => string | null;
  private readonly runner: AnalyzeRunner;

  constructor({ db, profile, bundledDir, importDir, runner, onStatus }: LibraryOptions) {
    this.db = new LibraryDb(db);
    this.profile = profile;
    this.runner = runner;
    this.importDir = importDir;
    this.scanner = new Scanner(
      this.db,
      () => [
        { path: bundledDir, source: 'bundled', folder: null },
        { path: importDir, source: 'imported', folder: null },
        ...this.db.folders().map((path) => ({ path, source: 'library' as const, folder: path })),
      ],
      runner,
      onStatus,
    );
  }

  list = (): SongRef[] => this.db.listSongs(this.profile());
  get = (id: string): SongRef | null => this.db.getSong(id, this.profile());
  folders = (): string[] => this.db.folders();

  addFolder(path: string): string[] {
    this.db.addFolder(path);
    void this.scanner.scan();
    return this.folders();
  }

  removeFolder(path: string): string[] {
    this.db.removeFolder(path);
    this.scanner.changed();
    return this.folders();
  }

  async importFile(path: string): Promise<SongRef | null> {
    const info = await stat(path);
    const result = analyzeFile(path, this.db.overrides());
    if ('error' in result) throw new Error(result.error);
    this.db.transaction(() => {
      this.db.putSong(result.id, result.summary);
      this.db.putFile(
        { path, source: 'file', folder: null, mtime: info.mtimeMs, size: info.size },
        result.id,
      );
    });
    this.scanner.changed();
    return this.get(result.id);
  }

  async importFiles(paths: string[]): Promise<ImportResult> {
    const result: ImportResult = { added: [], skipped: [] };
    const names = new Map<string, string>();
    const ids = new Set<string>();
    await mkdir(this.importDir, { recursive: true });

    for (const source of paths) {
      const name = basename(source);
      const skip = (reason: string) => result.skipped.push({ name, reason });
      const header = await readHeader(source);
      if (!header) {
        skip('Could not read the file.');
        continue;
      }
      if (!isMidi(header)) {
        skip('Not a MIDI file.');
        continue;
      }
      const bytes = await readFile(source).catch(() => null);
      if (!bytes) {
        skip('Could not read the file.');
        continue;
      }
      const id = songIdFor(bytes);
      if (ids.has(id) || this.db.inLibrary(id)) {
        skip('Already in your library.');
        continue;
      }
      ids.add(id);
      names.set(await this.writeImport(importStem(name), bytes), name);
    }

    const analyzed = new Map<string, AnalyzeResult>();
    if (names.size) {
      await this.runner([...names.keys()], this.db.overrides(), (r) =>
        analyzed.set(r.path, r),
      ).catch(() => {});
    }

    for (const [target, name] of names) {
      const outcome = analyzed.get(target);
      if (!outcome || 'error' in outcome) {
        await unlink(target).catch(() => {});
        const reason = outcome
          ? `Could not read the notes: ${outcome.error}`
          : 'Could not analyze the file.';
        result.skipped.push({ name, reason });
        continue;
      }
      const info = await stat(target);
      this.db.transaction(() => {
        this.db.putSong(outcome.id, outcome.summary);
        this.db.putFile(
          { path: target, source: 'imported', folder: null, mtime: info.mtimeMs, size: info.size },
          outcome.id,
        );
      });
      const ref = this.get(outcome.id);
      if (ref) result.added.push(ref);
    }
    if (result.added.length) this.scanner.changed();
    return result;
  }

  private async writeImport(stem: string, bytes: Uint8Array): Promise<string> {
    for (let n = 1; ; n++) {
      const target = join(this.importDir, n === 1 ? `${stem}.mid` : `${stem} (${n}).mid`);
      try {
        await writeFile(target, bytes, { flag: 'wx' });
        return target;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
    }
  }

  async load(id: string): Promise<SongFile | null> {
    const ref = this.get(id);
    const path = this.db.songPath(id);
    if (!ref || !path) return null;
    const bytes = await readFile(path).catch(() => null);
    return bytes ? { ref, bytes: new Uint8Array(bytes) } : null;
  }

  setFavorite(id: string, favorite: boolean): void {
    const profile = this.profile();
    if (!profile) throw new Error('No profile selected.');
    this.db.setFavorite(profile, id, favorite);
    this.scanner.changed();
  }

  setHands(id: string, hands: HandOverride): SongRef | null {
    const path = this.db.songPath(id);
    if (!path) return null;
    this.db.setHands(id, hands);
    const result = analyzeFile(path, { [id]: hands });
    if (!('error' in result)) this.db.putSong(id, result.summary);
    this.scanner.changed();
    return this.get(id);
  }
}
