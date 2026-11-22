import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { Api, IpcArgs, IpcChannel, IpcEvent, IpcEvents, IpcResult } from '@shared/ipc';

function invoke<C extends IpcChannel>(channel: C, ...args: IpcArgs<C>): Promise<IpcResult<C>> {
  return ipcRenderer.invoke(channel, ...args);
}

function on<E extends IpcEvent>(event: E, listener: (payload: IpcEvents[E]) => void): () => void {
  const wrapped = (_e: IpcRendererEvent, payload: IpcEvents[E]) => listener(payload);
  ipcRenderer.on(event, wrapped);
  return () => ipcRenderer.off(event, wrapped);
}

const api: Api = {
  app: {
    getInfo: () => invoke('app:getInfo'),
  },
  songs: {
    list: () => invoke('songs:list'),
    get: (id) => invoke('songs:get', id),
    pick: () => invoke('songs:pick'),
    load: (id) => invoke('songs:load', id),
    setFavorite: (id, favorite) => invoke('songs:setFavorite', id, favorite),
    setHands: (id, hands) => invoke('songs:setHands', id, hands),
  },
  library: {
    folders: () => invoke('library:folders'),
    addFolder: () => invoke('library:addFolder'),
    removeFolder: (path) => invoke('library:removeFolder', path),
    rescan: () => invoke('library:rescan'),
    status: () => invoke('library:status'),
    onStatus: (listener) => on('library:status', listener),
  },
  profiles: {
    list: () => invoke('profiles:list'),
    active: () => invoke('profiles:active'),
    create: (input) => invoke('profiles:create', input),
    update: (id, input) => invoke('profiles:update', id, input),
    delete: (id) => invoke('profiles:delete', id),
    select: (id) => invoke('profiles:select', id),
  },
  settings: {
    load: () => invoke('settings:load'),
    set: (key, value) => invoke('settings:set', key, value),
  },
};

contextBridge.exposeInMainWorld('api', api);
