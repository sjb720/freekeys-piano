import { join } from 'node:path';
import { app, BrowserWindow } from 'electron';
import { registerHandlers } from './handlers';
import { broadcast } from './ipc';
import { databasePath, openDatabase } from './db';
import { History } from './history';
import { Library } from './library';
import { runInUtilityProcess } from './library/utilityRunner';
import { rendererDir, resourcesDir } from './paths';
import { configurePermissions } from './permissions';
import { Profiles } from './profiles';
import { registerSchemePrivileges, serveDirectory } from './protocol';
import { createMainWindow } from './window';

registerSchemePrivileges();

app.whenReady().then(() => {
  configurePermissions();
  serveDirectory(rendererDir());
  const db = openDatabase(databasePath(app.getPath('userData')));
  const profiles = new Profiles(db);
  const library = new Library({
    db,
    profile: profiles.activeIdOrNull,
    bundledDir: join(resourcesDir(), 'songs'),
    importDir: join(app.getPath('userData'), 'Imported songs'),
    runner: runInUtilityProcess,
    onStatus: (status) => broadcast('library:status', status),
  });
  registerHandlers(library, profiles, new History(db, profiles.activeIdOrNull));
  createMainWindow();
  void library.scanner
    .scan()
    .catch((error: unknown) => console.error('Library scan failed', error));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
  app.on('will-quit', () => db.close());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
