import { FolderOpen } from 'lucide-react';
import { SongList, useSongList } from '@renderer/features/library';
import { Page } from '@renderer/features/shell';
import { useNavigate } from '@renderer/router';
import { Button, Text } from '@renderer/ui';

export default function LibraryPage() {
  const navigate = useNavigate();
  const songs = useSongList();
  const play = (id: string) => navigate.to(`/play/${encodeURIComponent(id)}`);

  const openFile = async () => {
    const ref = await window.api.songs.pick();
    if (ref) play(ref.id);
  };

  return (
    <Page
      title="Library"
      actions={
        <Button icon={FolderOpen} onClick={openFile}>
          Open MIDI file
        </Button>
      }
    >
      {songs?.length === 0 && <Text tone="muted">No songs yet.</Text>}
      {songs && <SongList songs={songs} onSelect={(s) => play(s.id)} />}
    </Page>
  );
}
