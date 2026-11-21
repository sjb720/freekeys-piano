import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import styles from './PixiStage.module.css';

export type PixiStageProps = {
  onReady: (app: Application) => (() => void) | void;
};

export function PixiStage({ onReady }: PixiStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const el = host.current!;
    const app = new Application();
    let initialized = false;
    let disposed = false;
    let cleanup: (() => void) | void;

    void app
      .init({
        resizeTo: el,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
        backgroundAlpha: 0,
      })
      .then(() => {
        initialized = true;
        if (disposed) return app.destroy(true, { children: true });
        el.appendChild(app.canvas);
        cleanup = onReadyRef.current(app);
      });

    return () => {
      disposed = true;
      cleanup?.();
      if (initialized) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={host} className={styles.stage} />;
}
