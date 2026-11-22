import { Settings, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { clearFilters, isFiltered, querySongs } from '@shared/library';
import { LibraryFilters, ScanStatusText, SongList } from '@renderer/features/library';
import { ProfileButton } from '@renderer/features/profiles';
import { Page } from '@renderer/features/shell';
import { useNavigate } from '@renderer/router';
import { useLibraryStore, useSongQueryStore } from '@renderer/state/libraryStore';
import { Button, Stack, Text } from '@renderer/ui';

export default function LibraryPage() {
  const navigate = useNavigate();
  const songs = useLibraryStore((s) => s.songs);
  const query = useSongQueryStore((s) => s.query);
  const setQuery = useSongQueryStore((s) => s.set);
  const visible = useMemo(() => (songs ? querySongs(songs, query) : null), [songs, query]);
  const filtered = isFiltered(query);

  return (
    <Page
      title="Library"
      back={false}
      actions={
        <>
          <Button variant="ghost" icon={TrendingUp} onClick={() => navigate.to('/progress')}>
            Progress
          </Button>
          <Button variant="ghost" icon={Settings} onClick={() => navigate.to('/settings')}>
            Settings
          </Button>
          <ProfileButton />
        </>
      }
    >
      <LibraryFilters />
      <ScanStatusText />
      {songs?.length === 0 && (
        <Stack align="center" gap="md" padding="xl">
          <Text variant="heading" align="center">
            No songs yet
          </Text>
          <Text tone="muted" align="center">
            Add MIDI files or a folder of them in Settings, or drag files onto this window.
          </Text>
          <Button variant="primary" onClick={() => navigate.to('/settings/songs')}>
            Add songs
          </Button>
        </Stack>
      )}
      {songs && songs.length > 0 && visible?.length === 0 && (
        <Stack align="center" gap="md" padding="xl">
          <Text tone="muted" align="center">
            No songs match these filters.
          </Text>
          <Button onClick={() => setQuery(clearFilters(query))}>Clear filters</Button>
        </Stack>
      )}
      {visible && visible.length > 0 && (
        <Stack gap="sm">
          <Stack direction="row" align="center" justify="between" gap="sm">
            <Text variant="caption" tone="muted">
              {visible.length} {visible.length === 1 ? 'song' : 'songs'}
            </Text>
            {filtered && (
              <Button variant="ghost" onClick={() => setQuery(clearFilters(query))}>
                Clear filters
              </Button>
            )}
          </Stack>
          <SongList
            songs={visible}
            hand={query.hand}
            onSelect={(s) => navigate.to(`/song/${encodeURIComponent(s.id)}`)}
          />
        </Stack>
      )}
    </Page>
  );
}
