import type { Application } from 'pixi.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Player } from '@renderer/engine';
import { inputHub } from '@renderer/input';
import { PianoScene } from '@renderer/scene';
import { useSetting } from '@renderer/state/settingsStore';
import { toPixiPalette, useActiveTheme } from '@renderer/themes';
import { PixiStage } from '../stage';

const TOUCH_VELOCITY = 0.8;

const markersOf = (player: Player): number[] => {
  const { loop, loopDraftStart } = player.getState();
  if (loop) return [loop.start, loop.end];
  return loopDraftStart === null ? [] : [loopDraftStart];
};

export function SongStage({ player }: { player: Player }) {
  const theme = useActiveTheme();
  const palette = useMemo(() => toPixiPalette(theme), [theme]);
  const fallTime = useSetting('noteFallTime');
  const keyLabels = useSetting('keyLabels');
  const noteLabels = useSetting('noteLabels');
  const scene = useRef<PianoScene | null>(null);
  const latest = useRef({ palette, fallTime, keyLabels, noteLabels });

  useEffect(() => {
    latest.current = { palette, fallTime, keyLabels, noteLabels };
    scene.current?.setPalette(palette);
    scene.current?.setFallTime(fallTime);
    scene.current?.setKeyLabels(keyLabels);
    scene.current?.setNoteLabels(noteLabels);
  }, [palette, fallTime, keyLabels, noteLabels]);

  const onReady = useCallback(
    (app: Application) => {
      const instance = new PianoScene(app, {
        song: player.song,
        position: player.position,
        keyStates: () => player.keyFeedback(),
        isActive: player.isActive,
        markers: () => markersOf(player),
        onKey: (pitch, down) =>
          inputHub.emit({
            type: down ? 'on' : 'off',
            pitch,
            velocity: TOUCH_VELOCITY,
            source: 'touch',
          }),
        ...latest.current,
        scrub: {
          onScrubStart: () => player.beginScrub(),
          onScrub: (t) => player.scrubTo(t),
          onScrubEnd: () => player.endScrub(),
        },
      });
      scene.current = instance;
      return () => {
        instance.destroy();
        scene.current = null;
      };
    },
    [player],
  );

  return <PixiStage onReady={onReady} />;
}
