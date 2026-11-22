import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { ScanStatus, SongSource } from '@shared/ipc';
import type { HandOverride } from '@shared/song';
import type { AnalyzeResult } from './analyzeFile';
import { MIDI_EXTENSIONS } from './analyzeFile';
import type { FileInfo, LibraryDb } from './LibraryDb';

export type ScanRoot = { path: string; source: Exclude<SongSource, 'file'>; folder: string | null };

export type AnalyzeRunner = (
  paths: string[],
  overrides: Record<string, HandOverride>,
  onResult: (result: AnalyzeResult) => void,
) => Promise<void>;

const BATCH = 50;

export async function walkMidi(dir: string): Promise<Map<string, { mtime: number; size: number }>> {
  const found = new Map<string, { mtime: number; size: number }>();
  const visit = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && MIDI_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        const info = await stat(path).catch(() => null);
        if (info) found.set(path, { mtime: info.mtimeMs, size: info.size });
      }
    }
  };
  await visit(dir);
  return found;
}

export class Scanner {
  private status: ScanStatus = { scanning: false, done: 0, total: 0, failed: 0, revision: 0 };
  private running: Promise<void> | null = null;
  private again = false;

  constructor(
    private readonly db: LibraryDb,
    private readonly roots: () => ScanRoot[],
    private readonly run: AnalyzeRunner,
    private readonly onStatus: (status: ScanStatus) => void,
  ) {}

  getStatus = (): ScanStatus => this.status;

  changed(): void {
    this.update({ revision: this.status.revision + 1 });
  }

  scan(): Promise<void> {
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = (async () => {
      do {
        this.again = false;
        await this.scanOnce();
      } while (this.again);
    })().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async scanOnce(): Promise<void> {
    this.update({ scanning: true, done: 0, total: 0, failed: 0 });
    try {
      await this.scanFiles();
    } finally {
      this.update({ scanning: false });
    }
  }

  private async scanFiles(): Promise<void> {
    const known = new Map(this.db.files().map((f) => [f.path, f]));
    const pending = new Map<string, FileInfo>();
    const removed: string[] = [];

    for (const root of this.roots()) {
      const found = await walkMidi(root.path);
      for (const [path, info] of found) {
        const row = known.get(path);
        const file = { path, source: root.source, folder: root.folder, ...info };
        if (!row || row.mtime !== info.mtime || row.size !== info.size) pending.set(path, file);
      }
      for (const row of known.values()) {
        const owned = root.folder ? row.folder === root.folder : row.source === root.source;
        if (owned && !found.has(row.path)) removed.push(row.path);
      }
    }

    for (const { path } of this.db.staleSongs()) {
      const row = known.get(path);
      if (row && !pending.has(path)) pending.set(path, row);
    }

    if (removed.length) {
      this.db.deleteFiles(removed);
      this.changed();
    }

    this.update({ total: pending.size });
    let batch: AnalyzeResult[] = [];
    const flush = () => {
      const results = batch;
      batch = [];
      this.db.transaction(() => {
        for (const result of results) {
          const file = pending.get(result.path)!;
          if ('error' in result) {
            this.db.putFile(file, null);
          } else {
            this.db.putSong(result.id, result.summary);
            this.db.putFile(file, result.id);
          }
        }
      });
      const failed = results.filter((r) => 'error' in r).length;
      this.update({
        done: this.status.done + results.length,
        failed: this.status.failed + failed,
        revision: this.status.revision + 1,
      });
    };

    if (pending.size) {
      await this.run([...pending.keys()], this.db.overrides(), (result) => {
        batch.push(result);
        if (batch.length >= BATCH) flush();
      });
      if (batch.length) flush();
    }
  }

  private update(patch: Partial<ScanStatus>): void {
    this.status = { ...this.status, ...patch };
    this.onStatus(this.status);
  }
}
