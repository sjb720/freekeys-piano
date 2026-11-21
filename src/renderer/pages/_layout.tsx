import type { ReactNode } from 'react';
import { AppShell } from '@renderer/features/shell';

export default function RootLayout({ children }: { children?: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
