import { History } from 'lucide-react';
import { formatDuration } from '@shared/history';
import { useNavigate } from '@renderer/router';
import { ListItem, Stack, Stat, Text } from '@renderer/ui';
import { ActivityChart } from './ActivityChart';
import { formatDay, sessionText } from './format';
import { useHistorySummary } from './useHistory';

const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

export function ProgressOverview() {
  const summary = useHistorySummary();
  const navigate = useNavigate();
  if (!summary) return null;

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" wrap>
        <Stat
          label="Streak"
          value={days(summary.streak)}
          caption={`Best ${days(summary.bestStreak)}`}
        />
        <Stat label="Today" value={formatDuration(summary.todayTime)} />
        <Stat
          label="All time"
          value={formatDuration(summary.playTime)}
          caption={`${summary.sessions} session${summary.sessions === 1 ? '' : 's'}`}
        />
      </Stack>
      <ActivityChart days={summary.days} />
      <Stack gap="sm">
        <Text variant="heading">Recent practice</Text>
        {summary.recent.length === 0 && (
          <Text tone="muted">
            Practice a song for at least 10 seconds and it will show up here.
          </Text>
        )}
        {summary.recent.map((s) => (
          <ListItem
            key={s.id}
            icon={History}
            title={s.title}
            subtitle={`${formatDay(s.day)} · ${formatDuration(s.playTime)} · ${sessionText(s)}`}
            onPress={() => navigate.to(`/song/${encodeURIComponent(s.songId)}`)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
