import { SettingsForm } from '@renderer/features/settings';
import { Page } from '@renderer/features/shell';

export default function SettingsPage() {
  return (
    <Page title="Settings">
      <SettingsForm />
    </Page>
  );
}
