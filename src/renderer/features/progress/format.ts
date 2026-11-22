import type { BestScore, SessionRecord } from '@shared/history';
import { HAND_FOCUS_LABELS, PRACTICE_MODE_LABELS, type HandFocus } from '@shared/settings';

const handText = (focus: HandFocus) =>
  focus === 'both' ? 'Both hands' : `${HAND_FOCUS_LABELS[focus]} hand`;

export const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;

export const formatDay = (day: string, style: 'short' | 'tick' = 'short') => {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  return style === 'tick'
    ? String(d)
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export const sessionText = (s: SessionRecord) =>
  [
    PRACTICE_MODE_LABELS[s.mode],
    handText(s.focus),
    s.accuracy !== null && s.mode !== 'watch' ? percent(s.accuracy) : null,
    s.tempo < 0.995 || s.tempo > 1.005 ? `${percent(s.tempo)} tempo` : null,
    s.completed ? 'Finished' : null,
  ]
    .filter(Boolean)
    .join(' · ');

export const bestText = (b: BestScore) =>
  `${PRACTICE_MODE_LABELS[b.mode]}, ${handText(b.focus).toLowerCase()}`;
