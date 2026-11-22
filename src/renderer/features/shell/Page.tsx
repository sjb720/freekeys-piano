import type { ReactNode } from 'react';
import { Stack } from '@renderer/ui';
import styles from './Page.module.css';
import { PageHeader, type PageHeaderProps } from './PageHeader';

export type PageProps = PageHeaderProps & {
  narrow?: boolean;
  children?: ReactNode;
};

export function Page({ narrow = false, children, ...header }: PageProps) {
  return (
    <Stack grow gap="none">
      <PageHeader {...header} />
      <Stack grow scroll padding="lg" gap="lg">
        {narrow ? (
          <div className={styles.narrow}>
            <Stack gap="lg">{children}</Stack>
          </div>
        ) : (
          children
        )}
      </Stack>
    </Stack>
  );
}
