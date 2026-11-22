import { FolderOpen, Folders } from 'lucide-react';
import { useMemo, useState } from 'react';
import { querySongs } from '@shared/library';
import { FoldersSheet, LibraryFilters, ScanStatusText, SongList } from '@renderer/features/library';
import { Page } from '@renderer/features/shell';
import { useNavigate } from '@renderer/router';
import { useLibraryStore, useSongQueryStore } from '@renderer/state/libraryStore';
import { Button, Text } from '@renderer/ui';

export default function LibraryPage() {
  const navigate = useNavigate();
  const songs = useLibraryStore((s) => s.songs);
  const query = useSongQueryStore((s) => s.query);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const visible = useMemo(() => (songs ? querySongs(songs, query) : null), [songs, query]);

  const openFile = async () => {
    const ref = await window.api.songs.pick();
    if (ref) navigate.to(`/play/${encodeURIComponent(ref.id)}`);
  };

  return (
    <Page
      title="Library"
      actions={
        <>
          <Button icon={Folders} onClick={() => setFoldersOpen(true)}>
            Folders
          </Button>
          <Button icon={FolderOpen} onClick={openFile}>
            Open file
          </Button>
        </>
      }
    >
      <LibraryFilters />
      <ScanStatusText />
      {songs?.length === 0 && <Text tone="muted">No songs yet. Add a folder of MIDI files.</Text>}
      {songs && songs.length > 0 && visible?.length === 0 && (
        <Text tone="muted">No songs match these filters.</Text>
      )}
      {visible && (
        <SongList
          songs={visible}
          hand={query.hand}
          onSelect={(s) => navigate.to(`/song/${encodeURIComponent(s.id)}`)}
        />
      )}
      <FoldersSheet open={foldersOpen} onClose={() => setFoldersOpen(false)} />
    </Page>
  );
}
