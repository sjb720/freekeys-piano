import type { DatabaseSync } from 'node:sqlite';
import {
  accuracyOf,
  bestScores,
  sessionInputError,
  streaks,
  type HistorySummary,
  type SessionInput,
  type SessionRecord,
  type SongHistory,
} from '@shared/history';

type SessionRow = {
  id: number;
  profile_id: string;
  song_id: string;
  mode: SessionRecord['mode'];
  focus: SessionRecord['focus'];
  tempo: number;
  play_time: number;
  hits: number;
  misses: number;
  wrong: number;
  completed: number;
  started_at: number;
  day: string;
};

const toRecord = (r: SessionRow): SessionRecord => ({
  id: r.id,
  profileId: r.profile_id,
  songId: r.song_id,
  mode: r.mode,
  focus: r.focus,
  tempo: r.tempo,
  playTime: r.play_time,
  hits: r.hits,
  misses: r.misses,
  wrong: r.wrong,
  accuracy: accuracyOf(r),
  completed: r.completed === 1,
  startedAt: r.started_at,
  day: r.day,
});

export const CHART_DAYS = 14;
const RECENT = 8;

const shiftDay = (day: string, delta: number) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + delta)).toISOString().slice(0, 10);
};

export class History {
  constructor(
    private readonly db: DatabaseSync,
    private readonly profile: () => string | null,
  ) {}

  record(input: SessionInput): void {
    const profile = this.requireProfile();
    const error = sessionInputError(input);
    if (error) throw new Error(error);
    this.db
      .prepare(
        `insert into sessions (profile_id, song_id, mode, focus, tempo, play_time, hits, misses,
           wrong, completed, started_at, day) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        profile,
        input.songId,
        input.mode,
        input.focus,
        input.tempo,
        input.playTime,
        input.hits,
        input.misses,
        input.wrong,
        input.completed ? 1 : 0,
        input.startedAt,
        input.day,
      );
  }

  summary(today: string): HistorySummary {
    const profile = this.requireProfile();
    const totals = this.db
      .prepare(
        `select coalesce(sum(play_time), 0) as playTime, count(*) as sessions,
           coalesce(sum(case when day = ? then play_time end), 0) as todayTime
         from sessions where profile_id = ?`,
      )
      .get(today, profile) as { playTime: number; sessions: number; todayTime: number };
    const dayRows = this.db
      .prepare(
        'select day, sum(play_time) as playTime from sessions where profile_id = ? group by day',
      )
      .all(profile) as { day: string; playTime: number }[];
    const byDay = new Map(dayRows.map((r) => [r.day, r.playTime]));
    const { current, best } = streaks([...byDay.keys()], today);
    const days = Array.from({ length: CHART_DAYS }, (_, i) => {
      const day = shiftDay(today, i - CHART_DAYS + 1);
      return { day, playTime: byDay.get(day) ?? 0 };
    });
    const recent = this.db
      .prepare(
        `select s.*, coalesce(songs.title, 'Removed song') as title from sessions s
         left join songs on songs.id = s.song_id
         where s.profile_id = ? order by s.started_at desc limit ?`,
      )
      .all(profile, RECENT) as (SessionRow & { title: string })[];

    return {
      ...totals,
      streak: current,
      bestStreak: best,
      days,
      recent: recent.map((r) => ({ ...toRecord(r), title: r.title })),
    };
  }

  song(songId: string): SongHistory {
    const profile = this.profile();
    if (!profile) return { playTime: 0, sessions: 0, completions: 0, lastPlayedAt: null, best: [] };
    const rows = (
      this.db
        .prepare('select * from sessions where profile_id = ? and song_id = ? order by started_at')
        .all(profile, songId) as SessionRow[]
    ).map(toRecord);
    return {
      playTime: rows.reduce((sum, r) => sum + r.playTime, 0),
      sessions: rows.length,
      completions: rows.filter((r) => r.completed).length,
      lastPlayedAt: rows.at(-1)?.startedAt ?? null,
      best: bestScores(rows),
    };
  }

  private requireProfile(): string {
    const profile = this.profile();
    if (!profile) throw new Error('No profile selected.');
    return profile;
  }
}
