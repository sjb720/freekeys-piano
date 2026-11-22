import type { CSSProperties } from 'react';
import styles from './Meter.module.css';
import type { Tone } from './types';

export type MeterProps = {
  label: string;
  value: number;
  tone?: Tone;
};

export function Meter({ label, value, tone = 'accent' }: MeterProps) {
  const fill = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fill)}
      className={`${styles.meter} ${styles[tone]}`}
      style={{ '--fill': `${fill}%` } as CSSProperties}
    />
  );
}
