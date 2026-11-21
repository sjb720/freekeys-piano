import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  defaultSettings,
  type SettingKey,
  type SettingValue,
  type SettingValues,
} from '@shared/settings';

type SettingsState = {
  values: SettingValues;
  set: <K extends SettingKey>(key: K, value: SettingValue<K>) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      values: defaultSettings(),
      set: (key, value) => set((s) => ({ values: { ...s.values, [key]: value } })),
      reset: () => set({ values: defaultSettings() }),
    }),
    {
      name: 'settings:v1',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => ({
        ...current,
        values: { ...current.values, ...(persisted as Partial<SettingsState>)?.values },
      }),
    },
  ),
);

export function useSetting<K extends SettingKey>(key: K): SettingValue<K> {
  return useSettingsStore((s) => s.values[key]);
}

export const setSetting = <K extends SettingKey>(key: K, value: SettingValue<K>) =>
  useSettingsStore.getState().set(key, value);
