import { FolderOpen, Piano, ScrollText } from 'lucide-react';
import { useFolders } from '@renderer/features/library';
import { ProfileSummary } from '@renderer/features/profiles';
import { SettingsSections } from '@renderer/features/settings';
import { Page, useAppInfo } from '@renderer/features/shell';
import { useNavigate } from '@renderer/router';
import { ListItem, Stack, Text } from '@renderer/ui';

const folderText = (count: number) =>
  count === 0 ? 'No folders yet' : `${count} ${count === 1 ? 'folder' : 'folders'}`;

export default function SettingsPage() {
  const navigate = useNavigate();
  const info = useAppInfo();
  const { folders } = useFolders();

  return (
    <Page title="Settings" narrow>
      <ProfileSummary />
      <SettingsSections layer="profile" />
      <Stack gap="sm">
        <Stack gap="none">
          <Text variant="heading">System</Text>
          <Text variant="caption" tone="muted">
            Shared by everyone on this computer.
          </Text>
        </Stack>
        <ListItem
          icon={FolderOpen}
          title="Songs"
          subtitle={`${folders ? folderText(folders.length) : 'Song folders'} · Open a file`}
          onPress={() => navigate.to('/settings/songs')}
        />
        <ListItem
          icon={Piano}
          title="MIDI & audio"
          subtitle="Keyboard and volume"
          onPress={() => navigate.to('/settings/devices')}
        />
        <ListItem
          icon={ScrollText}
          title="Credits & licenses"
          subtitle="Included songs and sounds"
          onPress={() => navigate.to('/settings/credits')}
        />
      </Stack>
      {info && (
        <Text variant="caption" tone="muted" align="center">
          FreeKeys {info.version}
        </Text>
      )}
    </Page>
  );
}
