import type { HandFocus, PracticeMode } from '../settings';

export type SessionInput = {
  songId: string;
  mode: PracticeMode;
  focus: HandFocus;
  tempo: number;
  playTime: number;
  hits: number;
  misses: number;
  wrong: number;
  completed: boolean;
  startedAt: number;
  day: string;
};

export type SessionRecord = SessionInput & {
  id: number;
  profileId: string;
  accuracy: number | null;
};

export type BestScore = {
  mode: PracticeMode;
  focus: HandFocus;
  accuracy: number;
  tempo: number;
  at: number;
};

export type SongHistory = {
  playTime: number;
  sessions: number;
  completions: number;
  lastPlayedAt: number | null;
  best: BestScore[];
};

export type HistorySummary = {
  playTime: number;
  todayTime: number;
  sessions: number;
  streak: number;
  bestStreak: number;
  days: { day: string; playTime: number }[];
  recent: (SessionRecord & { title: string })[];
};

export const MIN_SESSION_SECONDS = 10;

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dayNumber = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y!, m! - 1, d!) / 86_400_000);
};

export function streaks(days: readonly string[], today: string): { current: number; best: number } {
  const numbers = [...new Set(days.map(dayNumber))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < numbers.length; i++) {
    run = i > 0 && numbers[i]! - numbers[i - 1]! === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const last = numbers.at(-1);
  const gap = last === undefined ? Infinity : dayNumber(today) - last;
  return { current: gap <= 1 ? run : 0, best };
}

export const accuracyOf = ({
  hits,
  misses,
  wrong,
}: Pick<SessionInput, 'hits' | 'misses' | 'wrong'>) => {
  const total = hits + misses + wrong;
  return total ? hits / total : null;
};

export function sessionInputError(input: SessionInput): string | null {
  const counts = [input.hits, input.misses, input.wrong];
  if (!counts.every((n) => Number.isInteger(n) && n >= 0)) return 'Invalid note counts.';
  if (!(input.playTime >= MIN_SESSION_SECONDS) || input.playTime > 86_400)
    return 'Invalid play time.';
  if (!(input.tempo > 0 && input.tempo <= 4)) return 'Invalid tempo.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day)) return 'Invalid day.';
  return null;
}

export function bestScores(sessions: readonly SessionRecord[]): BestScore[] {
  const best = new Map<string, BestScore>();
  for (const s of sessions) {
    if (!s.completed || s.mode === 'watch' || s.accuracy === null) continue;
    const key = `${s.mode}:${s.focus}`;
    const current = best.get(key);
    const better =
      !current ||
      s.accuracy > current.accuracy ||
      (s.accuracy === current.accuracy && s.tempo > current.tempo);
    if (better)
      best.set(key, {
        mode: s.mode,
        focus: s.focus,
        accuracy: s.accuracy,
        tempo: s.tempo,
        at: s.startedAt,
      });
  }
  return [...best.values()].sort((a, b) => b.accuracy - a.accuracy);
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const minutes = Math.round(s / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
