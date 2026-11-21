import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Button.module.css';
import interactive from './interactive.module.css';
import type { ControlSize, Variant } from './types';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
  variant?: Variant;
  size?: ControlSize;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  fullWidth = false,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    interactive.base,
    interactive[variant],
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
  ];
  return (
    <button type={type} className={classes.filter(Boolean).join(' ')} {...rest}>
      {icon && <Icon icon={icon} size={size === 'lg' ? 'lg' : 'md'} />}
      {children}
    </button>
  );
}
