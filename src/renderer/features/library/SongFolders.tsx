import { Folder, FolderPlus, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Card, Icon, IconButton, Stack, Text } from '@renderer/ui';
import { ScanStatusText } from './ScanStatusText';
import { useFolders } from './useFolders';

export function SongFolders() {
  const { folders, add, remove } = useFolders();
  return (
    <Card>
      <Stack gap="xs">
        <Text variant="heading">Song folders</Text>
        <Text tone="muted">
          MIDI files in these folders and their subfolders are added to the library for every
          profile.
        </Text>
      </Stack>
      <Stack gap="sm">
        {folders?.length === 0 && <Text tone="muted">No folders yet.</Text>}
        {folders?.map((folder) => (
          <Stack key={folder} direction="row" align="center" gap="md">
            <Icon icon={Folder} />
            <Stack grow>
              <Text truncate>{folder}</Text>
            </Stack>
            <IconButton
              icon={Trash2}
              label={`Remove ${folder}`}
              onClick={() => void remove(folder)}
            />
          </Stack>
        ))}
      </Stack>
      <ScanStatusText />
      <Stack direction="row" gap="sm" wrap>
        <Button icon={FolderPlus} variant="primary" onClick={() => void add()}>
          Add folder
        </Button>
        <Button icon={RefreshCw} onClick={() => void window.api.library.rescan()}>
          Rescan
        </Button>
      </Stack>
    </Card>
  );
}
