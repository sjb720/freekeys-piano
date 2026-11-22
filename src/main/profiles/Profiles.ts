import type { DatabaseSync } from 'node:sqlite';
import { profileInputError, type Profile, type ProfileInput } from '@shared/profiles';
import {
  isValidSettingValue,
  SETTINGS,
  type SettingKey,
  type SettingValues,
} from '@shared/settings';
import { APP_SCOPE, ProfileDb } from './ProfileDb';

export class Profiles {
  private readonly db: ProfileDb;
  private activeId: string | null = null;

  constructor(db: DatabaseSync) {
    this.db = new ProfileDb(db);
  }

  list = (): Profile[] => this.db.list();
  active = (): Profile | null => (this.activeId ? this.db.get(this.activeId) : null);
  activeIdOrNull = (): string | null => this.activeId;

  create(input: ProfileInput): Profile {
    this.validate(input);
    return this.db.create(input);
  }

  update(id: string, input: ProfileInput): Profile {
    this.validate(input, id);
    const profile = this.db.update(id, input);
    if (!profile) throw new Error('Profile not found.');
    return profile;
  }

  delete(id: string): void {
    this.db.delete(id);
    if (this.activeId === id) this.activeId = null;
  }

  select(id: string | null): Profile | null {
    if (id === null) {
      this.activeId = null;
      return null;
    }
    if (!this.db.get(id)) throw new Error('Profile not found.');
    this.db.touch(id);
    this.activeId = id;
    return this.db.get(id);
  }

  loadSettings(): Partial<SettingValues> {
    const merged = {
      ...this.pick(this.db.settings(APP_SCOPE), 'app'),
      ...(this.activeId ? this.pick(this.db.settings(this.activeId), 'profile') : {}),
    };
    return merged as Partial<SettingValues>;
  }

  setSetting(key: string, value: unknown): void {
    if (!isValidSettingValue(key, value)) throw new Error(`Invalid value for setting "${key}".`);
    const { layer } = SETTINGS[key as SettingKey];
    if (layer === 'profile' && !this.activeId) throw new Error('No profile selected.');
    this.db.setSetting(layer === 'app' ? APP_SCOPE : this.activeId!, key, value);
  }

  private pick(stored: Record<string, unknown>, layer: 'app' | 'profile'): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([key, value]) =>
          isValidSettingValue(key, value) && SETTINGS[key as SettingKey].layer === layer,
      ),
    );
  }

  private validate(input: ProfileInput, id?: string): void {
    const taken = this.db
      .list()
      .filter((p) => p.id !== id)
      .map((p) => p.name);
    const error = profileInputError(input, taken);
    if (error) throw new Error(error);
  }
}
