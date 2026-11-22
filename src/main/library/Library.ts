import { stat, readFile } from 'node:fs/promises';
import type { DatabaseSync } from 'node:sqlite';
import type { ScanStatus, SongFile, SongRef } from '@shared/ipc';
import type { HandOverride } from '@shared/song';
import { analyzeFile } from './analyzeFile';
import { LibraryDb } from './LibraryDb';
import { Scanner, type AnalyzeRunner } from './Scanner';

export type LibraryOptions = {
  db: DatabaseSync;
  profile: () => string | null;
  bundledDir: string;
  runner: AnalyzeRunner;
  onStatus: (status: ScanStatus) => void;
};

export class Library {
  readonly db: LibraryDb;
  readonly scanner: Scanner;

  private readonly profile: () => string | null;

  constructor({ db, profile, bundledDir, runner, onStatus }: LibraryOptions) {
    this.db = new LibraryDb(db);
    this.profile = profile;
    this.scanner = new Scanner(
      this.db,
      () => [
        { path: bundledDir, source: 'bundled', folder: null },
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
