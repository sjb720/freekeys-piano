import { useEffect, useState } from 'react';
import type { SongRef } from '@shared/ipc';

export function useSongList(): SongRef[] | null {
  const [songs, setSongs] = useState<SongRef[] | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.songs.list().then((list) => live && setSongs(list));
    return () => {
      live = false;
    };
  }, []);
  return songs;
}
