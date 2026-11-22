import { SettingsSections } from '@renderer/features/settings';
import { Page } from '@renderer/features/shell';
import { Text } from '@renderer/ui';

export default function DeviceSettingsPage() {
  return (
    <Page title="MIDI & audio" narrow>
      <Text tone="muted">These settings are shared by every profile on this computer.</Text>
      <SettingsSections layer="app" />
    </Page>
  );
}
