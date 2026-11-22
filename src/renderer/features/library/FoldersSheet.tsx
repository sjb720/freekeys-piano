import { FolderPlus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, IconButton, Sheet, Stack, Text } from '@renderer/ui';
import { ScanStatusText } from './ScanStatusText';

export type FoldersSheetProps = { open: boolean; onClose: () => void };

export function FoldersSheet({ open, onClose }: FoldersSheetProps) {
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    if (open) void window.api.library.folders().then(setFolders);
  }, [open]);

  return (
    <Sheet title="Library folders" open={open} onClose={onClose}>
      <Text tone="muted">
        MIDI files in these folders and their subfolders are added to your library.
      </Text>
      <Stack gap="xs">
        {folders.length === 0 && <Text tone="muted">No folders yet.</Text>}
        {folders.map((folder) => (
          <Stack key={folder} direction="row" align="center" gap="sm">
            <Stack grow>
              <Text truncate>{folder}</Text>
            </Stack>
            <IconButton
              icon={Trash2}
              label={`Remove ${folder}`}
              onClick={() => void window.api.library.removeFolder(folder).then(setFolders)}
            />
          </Stack>
        ))}
      </Stack>
      <ScanStatusText />
      <Stack direction="row" gap="sm" wrap>
        <Button
          icon={FolderPlus}
          variant="primary"
          onClick={() => void window.api.library.addFolder().then(setFolders)}
        >
          Add folder
        </Button>
        <Button icon={RefreshCw} onClick={() => void window.api.library.rescan()}>
          Rescan
        </Button>
      </Stack>
    </Sheet>
  );
}
