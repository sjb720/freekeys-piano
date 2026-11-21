import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import styles from './IconButton.module.css';
import interactive from './interactive.module.css';
import type { ControlSize, Variant } from './types';

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style' | 'children' | 'aria-label'
> & {
  icon: LucideIcon;
  label: string;
  variant?: Variant;
  size?: ControlSize;
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = [interactive.base, interactive[variant], styles.iconButton, styles[size]];
  return (
    <button type={type} className={classes.join(' ')} aria-label={label} title={label} {...rest}>
      <Icon icon={icon} size={size === 'lg' ? 'lg' : 'md'} />
    </button>
  );
}
