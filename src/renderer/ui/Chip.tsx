import type { LucideIcon } from 'lucide-react';
import styles from './Chip.module.css';
import { Icon } from './Icon';
import interactive from './interactive.module.css';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  count?: number;
};

export function Chip({ label, selected, onPress, icon, count }: ChipProps) {
  const classes = [interactive.base, interactive.secondary, styles.chip];
  if (selected) classes.push(styles.selected);
  return (
    <button type="button" aria-pressed={selected} className={classes.join(' ')} onClick={onPress}>
      {icon && <Icon icon={icon} size="sm" />}
      {label}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
