import { Music, Star } from 'lucide-react';
import type { SongRef } from '@shared/ipc';
import { songLevel } from '@shared/library';
import type { HandFocus } from '@shared/settings';
import { formatTime } from '@renderer/features/player';
import { Icon, ListItem, Stack } from '@renderer/ui';
import { factorText, SOURCE_LABEL } from './difficulty';
import { LevelBadge } from './LevelBadge';

export type SongListProps = {
  songs: readonly SongRef[];
  hand: HandFocus;
  onSelect: (song: SongRef) => void;
};

const HINT_LEVEL = 3;

const subtitle = (song: SongRef) =>
  [
    formatTime(song.duration),
    SOURCE_LABEL[song.source],
    song.difficulty.level >= HINT_LEVEL &&
      song.difficulty.factors[0] &&
      factorText(song.difficulty.factors[0]),
  ]
    .filter(Boolean)
    .join(' · ');

export function SongList({ songs, hand, onSelect }: SongListProps) {
  return (
    <Stack gap="sm">
      {songs.map((song) => (
        <ListItem
          key={song.id}
          icon={Music}
          title={song.title}
          subtitle={subtitle(song)}
          onPress={() => onSelect(song)}
          trailing={
            <Stack direction="row" align="center" gap="sm">
              {song.favorite && <Icon icon={Star} size="sm" />}
              <LevelBadge level={songLevel(song, hand)} />
            </Stack>
          }
        />
      ))}
    </Stack>
  );
}
