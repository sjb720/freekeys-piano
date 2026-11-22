import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import styles from './PixiStage.module.css';

// Pixi ignores DOM pointercancel, so an interrupted touch would leave keys held and drags active.
// Cancel events carry button -1, so the forwarded release names the primary button Pixi pressed.
const forwardCancel = (e: PointerEvent) => {
  const { pointerId, pointerType, isPrimary, clientX, clientY } = e;
  window.dispatchEvent(
    new PointerEvent('pointerup', {
      pointerId,
      pointerType,
      isPrimary,
      clientX,
      clientY,
      button: 0,
    }),
  );
};

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
        app.canvas.addEventListener('pointercancel', forwardCancel);
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
