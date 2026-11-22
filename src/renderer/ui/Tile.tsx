import type { ReactNode } from 'react';
import styles from './Tile.module.css';

export type TileProps = {
  label: string;
  onPress: () => void;
  children: ReactNode;
  overlay?: ReactNode;
};

export function Tile({ label, onPress, children, overlay }: TileProps) {
  return (
    <button type="button" className={styles.tile} onClick={onPress}>
      <span className={styles.visual}>
        {children}
        {overlay && <span className={styles.overlay}>{overlay}</span>}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
