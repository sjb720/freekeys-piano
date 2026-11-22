import { useMemo } from 'react';
import type { Song } from '@shared/song';
import { formatTime } from '@renderer/features/player';
import { SeekArea } from '@renderer/ui';
import styles from './SongOverview.module.css';

const PAD = 2;
const MIN_WIDTH_SHARE = 1 / 800;
const MAX_BAR_LINES = 40;

export type SongOverviewProps = { song: Song | null; onSeek?: (time: number) => void };

export function SongOverview({ song, onSeek }: SongOverviewProps) {
  const view = useMemo(() => {
    if (!song || !song.notes.length) return null;
    const { min, max } = song.pitchRange;
    const top = max + PAD;
    const rows = top - min + PAD + 1;
    const minWidth = song.duration * MIN_WIDTH_SHARE;
    return {
      viewBox: `0 0 ${song.duration} ${rows}`,
      bars: song.measures.filter(
        (m, i) =>
          m > 0 && m < song.duration && i % Math.ceil(song.measures.length / MAX_BAR_LINES) === 0,
      ),
      notes: song.notes.map((n) => ({
        id: n.id,
        x: n.start,
        y: top - n.pitch,
        width: Math.max(n.duration, minWidth),
        left: n.hand === 'left',
      })),
      rows,
    };
  }, [song]);

  if (!view) return <div className={styles.banner} aria-hidden />;

  const banner = (
    <svg
      className={styles.banner}
      viewBox={view.viewBox}
      preserveAspectRatio="none"
      role="img"
      aria-label="Overview of every note in the song, left hand and right hand"
      aria-hidden={onSeek ? true : undefined}
    >
      {view.bars.map((x) => (
        <line
          key={x}
          className={styles.bar}
          x1={x}
          x2={x}
          y1={0}
          y2={view.rows}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {view.notes.map((n) => (
        <rect
          key={n.id}
          className={n.left ? styles.left : styles.right}
          x={n.x}
          y={n.y}
          width={n.width}
          height={1}
        />
      ))}
    </svg>
  );

  if (!onSeek || !song) return banner;
  const duration = song.duration;
  return (
    <SeekArea
      label="Play from the start, or click the overview to play from that point"
      onSeek={(fraction) => onSeek(fraction * duration)}
      hint={(fraction) => formatTime(fraction * duration)}
    >
      {banner}
    </SeekArea>
  );
}
