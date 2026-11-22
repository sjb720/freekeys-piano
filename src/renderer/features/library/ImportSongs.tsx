import { FilePlus, FolderOpen } from 'lucide-react';
import { runImport, useImportStore } from '@renderer/state/importStore';
import { Button, Card, Stack, Text } from '@renderer/ui';

export function ImportSongs() {
  const busy = useImportStore((s) => s.busy);
  return (
    <Card>
      <Stack gap="xs">
        <Text variant="heading">Add songs</Text>
        <Text tone="muted">
          Choose MIDI files, or drag them onto the window from anywhere in the app. FreeKeys keeps
          its own copy, so you can move or delete the originals.
        </Text>
      </Stack>
      <Stack direction="row" gap="sm" wrap>
        <Button
          icon={FilePlus}
          variant="primary"
          disabled={busy}
          onClick={() => void runImport(() => window.api.songs.import())}
        >
          {busy ? 'Adding…' : 'Add songs…'}
        </Button>
        <Button icon={FolderOpen} onClick={() => void window.api.songs.showImported()}>
          Show added files
        </Button>
      </Stack>
    </Card>
  );
}
