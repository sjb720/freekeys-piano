import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import styles from './SeekArea.module.css';

export type SeekAreaProps = {
  label: string;
  onSeek: (fraction: number) => void;
  hint?: (fraction: number) => string;
  children: ReactNode;
};

const fractionAt = (e: PointerEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  return Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
};

export function SeekArea({ label, onSeek, hint, children }: SeekAreaProps) {
  const [hover, setHover] = useState<number | null>(null);
  const pressed = useRef<number | null>(null);

  // Seeks on release so touch users can slide to preview the time first.
  const release = (e: PointerEvent<HTMLElement>) => {
    if (pressed.current !== e.pointerId) return;
    pressed.current = null;
    onSeek(fractionAt(e));
  };

  return (
    <button
      type="button"
      className={styles.area}
      aria-label={label}
      onClick={(e) => e.detail === 0 && onSeek(0)}
      onPointerDown={(e) => {
        if (e.button !== 0 || pressed.current !== null) return;
        pressed.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setHover(fractionAt(e));
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'touch' || pressed.current === e.pointerId) setHover(fractionAt(e));
      }}
      onPointerUp={release}
      onPointerCancel={() => {
        pressed.current = null;
        setHover(null);
      }}
      onPointerLeave={(e) => pressed.current !== e.pointerId && setHover(null)}
    >
      {children}
      {hover !== null && (
        <span className={styles.cursor} style={{ left: `${hover * 100}%` }} aria-hidden>
          {hint && (
            <span className={hover > 0.9 ? `${styles.hint} ${styles.flip}` : styles.hint}>
              {hint(hover)}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
