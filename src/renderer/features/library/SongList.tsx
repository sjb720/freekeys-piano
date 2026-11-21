import { Music } from 'lucide-react';
import type { SongRef } from '@shared/ipc';
import { Stack, ListItem } from '@renderer/ui';

const SOURCE_LABEL: Record<SongRef['source'], string> = {
  bundled: 'Demo',
  file: 'Opened file',
};

export type SongListProps = {
  songs: SongRef[];
  onSelect: (song: SongRef) => void;
};

export function SongList({ songs, onSelect }: SongListProps) {
  return (
    <Stack gap="sm">
      {songs.map((song) => (
        <ListItem
          key={song.id}
          icon={Music}
          title={song.title}
          subtitle={SOURCE_LABEL[song.source]}
          onPress={() => onSelect(song)}
        />
      ))}
    </Stack>
  );
}
