import { app, BrowserWindow, dialog, shell } from 'electron';
import { mkdir } from 'node:fs/promises';
import { isCreditUrl, loadCredits } from './credits';
import { handle } from './ipc';
import type { History } from './history';
import type { Library } from './library';
import type { Profiles } from './profiles';

async function showOpen(options: Electron.OpenDialogOptions): Promise<string[]> {
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options);
  return result.canceled ? [] : result.filePaths;
}

const pickImports = () =>
  showOpen({
    title: 'Add songs',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'MIDI', extensions: ['mid', 'midi'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });

async function pick(kind: 'file' | 'folder'): Promise<string | null> {
  const options: Electron.OpenDialogOptions =
    kind === 'file'
      ? {
          title: 'Open MIDI file',
          properties: ['openFile'],
          filters: [{ name: 'MIDI', extensions: ['mid', 'midi'] }],
        }
      : { title: 'Add library folder', properties: ['openDirectory'] };
  return (await showOpen(options))[0] ?? null;
}

export function registerHandlers(library: Library, profiles: Profiles, history: History): void {
  handle('app:getInfo', () => ({ version: app.getVersion(), platform: process.platform }));
  handle('songs:list', library.list);
  handle('songs:get', library.get);
  handle('songs:pick', async () => {
    const path = await pick('file');
    return path ? library.importFile(path) : null;
  });
  handle('songs:import', async (paths) => {
    const chosen = paths ?? (await pickImports());
    return chosen.length ? library.importFiles(chosen) : null;
  });
  handle('songs:showImported', async () => {
    await mkdir(library.importDir, { recursive: true });
    await shell.openPath(library.importDir);
  });
  handle('app:credits', loadCredits);
  handle('app:openCreditLink', async (url) => {
    if (await isCreditUrl(url)) await shell.openExternal(url);
  });
  handle('songs:load', (id) => library.load(id));
  handle('songs:setFavorite', (id, favorite) => library.setFavorite(id, favorite));
  handle('songs:setHands', (id, hands) => library.setHands(id, hands));
  handle('library:folders', library.folders);
  handle('library:addFolder', async () => {
    const path = await pick('folder');
    return path ? library.addFolder(path) : library.folders();
  });
  handle('library:removeFolder', (path) => library.removeFolder(path));
  handle('library:rescan', () => library.scanner.scan());
  handle('library:status', library.scanner.getStatus);
  handle('profiles:list', profiles.list);
  handle('profiles:active', profiles.active);
  handle('profiles:create', (input) => profiles.create(input));
  handle('profiles:update', (id, input) => profiles.update(id, input));
  handle('profiles:delete', (id) => profiles.delete(id));
  handle('profiles:select', (id) => {
    const profile = profiles.select(id);
    library.scanner.changed();
    return profile;
  });
  handle('settings:load', () => profiles.loadSettings());
  handle('settings:set', (key, value) => profiles.setSetting(key, value));
  handle('history:record', (input) => history.record(input));
  handle('history:summary', (today) => history.summary(today));
  handle('history:song', (songId) => history.song(songId));
}
