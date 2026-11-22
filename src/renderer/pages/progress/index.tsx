import { ProgressOverview } from '@renderer/features/progress';
import { Page } from '@renderer/features/shell';
import { useActiveProfile } from '@renderer/state/profileStore';

export default function ProgressPage() {
  const profile = useActiveProfile();
  return (
    <Page title={profile ? `${profile.name}’s progress` : 'Progress'}>
      <ProgressOverview />
    </Page>
  );
}
