import { Badge } from '@renderer/ui';
import { levelTone } from './difficulty';

export type LevelBadgeProps = { level: number; size?: 'md' | 'lg'; labeled?: boolean };

export function LevelBadge({ level, size, labeled = false }: LevelBadgeProps) {
  return (
    <Badge tone={levelTone(level)} size={size}>
      {labeled ? `Level ${level}` : level}
    </Badge>
  );
}
