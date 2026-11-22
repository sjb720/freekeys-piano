import { Music } from 'lucide-react';
import { useNavigate } from '@renderer/router';
import { dismissImport, useImportStore } from '@renderer/state/importStore';
import { ListItem, Sheet, Stack, Text } from '@renderer/ui';
import { levelLabel } from './difficulty';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function ImportResultSheet() {
  const navigate = useNavigate();
  const result = useImportStore((s) => s.result);
  const error = useImportStore((s) => s.error);
  const open = result !== null || error !== null;
  const added = result?.added ?? [];
  const skipped = result?.skipped ?? [];
  const title = error
    ? 'Couldn’t add songs'
    : added.length
      ? `Added ${plural(added.length, 'song')}`
      : 'No songs added';

  return (
    <Sheet title={title} open={open} onClose={dismissImport}>
      {error && <Text tone="muted">{error}</Text>}
      {added.length > 0 && (
        <Stack gap="sm">
          {added.map((song) => (
            <ListItem
              key={song.id}
              icon={Music}
              title={song.title}
              subtitle={`${levelLabel(song.difficulty.level)} · level ${song.difficulty.level}`}
              onPress={() => {
                dismissImport();
                navigate.to(`/song/${encodeURIComponent(song.id)}`);
              }}
            />
          ))}
        </Stack>
      )}
      {skipped.length > 0 && (
        <Stack gap="xs">
          <Text variant="heading">Skipped {plural(skipped.length, 'file')}</Text>
          {skipped.map((s) => (
            <Text key={s.name} tone="muted">
              {s.name}: {s.reason}
            </Text>
          ))}
        </Stack>
      )}
    </Sheet>
  );
}
