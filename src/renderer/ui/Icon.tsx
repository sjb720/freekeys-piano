import type { LucideIcon } from 'lucide-react';
import styles from './Icon.module.css';

export type IconSize = 'sm' | 'md' | 'lg';

export type IconProps = {
  icon: LucideIcon;
  size?: IconSize;
};

export function Icon({ icon: Glyph, size = 'md' }: IconProps) {
  return <Glyph className={`${styles.icon} ${styles[size]}`} aria-hidden />;
}
