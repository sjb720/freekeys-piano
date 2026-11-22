import { DatabaseSync } from 'node:sqlite';
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

const SCHEMA = `
create table if not exists folders (path text primary key, added_at integer not null);
create table if not exists songs (
  id text primary key,
  title text not null,
  duration real not null,
  note_count integer not null,
  hand_source text not null,
  difficulty text not null,
  analysis_version integer not null,
  hands text,
  favorite integer not null default 0,
  added_at integer not null
);
create table if not exists files (
  path text primary key,
  song_id text references songs(id),
  source text not null,
  folder text,
  mtime real not null,
  size integer not null
);
create index if not exists files_song on files(song_id);
create index if not exists files_folder on files(folder);
`;

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
  select s.*, f.source from songs s
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
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec('pragma journal_mode = wal; pragma foreign_keys = on;');
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  transaction(fn: () => void): void {
    this.db.exec('begin');
    try {
      fn();
      this.db.exec('commit');
    } catch (error) {
      this.db.exec('rollback');
      throw error;
    }
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

  listSongs(): SongRef[] {
    return (this.db.prepare(SONG_SELECT).all() as SongRow[]).map(toRef);
  }

  getSong(id: string): SongRef | null {
    const row = this.db.prepare(`${SONG_SELECT} where s.id = ?`).get(id) as SongRow | undefined;
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

  setFavorite(id: string, favorite: boolean): void {
    this.db.prepare('update songs set favorite = ? where id = ?').run(favorite ? 1 : 0, id);
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
