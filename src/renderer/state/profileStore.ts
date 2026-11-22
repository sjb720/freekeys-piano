import { create } from 'zustand';
import type { Profile, ProfileInput } from '@shared/profiles';
import { loadSettings } from './settingsStore';

type ProfileState = {
  ready: boolean;
  profiles: Profile[];
  active: Profile | null;
};

export const useProfileStore = create<ProfileState>()(() => ({
  ready: false,
  profiles: [],
  active: null,
}));

const refresh = async () => {
  const [profiles, active] = await Promise.all([
    window.api.profiles.list(),
    window.api.profiles.active(),
  ]);
  useProfileStore.setState({ profiles, active });
};

let initialized: Promise<void> | null = null;

export function initProfiles(): Promise<void> {
  initialized ??= Promise.all([refresh(), loadSettings()]).then(() =>
    useProfileStore.setState({ ready: true }),
  );
  return initialized;
}

export async function selectProfile(id: string | null): Promise<void> {
  const active = await window.api.profiles.select(id);
  await loadSettings();
  useProfileStore.setState({ active });
}

export async function createProfile(input: ProfileInput): Promise<Profile> {
  const profile = await window.api.profiles.create(input);
  await refresh();
  return profile;
}

export async function updateProfile(id: string, input: ProfileInput): Promise<void> {
  await window.api.profiles.update(id, input);
  await refresh();
}

export async function deleteProfile(id: string): Promise<void> {
  await window.api.profiles.delete(id);
  await refresh();
  await loadSettings();
}

export const useActiveProfile = () => useProfileStore((s) => s.active);
