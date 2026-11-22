import { useEffect, useState } from 'react';
import { dayKey, type HistorySummary, type SongHistory } from '@shared/history';
import { useActiveProfile } from '@renderer/state/profileStore';

type Keyed<T> = { key: string; value: T };

export function useHistorySummary(): HistorySummary | null {
  const key = useActiveProfile()?.id ?? '';
  const [state, setState] = useState<Keyed<HistorySummary> | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.history
      .summary(dayKey(new Date()))
      .then((value) => live && setState({ key, value }));
    return () => {
      live = false;
    };
  }, [key]);
  return state?.key === key ? state.value : null;
}

export function useSongHistory(songId: string): SongHistory | null {
  const key = `${useActiveProfile()?.id ?? ''}:${songId}`;
  const [state, setState] = useState<Keyed<SongHistory> | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.history.song(songId).then((value) => live && setState({ key, value }));
    return () => {
      live = false;
    };
  }, [key, songId]);
  return state?.key === key ? state.value : null;
}
