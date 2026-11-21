import { Page } from '../shell';
import { Stack, Text } from '@renderer/ui';
import { usePlayerSession } from './hooks';
import { PlayerToolbar } from './PlayerToolbar';
import { SongStage } from './SongStage';

export function PlayerView({ songId }: { songId: string }) {
  const session = usePlayerSession(songId);

  if (session.status === 'loading') {
    return (
      <Stack grow align="center" justify="center">
        <Text tone="muted">Loading…</Text>
      </Stack>
    );
  }

  if (session.status === 'error') {
    return (
      <Page title="Couldn't open song">
        <Text tone="danger">{session.message}</Text>
      </Page>
    );
  }

  return (
    <Stack grow gap="none">
      <PlayerToolbar player={session.player} songId={session.songId} />
      <SongStage player={session.player} />
    </Stack>
  );
}
