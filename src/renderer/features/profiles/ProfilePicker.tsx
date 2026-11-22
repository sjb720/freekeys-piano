import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '@renderer/router';
import { selectProfile, useProfileStore } from '@renderer/state/profileStore';
import { Avatar, Button, Icon, Stack, Text, Tile } from '@renderer/ui';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfilePicker() {
  const navigate = useNavigate();
  const profiles = useProfileStore((s) => s.profiles);
  const [managing, setManaging] = useState(false);

  const choose = async (id: string) => {
    if (managing) return navigate.to(`/profiles/${encodeURIComponent(id)}`);
    await selectProfile(id);
    navigate.to('/library');
  };

  return (
    <Stack grow align="center" justify="center" gap="xl" padding="xl" scroll>
      <Text variant="display" align="center">
        {profiles.length ? 'Who’s playing?' : 'Welcome'}
      </Text>
      {!profiles.length && (
        <Text tone="muted" align="center">
          Make a profile for each person who plays. Each one keeps its own settings and favorites.
        </Text>
      )}
      <Stack direction="row" gap="md" wrap justify="center">
        {profiles.map((profile) => (
          <Tile
            key={profile.id}
            label={profile.name}
            onPress={() => void choose(profile.id)}
            overlay={managing && <Icon icon={Pencil} size="lg" />}
          >
            <ProfileAvatar icon={profile.icon} color={profile.color} size="xl" />
          </Tile>
        ))}
        {!managing && (
          <Tile label="Add profile" onPress={() => navigate.to('/profiles/new')}>
            <Avatar icon={Plus} size="xl" />
          </Tile>
        )}
      </Stack>
      {profiles.length > 0 && (
        <Button
          variant={managing ? 'primary' : 'secondary'}
          icon={managing ? undefined : Pencil}
          onClick={() => setManaging(!managing)}
        >
          {managing ? 'Done' : 'Manage profiles'}
        </Button>
      )}
    </Stack>
  );
}
