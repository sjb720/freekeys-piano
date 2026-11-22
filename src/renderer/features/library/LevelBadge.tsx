import { Badge } from '@renderer/ui';
import { levelTone } from './difficulty';

export type LevelBadgeProps = { level: number; size?: 'md' | 'lg' };

export function LevelBadge({ level, size }: LevelBadgeProps) {
  return (
    <Badge tone={levelTone(level)} size={size}>
      {level}
    </Badge>
  );
}
