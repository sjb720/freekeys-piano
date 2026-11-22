import type { DatabaseSync } from 'node:sqlite';
import { transaction } from '../db';
import { ANALYSIS_VERSION, type SongSummary } from '@shared/analysis';
import type { SongRef, SongSource } from '@shared/ipc';
import { AUTO_HANDS, type HandOverride } from '@shared/song';

export type FileRow = {
  path: string;
  songId: string | null;
  source: SongSource;
  folder: string | null;
  mtime: number;
  size: number;
};

export type FileInfo = Omit<FileRow, 'songId'>;

const SOURCE_RANK: Record<SongSource, number> = { bundled: 0, library: 1, file: 2 };

type SongRow = {
  id: string;
  title: string;
  duration: number;
  note_count: number;
  hand_source: SongSummary['handSource'];
  difficulty: string;
  hands: string | null;
  favorite: number;
  added_at: number;
  source: SongSource;
};

const SONG_SELECT = `
  select s.*, f.source,
    exists(select 1 from favorites where profile_id = :profile and song_id = s.id) as favorite
  from songs s
  join files f on f.path = (
    select path from files where song_id = s.id
    order by case source when 'bundled' then 0 when 'library' then 1 else 2 end, path limit 1
  )`;

function toRef(row: SongRow): SongRef {
  return {
    id: row.id,
    title: row.title,
    duration: row.duration,
    noteCount: row.note_count,
    handSource: row.hand_source,
    difficulty: JSON.parse(row.difficulty) as SongSummary['difficulty'],
    source: row.source,
    favorite: row.favorite === 1,
    hands: row.hands ? (JSON.parse(row.hands) as HandOverride) : AUTO_HANDS,
    addedAt: row.added_at,
  };
}

export class LibraryDb {
  constructor(private readonly db: DatabaseSync) {}

  transaction(fn: () => void): void {
    transaction(this.db, fn);
  }

  folders(): string[] {
    const rows = this.db.prepare('select path from folders order by path').all() as {
      path: string;
    }[];
    return rows.map((r) => r.path);
  }

  addFolder(path: string, now = Date.now()): void {
    this.db.prepare('insert or ignore into folders (path, added_at) values (?, ?)').run(path, now);
  }

  removeFolder(path: string): void {
    this.transaction(() => {
      this.db.prepare('delete from folders where path = ?').run(path);
      this.db.prepare('delete from files where folder = ?').run(path);
    });
  }

  files(): FileRow[] {
    const rows = this.db
      .prepare('select path, song_id, source, folder, mtime, size from files')
      .all() as {
      path: string;
      song_id: string | null;
      source: SongSource;
      folder: string | null;
      mtime: number;
      size: number;
    }[];
    return rows.map((r) => ({
      path: r.path,
      songId: r.song_id,
      source: r.source,
      folder: r.folder,
      mtime: r.mtime,
      size: r.size,
    }));
  }

  deleteFiles(paths: readonly string[]): void {
    const stmt = this.db.prepare('delete from files where path = ?');
    for (const path of paths) stmt.run(path);
  }

  putSong(id: string, summary: SongSummary, now = Date.now()): void {
    this.db
      .prepare(
        `insert into songs (id, title, duration, note_count, hand_source, difficulty, analysis_version, added_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)
         on conflict(id) do update set title = excluded.title, duration = excluded.duration,
           note_count = excluded.note_count, hand_source = excluded.hand_source,
           difficulty = excluded.difficulty, analysis_version = excluded.analysis_version`,
      )
      .run(
        id,
        summary.title,
        summary.duration,
        summary.noteCount,
        summary.handSource,
        JSON.stringify(summary.difficulty),
        summary.difficulty.version,
        now,
      );
  }

  putFile(file: FileInfo, songId: string | null): void {
    const existing = this.db.prepare('select source from files where path = ?').get(file.path) as
      { source: SongSource } | undefined;
    const keep = existing && SOURCE_RANK[existing.source] < SOURCE_RANK[file.source];
    this.db
      .prepare(
        `insert into files (path, song_id, source, folder, mtime, size) values (?, ?, ?, ?, ?, ?)
         on conflict(path) do update set song_id = excluded.song_id, mtime = excluded.mtime,
           size = excluded.size, source = ?, folder = ?`,
      )
      .run(
        file.path,
        songId,
        file.source,
        file.folder,
        file.mtime,
        file.size,
        keep ? existing.source : file.source,
        keep ? null : file.folder,
      );
  }

  listSongs(profile: string | null): SongRef[] {
    return (this.db.prepare(SONG_SELECT).all({ profile }) as SongRow[]).map(toRef);
  }

  getSong(id: string, profile: string | null): SongRef | null {
    const row = this.db.prepare(`${SONG_SELECT} where s.id = :id`).get({ profile, id }) as
      SongRow | undefined;
    return row ? toRef(row) : null;
  }

  songPath(id: string): string | null {
    const row = this.db
      .prepare(
        `select path from files where song_id = ?
         order by case source when 'bundled' then 0 when 'library' then 1 else 2 end, path limit 1`,
      )
      .get(id) as { path: string } | undefined;
    return row?.path ?? null;
  }

  staleSongs(): { id: string; path: string }[] {
    const ids = this.db
      .prepare('select id from songs where analysis_version < ?')
      .all(ANALYSIS_VERSION) as { id: string }[];
    return ids.flatMap(({ id }) => {
      const path = this.songPath(id);
      return path ? [{ id, path }] : [];
    });
  }

  setFavorite(profile: string, id: string, favorite: boolean): void {
    const sql = favorite
      ? 'insert or ignore into favorites (profile_id, song_id) values (?, ?)'
      : 'delete from favorites where profile_id = ? and song_id = ?';
    this.db.prepare(sql).run(profile, id);
  }

  setHands(id: string, hands: HandOverride): void {
    const value = hands.kind === 'auto' ? null : JSON.stringify(hands);
    this.db.prepare('update songs set hands = ? where id = ?').run(value, id);
  }

  overrides(): Record<string, HandOverride> {
    const rows = this.db.prepare('select id, hands from songs where hands is not null').all() as {
      id: string;
      hands: string;
    }[];
    return Object.fromEntries(rows.map((r) => [r.id, JSON.parse(r.hands) as HandOverride]));
  }
}
