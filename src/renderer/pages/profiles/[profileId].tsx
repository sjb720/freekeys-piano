import { ProfileForm } from '@renderer/features/profiles';
import { Page } from '@renderer/features/shell';
import { useParams } from '@renderer/router';
import { useProfileStore } from '@renderer/state/profileStore';
import { Text } from '@renderer/ui';

export default function EditProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const profile = useProfileStore((s) => s.profiles.find((p) => p.id === profileId));
  if (!profile) {
    return (
      <Page title="Profile not found">
        <Text tone="muted">This profile was deleted.</Text>
      </Page>
    );
  }
  return (
    <Page title="Edit profile">
      <ProfileForm key={profile.id} profile={profile} />
    </Page>
  );
}
