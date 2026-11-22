import { ProfileForm } from '@renderer/features/profiles';
import { Page } from '@renderer/features/shell';

export default function NewProfilePage() {
  return (
    <Page title="New profile">
      <ProfileForm />
    </Page>
  );
}
