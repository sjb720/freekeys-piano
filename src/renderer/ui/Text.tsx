import type { ReactNode } from 'react';
import styles from './Text.module.css';

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption';
type TextTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

export type TextProps = {
  variant?: TextVariant;
  tone?: 'default' | 'muted' | 'accent' | 'danger';
  align?: 'start' | 'center' | 'end';
  as?: TextTag;
  truncate?: boolean;
  children: ReactNode;
};

const DEFAULT_TAG: Record<TextVariant, TextTag> = {
  display: 'h1',
  title: 'h1',
  heading: 'h2',
  body: 'p',
  caption: 'span',
};

export function Text({
  variant = 'body',
  tone = 'default',
  align = 'start',
  as,
  truncate = false,
  children,
}: TextProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  const classes = [styles.text, styles[variant], styles[tone], styles[align]];
  if (truncate) classes.push(styles.truncate);
  return <Tag className={classes.join(' ')}>{children}</Tag>;
}
