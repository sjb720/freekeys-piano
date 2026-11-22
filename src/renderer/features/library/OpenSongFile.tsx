import { FolderOpen } from 'lucide-react';
import { useNavigate } from '@renderer/router';
import { Button, Card, Stack, Text } from '@renderer/ui';

export function OpenSongFile() {
  const navigate = useNavigate();
  const open = async () => {
    const ref = await window.api.songs.pick();
    if (ref) navigate.to(`/play/${encodeURIComponent(ref.id)}`);
  };
  return (
    <Card>
      <Stack gap="xs">
        <Text variant="heading">Open a single file</Text>
        <Text tone="muted">Play a MIDI file right away without adding its folder.</Text>
      </Stack>
      <Stack direction="row">
        <Button icon={FolderOpen} onClick={() => void open()}>
          Open file…
        </Button>
      </Stack>
    </Card>
  );
}
