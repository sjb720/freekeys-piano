import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { dialog, type BrowserWindow } from 'electron';
import type { SongFile, SongRef } from '@shared/ipc';
import { resourcesDir } from './paths';

const MIDI_EXT = new Set(['.mid', '.midi']);
const registry = new Map<string, SongRef & { path: string }>();

const titleFromPath = (path: string) =>
  basename(path, extname(path))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

function register(path: string, source: SongRef['source']): SongRef {
  const id =
    source === 'bundled'
      ? `demo-${basename(path, extname(path))}`
      : `file-${createHash('sha1').update(path).digest('hex').slice(0, 12)}`;
  const ref: SongRef = { id, title: titleFromPath(path), source };
  registry.set(id, { ...ref, path });
  return ref;
}

const toRef = ({ id, title, source }: SongRef): SongRef => ({ id, title, source });

export async function registerBundledSongs(): Promise<void> {
  const dir = join(resourcesDir(), 'songs');
  const files = await readdir(dir).catch(() => []);
  for (const file of files.sort()) {
    if (MIDI_EXT.has(extname(file).toLowerCase())) register(join(dir, file), 'bundled');
  }
}

export const listSongs = (): SongRef[] => [...registry.values()].map(toRef);

export async function pickSong(win: BrowserWindow | null): Promise<SongRef | null> {
  const options: Electron.OpenDialogOptions = {
    title: 'Open MIDI file',
    properties: ['openFile'],
    filters: [{ name: 'MIDI', extensions: ['mid', 'midi'] }],
  };
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options);
  const path = result.filePaths[0];
  return result.canceled || !path ? null : register(path, 'file');
}

export async function loadSong(id: string): Promise<SongFile | null> {
  const entry = registry.get(id);
  if (!entry) return null;
  const bytes = await readFile(entry.path).catch(() => null);
  return bytes ? { ref: toRef(entry), bytes: new Uint8Array(bytes) } : null;
}
