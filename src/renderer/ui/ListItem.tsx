import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import interactive from './interactive.module.css';
import styles from './ListItem.module.css';
import { Text } from './Text';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  onPress: () => void;
};

export function ListItem({ title, subtitle, icon, trailing, onPress }: ListItemProps) {
  return (
    <button
      type="button"
      className={`${interactive.base} ${interactive.secondary} ${styles.item}`}
      onClick={onPress}
    >
      {icon && (
        <span className={styles.leading}>
          <Icon icon={icon} />
        </span>
      )}
      <span className={styles.body}>
        <Text as="span" truncate>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" tone="muted" truncate>
            {subtitle}
          </Text>
        )}
      </span>
      <span className={styles.trailing}>{trailing ?? <Icon icon={ChevronRight} />}</span>
    </button>
  );
}
