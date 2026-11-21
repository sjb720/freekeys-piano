import type { CSSProperties } from 'react';
import styles from './Slider.module.css';

export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: 'sm' | 'md' | 'full';
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  size = 'full',
  disabled = false,
  onChange,
}: SliderProps) {
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range"
      aria-label={label}
      className={`${styles.slider} ${styles[size]}`}
      style={{ '--fill': `${fill}%` } as CSSProperties}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.currentTarget.value))}
    />
  );
}
