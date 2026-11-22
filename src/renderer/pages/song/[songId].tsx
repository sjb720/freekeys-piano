import { Play, Star } from 'lucide-react';
import { DifficultyBreakdown, SOURCE_LABEL, useSong } from '@renderer/features/library';
import { formatTime } from '@renderer/features/player';
import { Page } from '@renderer/features/shell';
import { useNavigate, useParams } from '@renderer/router';
import { Button, IconButton, Stack, Text } from '@renderer/ui';

const HAND_SOURCE = {
  tracks: 'Hands from the file’s tracks',
  heuristic: 'Hands detected automatically',
};

export default function SongPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const song = useSong(songId);

  if (song === undefined) return <Page title="" />;
  if (song === null) {
    return (
      <Page title="Song not found">
        <Text tone="muted">This song is no longer in your library.</Text>
      </Page>
    );
  }

  return (
    <Page
      title={song.title}
      actions={
        <IconButton
          icon={Star}
          label={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
          variant={song.favorite ? 'primary' : 'ghost'}
          aria-pressed={song.favorite}
          onClick={() => void window.api.songs.setFavorite(song.id, !song.favorite)}
        />
      }
    >
      <Text tone="muted">
        {[
          formatTime(song.duration),
          `${song.noteCount} notes`,
          SOURCE_LABEL[song.source],
          HAND_SOURCE[song.handSource],
        ].join(' · ')}
      </Text>
      <DifficultyBreakdown song={song} />
      <Stack direction="row">
        <Button
          icon={Play}
          variant="primary"
          size="lg"
          onClick={() => navigate.to(`/play/${encodeURIComponent(song.id)}`)}
        >
          Play
        </Button>
      </Stack>
    </Page>
  );
}
