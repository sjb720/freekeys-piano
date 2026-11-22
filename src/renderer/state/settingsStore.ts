import { create } from 'zustand';
import {
  defaultSettings,
  type SettingKey,
  type SettingValue,
  type SettingValues,
} from '@shared/settings';

type SettingsState = { values: SettingValues };

export const useSettingsStore = create<SettingsState>()(() => ({ values: defaultSettings() }));

export async function loadSettings(): Promise<void> {
  const stored = await window.api.settings.load();
  useSettingsStore.setState({ values: { ...defaultSettings(), ...stored } });
}

export function useSetting<K extends SettingKey>(key: K): SettingValue<K> {
  return useSettingsStore((s) => s.values[key]);
}

export function setSetting<K extends SettingKey>(key: K, value: SettingValue<K>): void {
  useSettingsStore.setState((s) => ({ values: { ...s.values, [key]: value } }));
  void window.api.settings.set(key, value).catch((error: unknown) => {
    console.error(error);
    void loadSettings();
  });
}
