import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AUTO_HANDS, type HandOverride } from '@shared/song';

type HandOverrideState = {
  bySong: Record<string, HandOverride>;
  set: (songId: string, override: HandOverride) => void;
};

export const useHandOverrideStore = create<HandOverrideState>()(
  persist(
    (set) => ({
      bySong: {},
      set: (songId, override) =>
        set((s) => {
          const bySong = { ...s.bySong };
          if (override.kind === 'auto') delete bySong[songId];
          else bySong[songId] = override;
          return { bySong };
        }),
    }),
    { name: 'hand-overrides:v1', storage: createJSONStorage(() => localStorage) },
  ),
);

export const getHandOverride = (songId: string): HandOverride =>
  useHandOverrideStore.getState().bySong[songId] ?? AUTO_HANDS;

export const setHandOverride = (songId: string, override: HandOverride) =>
  useHandOverrideStore.getState().set(songId, override);
