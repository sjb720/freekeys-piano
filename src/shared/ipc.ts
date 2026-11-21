export type AppInfo = {
  version: string;
  platform: string;
};

export type SongRef = {
  id: string;
  title: string;
  source: 'bundled' | 'file';
};

export type SongFile = {
  ref: SongRef;
  bytes: Uint8Array;
};

export interface IpcContract {
  'app:getInfo': { args: []; result: AppInfo };
  'songs:list': { args: []; result: SongRef[] };
  'songs:pick': { args: []; result: SongRef | null };
  'songs:load': { args: [id: string]; result: SongFile | null };
}

export type IpcChannel = keyof IpcContract;
export type IpcArgs<C extends IpcChannel> = IpcContract[C]['args'];
export type IpcResult<C extends IpcChannel> = IpcContract[C]['result'];

export interface Api {
  app: {
    getInfo(): Promise<AppInfo>;
  };
  songs: {
    list(): Promise<SongRef[]>;
    pick(): Promise<SongRef | null>;
    load(id: string): Promise<SongFile | null>;
  };
}
