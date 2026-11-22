import { useEffect, useState } from 'react';
import type { SongCredit } from '@shared/credits';

export function useCredits(): SongCredit[] | null {
  const [credits, setCredits] = useState<SongCredit[] | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.app.credits().then((value) => live && setCredits(value));
    return () => {
      live = false;
    };
  }, []);
  return credits;
}
