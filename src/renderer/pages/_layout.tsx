import type { ReactNode } from 'react';
import { SongImports } from '@renderer/features/library';
import { useProfileGate } from '@renderer/features/profiles';
import { AppShell } from '@renderer/features/shell';

export default function RootLayout({ children }: { children?: ReactNode }) {
  const allowed = useProfileGate();
  return (
    <AppShell>
      {allowed && children}
      {allowed && <SongImports />}
    </AppShell>
  );
}
