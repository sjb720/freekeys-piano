import { useNavigate } from '@renderer/router';
import { selectProfile, useActiveProfile } from '@renderer/state/profileStore';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfileButton() {
  const navigate = useNavigate();
  const profile = useActiveProfile();
  if (!profile) return null;

  const switchProfile = async () => {
    await selectProfile(null);
    navigate.to('/');
  };

  return (
    <ProfileAvatar
      icon={profile.icon}
      color={profile.color}
      size="sm"
      label={`${profile.name} · Switch profile`}
      onPress={() => void switchProfile()}
    />
  );
}
