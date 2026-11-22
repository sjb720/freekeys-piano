import { ImportSongs, OpenSongFile, SongFolders } from '@renderer/features/library';
import { Page } from '@renderer/features/shell';

export default function SongSettingsPage() {
  return (
    <Page title="Songs" narrow>
      <ImportSongs />
      <SongFolders />
      <OpenSongFile />
    </Page>
  );
}
