import { useEffect, useState } from 'react';
import type { SongRef } from '@shared/ipc';
import { useLibraryStore } from '@renderer/state/libraryStore';

export function useSong(id: string): SongRef | null | undefined {
  const cached = useLibraryStore((s) => s.songs?.find((song) => song.id === id));
  const [fetched, setFetched] = useState<{ id: string; song: SongRef | null } | null>(null);

  useEffect(() => {
    if (cached) return;
    let live = true;
    void window.api.songs.get(id).then((song) => live && setFetched({ id, song }));
    return () => {
      live = false;
    };
  }, [id, cached]);

  if (cached) return cached;
  return fetched?.id === id ? fetched.song : undefined;
}
