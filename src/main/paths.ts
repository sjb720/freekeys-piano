import { join } from 'node:path';
import { app } from 'electron';

export const resourcesDir = () =>
  app.isPackaged ? process.resourcesPath : join(app.getAppPath(), 'resources');

export const rendererDir = () => join(__dirname, '../renderer');
