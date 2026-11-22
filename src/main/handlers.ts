import { app, BrowserWindow, dialog } from 'electron';
import { handle } from './ipc';
import type { Library } from './library';

async function pick(kind: 'file' | 'folder'): Promise<string | null> {
  const options: Electron.OpenDialogOptions =
    kind === 'file'
      ? {
          title: 'Open MIDI file',
          properties: ['openFile'],
          filters: [{ name: 'MIDI', extensions: ['mid', 'midi'] }],
        }
      : { title: 'Add library folder', properties: ['openDirectory'] };
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options);
  return result.canceled ? null : (result.filePaths[0] ?? null);
}

export function registerHandlers(library: Library): void {
  handle('app:getInfo', () => ({ version: app.getVersion(), platform: process.platform }));
  handle('songs:list', library.list);
  handle('songs:get', library.get);
  handle('songs:pick', async () => {
    const path = await pick('file');
    return path ? library.importFile(path) : null;
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
}
