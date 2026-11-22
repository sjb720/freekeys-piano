import type { ReactNode } from 'react';
import styles from './Card.module.css';
import { Stack } from './Stack';
import type { Space } from './types';

export type CardProps = {
  gap?: Space;
  children: ReactNode;
};

export function Card({ gap = 'lg', children }: CardProps) {
  return (
    <div className={styles.card}>
      <Stack gap={gap}>{children}</Stack>
    </div>
  );
}
