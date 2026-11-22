export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ControlSize = 'md' | 'lg';

export const spaceVar = (space: Space) => (space === 'none' ? '0' : `var(--space-${space})`);

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
