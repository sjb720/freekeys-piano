import { useState } from 'react';
import { formatDuration, type HistorySummary } from '@shared/history';
import { BarChart, SegmentedControl, Stack, Text } from '@renderer/ui';
import { formatDay } from './format';

const VIEWS = [
  { value: 'chart', label: 'Chart' },
  { value: 'table', label: 'Table' },
] as const;

export function ActivityChart({ days }: { days: HistorySummary['days'] }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const peak = days.reduce((best, d) => (d.playTime > best.playTime ? d : best), days[0]!);
  const today = days.at(-1)!;
  const bars = days.map((d) => ({
    key: d.day,
    tick: formatDay(d.day, 'tick'),
    value: d.playTime,
    detail: `${formatDay(d.day)} · ${d.playTime ? formatDuration(d.playTime) : 'No practice'}`,
    labeled: d.day === peak.day || d.day === today.day,
  }));

  return (
    <Stack gap="sm">
      <Stack direction="row" align="center" justify="between" gap="md" wrap>
        <Text variant="heading">Practice time, last {days.length} days</Text>
        <SegmentedControl label="View" options={VIEWS} value={view} onChange={setView} />
      </Stack>
      {view === 'chart' ? (
        <BarChart label="Practice time per day" bars={bars} valueText={formatDuration} />
      ) : (
        <Stack gap="xs">
          {[...days].reverse().map((d) => (
            <Stack key={d.day} direction="row" justify="between">
              <Text tone="muted">{formatDay(d.day)}</Text>
              <Text>{d.playTime ? formatDuration(d.playTime) : '—'}</Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
