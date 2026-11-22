import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ScanStatus, SongRef } from '@shared/ipc';
import { DEFAULT_SONG_QUERY, type SongQuery } from '@shared/library';

type LibraryState = {
  songs: SongRef[] | null;
  status: ScanStatus | null;
};

export const useLibraryStore = create<LibraryState>()(() => ({ songs: null, status: null }));

let revision = -1;
let started = false;

async function refresh(): Promise<void> {
  const songs = await window.api.songs.list();
  useLibraryStore.setState({ songs });
}

function onStatus(status: ScanStatus): void {
  useLibraryStore.setState({ status });
  if (status.revision !== revision) {
    revision = status.revision;
    void refresh();
  }
}

export function startLibrarySync(): void {
  if (started) return;
  started = true;
  window.api.library.onStatus(onStatus);
  void window.api.library.status().then(onStatus);
}

export const findSong = (id: string) => useLibraryStore.getState().songs?.find((s) => s.id === id);

type QueryState = { query: SongQuery; set: (patch: Partial<SongQuery>) => void };

export const useSongQueryStore = create<QueryState>()(
  persist(
    (set) => ({
      query: DEFAULT_SONG_QUERY,
      set: (patch) => set((s) => ({ query: { ...s.query, ...patch } })),
    }),
    {
      name: 'library-query:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ query: { ...s.query, search: '' } }),
    },
  ),
);
