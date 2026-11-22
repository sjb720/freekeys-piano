import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { ImportResult, ScanStatus, SongFile, SongRef } from '@shared/ipc';
import type { HandOverride } from '@shared/song';
import { analyzeFile, songIdFor } from './analyzeFile';
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

const isMidi = (bytes: Uint8Array) =>
  bytes.length > 14 && String.fromCharCode(...bytes.subarray(0, 4)) === 'MThd';

// Only strip a real MIDI extension: "Nocturne Op. 9 no. 2" has no extension to remove.
const importStem = (name: string) => name.replace(/\.midi?$/i, '').trim() || 'Song';

export class Library {
  readonly db: LibraryDb;
  readonly scanner: Scanner;
  readonly importDir: string;

  private readonly profile: () => string | null;

  constructor({ db, profile, bundledDir, importDir, runner, onStatus }: LibraryOptions) {
    this.db = new LibraryDb(db);
    this.profile = profile;
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
    await mkdir(this.importDir, { recursive: true });
    for (const source of paths) {
      const name = basename(source);
      const skip = (reason: string) => result.skipped.push({ name, reason });
      const bytes = await readFile(source).catch(() => null);
      if (!bytes) {
        skip('Could not read the file.');
        continue;
      }
      if (!isMidi(bytes)) {
        skip('Not a MIDI file.');
        continue;
      }
      if (this.db.inLibrary(songIdFor(bytes))) {
        skip('Already in your library.');
        continue;
      }
      const target = await this.writeImport(importStem(name), bytes);
      const analyzed = analyzeFile(target, this.db.overrides());
      if ('error' in analyzed) {
        await unlink(target).catch(() => {});
        skip(`Could not read the notes: ${analyzed.error}`);
        continue;
      }
      const info = await stat(target);
      this.db.transaction(() => {
        this.db.putSong(analyzed.id, analyzed.summary);
        this.db.putFile(
          { path: target, source: 'imported', folder: null, mtime: info.mtimeMs, size: info.size },
          analyzed.id,
        );
      });
      const ref = this.get(analyzed.id);
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
