import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { cleanName, type Profile, type ProfileInput } from '@shared/profiles';
import { transaction } from '../db';

type ProfileRow = {
  id: string;
  name: string;
  icon: Profile['icon'];
  color: Profile['color'];
  created_at: number;
  last_used_at: number | null;
};

const toProfile = (r: ProfileRow): Profile => ({
  id: r.id,
  name: r.name,
  icon: r.icon,
  color: r.color,
  createdAt: r.created_at,
  lastUsedAt: r.last_used_at,
});

export const APP_SCOPE = 'app';

export class ProfileDb {
  constructor(private readonly db: DatabaseSync) {}

  list(): Profile[] {
    const rows = this.db
      .prepare('select * from profiles order by created_at, name')
      .all() as ProfileRow[];
    return rows.map(toProfile);
  }

  get(id: string): Profile | null {
    const row = this.db.prepare('select * from profiles where id = ?').get(id) as
      ProfileRow | undefined;
    return row ? toProfile(row) : null;
  }

  create(input: ProfileInput, now = Date.now()): Profile {
    const id = randomUUID();
    this.db
      .prepare('insert into profiles (id, name, icon, color, created_at) values (?, ?, ?, ?, ?)')
      .run(id, cleanName(input.name), input.icon, input.color, now);
    return this.get(id)!;
  }

  update(id: string, input: ProfileInput): Profile | null {
    this.db
      .prepare('update profiles set name = ?, icon = ?, color = ? where id = ?')
      .run(cleanName(input.name), input.icon, input.color, id);
    return this.get(id);
  }

  delete(id: string): void {
    transaction(this.db, () => {
      this.db.prepare('delete from settings where scope = ?').run(id);
      this.db.prepare('delete from profiles where id = ?').run(id);
    });
  }

  touch(id: string, now = Date.now()): void {
    this.db.prepare('update profiles set last_used_at = ? where id = ?').run(now, id);
  }

  settings(scope: string): Record<string, unknown> {
    const rows = this.db.prepare('select key, value from settings where scope = ?').all(scope) as {
      key: string;
      value: string;
    }[];
    return Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value) as unknown]));
  }

  setSetting(scope: string, key: string, value: unknown): void {
    this.db
      .prepare(
        `insert into settings (scope, key, value) values (?, ?, ?)
         on conflict(scope, key) do update set value = excluded.value`,
      )
      .run(scope, key, JSON.stringify(value));
  }
}
