import type { SongSummary } from './analysis';
import type { Profile, ProfileInput } from './profiles';
import type { SettingValues } from './settings';
import type { HandOverride } from './song';

export type AppInfo = {
  version: string;
  platform: string;
};

export type SongSource = 'bundled' | 'library' | 'file';

export type SongRef = SongSummary & {
  id: string;
  source: SongSource;
  favorite: boolean;
  hands: HandOverride;
  addedAt: number;
};

export type SongFile = {
  ref: SongRef;
  bytes: Uint8Array;
};

export type ScanStatus = {
  scanning: boolean;
  done: number;
  total: number;
  failed: number;
  revision: number;
};

export interface IpcContract {
  'app:getInfo': { args: []; result: AppInfo };
  'songs:list': { args: []; result: SongRef[] };
  'songs:get': { args: [id: string]; result: SongRef | null };
  'songs:pick': { args: []; result: SongRef | null };
  'songs:load': { args: [id: string]; result: SongFile | null };
  'songs:setFavorite': { args: [id: string, favorite: boolean]; result: void };
  'songs:setHands': { args: [id: string, hands: HandOverride]; result: SongRef | null };
  'library:folders': { args: []; result: string[] };
  'library:addFolder': { args: []; result: string[] };
  'library:removeFolder': { args: [path: string]; result: string[] };
  'library:rescan': { args: []; result: void };
  'library:status': { args: []; result: ScanStatus };
  'profiles:list': { args: []; result: Profile[] };
  'profiles:active': { args: []; result: Profile | null };
  'profiles:create': { args: [input: ProfileInput]; result: Profile };
  'profiles:update': { args: [id: string, input: ProfileInput]; result: Profile };
  'profiles:delete': { args: [id: string]; result: void };
  'profiles:select': { args: [id: string | null]; result: Profile | null };
  'settings:load': { args: []; result: Partial<SettingValues> };
  'settings:set': { args: [key: string, value: unknown]; result: void };
}

export interface IpcEvents {
  'library:status': ScanStatus;
}

export type IpcChannel = keyof IpcContract;
export type IpcArgs<C extends IpcChannel> = IpcContract[C]['args'];
export type IpcResult<C extends IpcChannel> = IpcContract[C]['result'];
export type IpcEvent = keyof IpcEvents;

export interface Api {
  app: {
    getInfo(): Promise<AppInfo>;
  };
  songs: {
    list(): Promise<SongRef[]>;
    get(id: string): Promise<SongRef | null>;
    pick(): Promise<SongRef | null>;
    load(id: string): Promise<SongFile | null>;
    setFavorite(id: string, favorite: boolean): Promise<void>;
    setHands(id: string, hands: HandOverride): Promise<SongRef | null>;
  };
  library: {
    folders(): Promise<string[]>;
    addFolder(): Promise<string[]>;
    removeFolder(path: string): Promise<string[]>;
    rescan(): Promise<void>;
    status(): Promise<ScanStatus>;
    onStatus(listener: (status: ScanStatus) => void): () => void;
  };
  profiles: {
    list(): Promise<Profile[]>;
    active(): Promise<Profile | null>;
    create(input: ProfileInput): Promise<Profile>;
    update(id: string, input: ProfileInput): Promise<Profile>;
    delete(id: string): Promise<void>;
    select(id: string | null): Promise<Profile | null>;
  };
  settings: {
    load(): Promise<Partial<SettingValues>>;
    set(key: string, value: unknown): Promise<void>;
  };
}
