import type { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import interactive from './interactive.module.css';
import styles from './SegmentedControl.module.css';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

export type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        const classes = [interactive.base, interactive.ghost, styles.option];
        if (selected) classes.push(styles.selected);
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={classes.join(' ')}
            onClick={() => onChange(option.value)}
          >
            {option.icon && <Icon icon={option.icon} size="sm" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
