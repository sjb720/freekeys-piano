import type { ReactNode } from 'react';
import styles from './Badge.module.css';
import type { Tone } from './types';

export type BadgeProps = {
  tone?: Tone;
  size?: 'md' | 'lg';
  children: ReactNode;
};

export function Badge({ tone = 'neutral', size = 'md', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]} ${styles[size]}`}>{children}</span>;
}
