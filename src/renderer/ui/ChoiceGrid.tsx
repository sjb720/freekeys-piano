import type { ReactNode } from 'react';
import styles from './ChoiceGrid.module.css';

export type Choice<T extends string | number> = { value: T; label: string; content: ReactNode };

export type ChoiceGridProps<T extends string | number> = {
  label: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function ChoiceGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ChoiceGridProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.grid}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            className={`${styles.choice} ${selected ? styles.selected : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.content}
          </button>
        );
      })}
    </div>
  );
}
