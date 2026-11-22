import styles from './Stat.module.css';

export type StatProps = { label: string; value: string; caption?: string };

export function Stat({ label, value, caption }: StatProps) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
  );
}
