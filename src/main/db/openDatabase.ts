import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

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
create table if not exists profiles (
  id text primary key,
  name text not null,
  icon text not null,
  color integer not null,
  created_at integer not null,
  last_used_at integer
);
create table if not exists settings (
  scope text not null,
  key text not null,
  value text not null,
  primary key (scope, key)
);
create table if not exists favorites (
  profile_id text not null references profiles(id) on delete cascade,
  song_id text not null,
  primary key (profile_id, song_id)
);
`;

export function openDatabase(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec('pragma journal_mode = wal; pragma foreign_keys = on;');
  db.exec(SCHEMA);
  return db;
}

export function transaction(db: DatabaseSync, fn: () => void): void {
  db.exec('begin');
  try {
    fn();
    db.exec('commit');
  } catch (error) {
    db.exec('rollback');
    throw error;
  }
}

export const databasePath = (userData: string) => join(userData, 'app.db');
