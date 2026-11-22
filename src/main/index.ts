import { join } from 'node:path';
import { app, BrowserWindow } from 'electron';
import { registerHandlers } from './handlers';
import { broadcast } from './ipc';
import { Library, libraryDbPath } from './library';
import { runInUtilityProcess } from './library/utilityRunner';
import { rendererDir, resourcesDir } from './paths';
import { configurePermissions } from './permissions';
import { registerSchemePrivileges, serveDirectory } from './protocol';
import { createMainWindow } from './window';

registerSchemePrivileges();

app.whenReady().then(() => {
  configurePermissions();
  serveDirectory(rendererDir());
  const library = new Library({
    dbPath: libraryDbPath(app.getPath('userData')),
    bundledDir: join(resourcesDir(), 'songs'),
    runner: runInUtilityProcess,
    onStatus: (status) => broadcast('library:status', status),
  });
  registerHandlers(library);
  createMainWindow();
  void library.scanner
    .scan()
    .catch((error: unknown) => console.error('Library scan failed', error));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
  app.on('will-quit', () => library.close());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
