import { describe, expect, it } from 'vitest';
import {
  bestScores,
  dayKey,
  formatDuration,
  sessionInputError,
  streaks,
  type SessionRecord,
} from './history';

describe('streaks', () => {
  it('counts consecutive days ending today or yesterday', () => {
    const days = ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-20'];
    expect(streaks(days, '2026-11-20')).toEqual({ current: 3, best: 3 });
    expect(streaks(days, '2026-11-21')).toEqual({ current: 3, best: 3 });
    expect(streaks(days, '2026-11-22')).toEqual({ current: 0, best: 3 });
  });

  it('keeps the best run separately and crosses month ends', () => {
    const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-31', '2026-11-01'];
    expect(streaks(days, '2026-11-01')).toEqual({ current: 2, best: 3 });
    expect(streaks([], '2026-11-01')).toEqual({ current: 0, best: 0 });
  });
});

describe('dayKey', () => {
  it('uses local dates', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

const session = (patch: Partial<SessionRecord>): SessionRecord => ({
  id: 1,
  profileId: 'p',
  songId: 's',
  mode: 'wait',
  focus: 'both',
  tempo: 1,
  playTime: 60,
  hits: 9,
  misses: 1,
  wrong: 0,
  accuracy: 0.9,
  completed: true,
  startedAt: 1,
  day: '2026-11-20',
  ...patch,
});

describe('bestScores', () => {
  it('keeps the best completed run per mode and hand', () => {
    const best = bestScores([
      session({ accuracy: 0.8 }),
      session({ accuracy: 0.9, tempo: 0.75, startedAt: 2 }),
      session({ accuracy: 0.9, tempo: 1, startedAt: 3 }),
      session({ accuracy: 1, completed: false }),
      session({ mode: 'watch', accuracy: null }),
      session({ focus: 'left', accuracy: 0.5 }),
    ]);
    expect(best).toEqual([
      { mode: 'wait', focus: 'both', accuracy: 0.9, tempo: 1, at: 3 },
      { mode: 'wait', focus: 'left', accuracy: 0.5, tempo: 1, at: 1 },
    ]);
  });
});

describe('sessionInputError', () => {
  it('rejects short or malformed sessions', () => {
    expect(sessionInputError(session({}))).toBeNull();
    expect(sessionInputError(session({ playTime: 3 }))).toMatch(/time/);
    expect(sessionInputError(session({ hits: -1 }))).toMatch(/counts/);
    expect(sessionInputError(session({ day: 'today' }))).toMatch(/day/);
  });
});

describe('formatDuration', () => {
  it('scales units', () => {
    expect(formatDuration(42)).toBe('42 s');
    expect(formatDuration(600)).toBe('10 min');
    expect(formatDuration(3600)).toBe('1 h');
    expect(formatDuration(4 * 3600 + 600)).toBe('4 h 10 min');
  });
});
