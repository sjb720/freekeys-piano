import { contextBridge, ipcRenderer } from 'electron';
import type { Api, IpcArgs, IpcChannel, IpcResult } from '@shared/ipc';

function invoke<C extends IpcChannel>(channel: C, ...args: IpcArgs<C>): Promise<IpcResult<C>> {
  return ipcRenderer.invoke(channel, ...args);
}

const api: Api = {
  app: {
    getInfo: () => invoke('app:getInfo'),
  },
  songs: {
    list: () => invoke('songs:list'),
    pick: () => invoke('songs:pick'),
    load: (id) => invoke('songs:load', id),
  },
};

contextBridge.exposeInMainWorld('api', api);
