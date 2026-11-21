import type { PracticeMode } from '@shared/settings';
import type { PracticeStats } from '@renderer/engine';

export function statsText(mode: PracticeMode, stats: PracticeStats): string | null {
  if (mode === 'watch') return null;
  const parts = [
    stats.accuracy === null ? 'Accuracy –' : `Accuracy ${Math.round(stats.accuracy * 100)}%`,
    `${stats.hits} correct`,
    `${stats.wrong} wrong`,
  ];
  if (mode === 'playAlong') parts.push(`${stats.misses} missed`);
  return parts.join(' · ');
}
