import type { LucideIcon } from 'lucide-react';
import { colorVar, type ColorToken } from '@renderer/themes';
import styles from './Avatar.module.css';

export type AvatarProps = {
  icon: LucideIcon;
  color?: ColorToken;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  onPress?: () => void;
};

const ICON_SIZE = { sm: 22, md: 28, lg: 44, xl: 64 };

export function Avatar({ icon: IconComponent, color, size = 'md', label, onPress }: AvatarProps) {
  const className = `${styles.avatar} ${styles[size]} ${color ? '' : styles.neutral}`;
  const style = color ? { background: colorVar(color) } : undefined;
  const glyph = <IconComponent size={ICON_SIZE[size]} strokeWidth={2} aria-hidden />;
  if (onPress) {
    return (
      <button
        type="button"
        className={`${className} ${styles.button}`}
        style={style}
        aria-label={label}
        title={label}
        onClick={onPress}
      >
        {glyph}
      </button>
    );
  }
  return (
    <span className={className} style={style} role={label ? 'img' : undefined} aria-label={label}>
      {glyph}
    </span>
  );
}
