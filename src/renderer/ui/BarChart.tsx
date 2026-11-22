import { useState, type CSSProperties } from 'react';
import styles from './BarChart.module.css';

export type Bar = { key: string; tick: string; value: number; detail: string; labeled?: boolean };

export type BarChartProps = {
  label: string;
  bars: readonly Bar[];
  valueText: (value: number) => string;
};

export function BarChart({ label, bars, valueText }: BarChartProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const max = Math.max(...bars.map((b) => b.value), 0);
  const active = bars.find((b) => b.key === focused);

  return (
    <div className={styles.chart}>
      <div className={styles.readout} aria-live="polite">
        {active ? active.detail : ' '}
      </div>
      <div
        className={styles.plot}
        role="list"
        aria-label={label}
        onPointerLeave={() => setFocused(null)}
      >
        {bars.map((bar) => {
          const height = max ? (bar.value / max) * 100 : 0;
          return (
            <button
              key={bar.key}
              type="button"
              role="listitem"
              aria-label={bar.detail}
              className={`${styles.column} ${bar.key === focused ? styles.focused : ''}`}
              style={{ '--height': `${height}%` } as CSSProperties}
              onPointerEnter={() => setFocused(bar.key)}
              onFocus={() => setFocused(bar.key)}
              onClick={() => setFocused(bar.key)}
            >
              {bar.labeled && bar.value > 0 && (
                <span className={styles.value}>{valueText(bar.value)}</span>
              )}
              <span className={styles.bar} />
            </button>
          );
        })}
      </div>
      <div className={styles.ticks} aria-hidden>
        {bars.map((bar) => (
          <span key={bar.key}>{bar.tick}</span>
        ))}
      </div>
    </div>
  );
}
