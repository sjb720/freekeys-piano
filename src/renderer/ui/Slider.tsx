import { useEffect, useRef, type CSSProperties } from 'react';
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
  onCommit?: (value: number) => void;
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
  onCommit,
}: SliderProps) {
  const input = useRef<HTMLInputElement>(null);
  const commit = useRef(onCommit);
  useEffect(() => {
    commit.current = onCommit;
  });

  // The native change event fires once on release (or per key step), unlike React's onChange.
  useEffect(() => {
    const el = input.current!;
    const handle = () => commit.current?.(Number(el.value));
    el.addEventListener('change', handle);
    return () => el.removeEventListener('change', handle);
  }, []);

  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      ref={input}
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
