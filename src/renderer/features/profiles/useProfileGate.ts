import { useEffect } from 'react';
import { useLocation, useNavigate } from '@renderer/router';
import { useProfileStore } from '@renderer/state/profileStore';

const OPEN_PATHS = /^\/(profiles(\/|$)|$)/;

export function useProfileGate(): boolean {
  const { path } = useLocation();
  const navigate = useNavigate();
  const ready = useProfileStore((s) => s.ready);
  const active = useProfileStore((s) => s.active);
  const blocked = ready && !active && !OPEN_PATHS.test(path);

  useEffect(() => {
    if (blocked) navigate.to('/', { replace: true });
  }, [blocked, navigate]);

  return ready && !blocked;
}
