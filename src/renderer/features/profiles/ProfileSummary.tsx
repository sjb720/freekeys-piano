import { Pencil, Users } from 'lucide-react';
import { useNavigate } from '@renderer/router';
import { selectProfile, useActiveProfile } from '@renderer/state/profileStore';
import { Button, Card, Stack, Text } from '@renderer/ui';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfileSummary() {
  const navigate = useNavigate();
  const profile = useActiveProfile();
  if (!profile) return null;

  const switchProfile = async () => {
    await selectProfile(null);
    navigate.to('/');
  };

  return (
    <Card>
      <Stack direction="row" align="center" gap="lg" wrap>
        <ProfileAvatar icon={profile.icon} color={profile.color} size="lg" />
        <Stack grow gap="none">
          <Text variant="title" truncate>
            {profile.name}
          </Text>
          <Text tone="muted">The settings below are just for you.</Text>
        </Stack>
        <Stack direction="row" gap="sm">
          <Button
            icon={Pencil}
            onClick={() => navigate.to(`/profiles/${encodeURIComponent(profile.id)}`)}
          >
            Edit
          </Button>
          <Button icon={Users} onClick={() => void switchProfile()}>
            Switch
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
