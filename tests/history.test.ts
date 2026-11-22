import { mkdtempSync, rmSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SessionInput } from '@shared/history';
import { openDatabase } from '../src/main/db';
import { History } from '../src/main/history';
import { Profiles } from '../src/main/profiles';

const input = (patch: Partial<SessionInput> = {}): SessionInput => ({
  songId: 'song',
  mode: 'wait',
  focus: 'both',
  tempo: 1,
  playTime: 60,
  hits: 9,
  misses: 1,
  wrong: 0,
  completed: true,
  startedAt: 1000,
  day: '2026-11-20',
  ...patch,
});

describe('History', () => {
  let dir: string;
  let db: DatabaseSync;
  let profiles: Profiles;
  let history: History;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'history-'));
    db = openDatabase(join(dir, 'app.db'));
    profiles = new Profiles(db);
    history = new History(db, profiles.activeIdOrNull);
    profiles.select(profiles.create({ name: 'A', icon: 'cat', color: 1 }).id);
  });

  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('summarizes time, streaks, and recent sessions', () => {
    history.record(input({ day: '2026-11-19', startedAt: 1 }));
    history.record(input({ day: '2026-11-20', playTime: 30, startedAt: 2 }));
    const summary = history.summary('2026-11-20');
    expect(summary).toMatchObject({
      playTime: 90,
      todayTime: 30,
      sessions: 2,
      streak: 2,
      bestStreak: 2,
    });
    expect(summary.days).toHaveLength(14);
    expect(summary.days.at(-1)).toEqual({ day: '2026-11-20', playTime: 30 });
    expect(summary.days.at(-2)).toEqual({ day: '2026-11-19', playTime: 60 });
    expect(summary.recent.map((r) => r.startedAt)).toEqual([2, 1]);
    expect(summary.recent[0]?.title).toBe('Removed song');
  });

  it('keeps history per profile and drops it with the profile', () => {
    history.record(input());
    const other = profiles.create({ name: 'B', icon: 'dog', color: 2 });
    profiles.select(other.id);
    expect(history.summary('2026-11-20').sessions).toBe(0);
    expect(history.song('song').sessions).toBe(0);
  });

  it('reports per-song bests and rejects bad input', () => {
    history.record(input({ hits: 10, misses: 0 }));
    history.record(input({ completed: false, hits: 1, misses: 0 }));
    const song = history.song('song');
    expect(song).toMatchObject({ playTime: 120, sessions: 2, completions: 1 });
    expect(song.best).toEqual([{ mode: 'wait', focus: 'both', accuracy: 1, tempo: 1, at: 1000 }]);
    expect(() => history.record(input({ playTime: 2 }))).toThrow(/play time/);
    profiles.select(null);
    expect(() => history.record(input())).toThrow(/profile/);
  });
});
