import type { CSSProperties, ReactNode } from 'react';
import { spaceVar, type Space } from './types';

type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between';

export type StackProps = {
  direction?: 'row' | 'column';
  gap?: Space;
  padding?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  grow?: boolean;
  scroll?: boolean;
  children?: ReactNode;
};

const flex = (value: Align | Justify) =>
  value === 'start' || value === 'end'
    ? `flex-${value}`
    : value === 'between'
      ? 'space-between'
      : value;

export function Stack({
  direction = 'column',
  gap = 'md',
  padding = 'none',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  grow = false,
  scroll = false,
  children,
}: StackProps) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: spaceVar(gap),
    padding: spaceVar(padding),
    alignItems: flex(align),
    justifyContent: flex(justify),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    flex: grow ? '1 1 0' : undefined,
    minHeight: grow ? 0 : undefined,
    minWidth: 0,
    overflow: scroll ? 'auto' : undefined,
  };
  return <div style={style}>{children}</div>;
}
