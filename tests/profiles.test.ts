import { mkdtempSync, rmSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/main/db';
import { Profiles } from '../src/main/profiles';

describe('Profiles', () => {
  let dir: string;
  let db: DatabaseSync;
  let profiles: Profiles;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'profiles-'));
    db = openDatabase(join(dir, 'app.db'));
    profiles = new Profiles(db);
  });

  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('creates, renames, and deletes profiles', () => {
    const sam = profiles.create({ name: '  Sam  ', icon: 'cat', color: 1 });
    expect(sam.name).toBe('Sam');
    expect(() => profiles.create({ name: 'sam', icon: 'dog', color: 2 })).toThrow(/used/);
    expect(profiles.update(sam.id, { name: 'Sammy', icon: 'dog', color: 3 }).icon).toBe('dog');
    profiles.delete(sam.id);
    expect(profiles.list()).toEqual([]);
  });

  it('keeps profile settings separate and app settings shared', () => {
    const a = profiles.create({ name: 'A', icon: 'cat', color: 1 });
    const b = profiles.create({ name: 'B', icon: 'dog', color: 2 });
    profiles.select(a.id);
    profiles.setSetting('theme', 'light');
    profiles.setSetting('volume', 0.5);
    profiles.select(b.id);
    expect(profiles.loadSettings()).toEqual({ volume: 0.5 });
    profiles.select(a.id);
    expect(profiles.loadSettings()).toEqual({ volume: 0.5, theme: 'light' });
  });

  it('rejects invalid settings and profile settings without a profile', () => {
    expect(() => profiles.setSetting('volume', 4)).toThrow(/Invalid/);
    expect(() => profiles.setSetting('nope', 1)).toThrow(/Invalid/);
    expect(() => profiles.setSetting('theme', 'light')).toThrow(/No profile/);
    profiles.setSetting('volume', 0.3);
    expect(profiles.loadSettings()).toEqual({ volume: 0.3 });
  });

  it('drops a deleted profile’s settings and selection', () => {
    const a = profiles.create({ name: 'A', icon: 'cat', color: 1 });
    profiles.select(a.id);
    profiles.setSetting('theme', 'light');
    profiles.delete(a.id);
    expect(profiles.active()).toBeNull();
    const again = profiles.create({ name: 'A', icon: 'cat', color: 1 });
    profiles.select(again.id);
    expect(profiles.loadSettings()).toEqual({});
  });
});
