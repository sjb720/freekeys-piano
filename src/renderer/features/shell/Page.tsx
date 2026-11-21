import type { ReactNode } from 'react';
import { Stack } from '@renderer/ui';
import { PageHeader, type PageHeaderProps } from './PageHeader';

export type PageProps = PageHeaderProps & {
  children?: ReactNode;
};

export function Page({ children, ...header }: PageProps) {
  return (
    <Stack grow gap="none">
      <PageHeader {...header} />
      <Stack grow scroll padding="lg" gap="lg">
        {children}
      </Stack>
    </Stack>
  );
}
