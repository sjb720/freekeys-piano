import type { Application } from 'pixi.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Player } from '@renderer/engine';
import { PianoScene } from '@renderer/scene';
import { useSetting } from '@renderer/state/settingsStore';
import { toPixiPalette, useActiveTheme } from '@renderer/themes';
import { PixiStage } from '../stage';

export function SongStage({ player }: { player: Player }) {
  const theme = useActiveTheme();
  const palette = useMemo(() => toPixiPalette(theme), [theme]);
  const fallTime = useSetting('noteFallTime');
  const scene = useRef<PianoScene | null>(null);
  const latest = useRef({ palette, fallTime });

  useEffect(() => {
    latest.current = { palette, fallTime };
    scene.current?.setPalette(palette);
    scene.current?.setFallTime(fallTime);
  }, [palette, fallTime]);

  const onReady = useCallback(
    (app: Application) => {
      const instance = new PianoScene(app, {
        song: player.song,
        position: player.position,
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
