import { app, BrowserWindow } from 'electron';
import { registerHandlers } from './handlers';
import { rendererDir } from './paths';
import { configurePermissions } from './permissions';
import { registerSchemePrivileges, serveDirectory } from './protocol';
import { registerBundledSongs } from './songs';
import { createMainWindow } from './window';

registerSchemePrivileges();

app.whenReady().then(async () => {
  configurePermissions();
  serveDirectory(rendererDir());
  await registerBundledSongs();
  registerHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
