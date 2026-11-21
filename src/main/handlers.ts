import { app, BrowserWindow } from 'electron';
import { handle } from './ipc';
import { listSongs, loadSong, pickSong } from './songs';

export function registerHandlers(): void {
  handle('app:getInfo', () => ({ version: app.getVersion(), platform: process.platform }));
  handle('songs:list', listSongs);
  handle('songs:pick', () => pickSong(BrowserWindow.getFocusedWindow()));
  handle('songs:load', loadSong);
}
