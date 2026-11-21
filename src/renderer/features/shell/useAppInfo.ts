import { useEffect, useState } from 'react';
import type { AppInfo } from '@shared/ipc';

export function useAppInfo(): AppInfo | null {
  const [info, setInfo] = useState<AppInfo | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.app.getInfo().then((value) => live && setInfo(value));
    return () => {
      live = false;
    };
  }, []);
  return info;
}
