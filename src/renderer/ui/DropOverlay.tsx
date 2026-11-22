import type { LucideIcon } from 'lucide-react';
import styles from './DropOverlay.module.css';
import { Icon } from './Icon';
import { Text } from './Text';

export type DropOverlayProps = {
  visible: boolean;
  label: string;
  icon?: LucideIcon;
};

export function DropOverlay({ visible, label, icon }: DropOverlayProps) {
  if (!visible) return null;
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.target}>
        {icon && <Icon icon={icon} size="lg" />}
        <Text variant="heading">{label}</Text>
      </div>
    </div>
  );
}
