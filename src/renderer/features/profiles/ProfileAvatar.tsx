import type { Profile } from '@shared/profiles';
import { Avatar, type AvatarProps } from '@renderer/ui';
import { AVATAR_ICON_COMPONENTS, avatarToken } from './avatar';

export type ProfileAvatarProps = Pick<Profile, 'icon' | 'color'> &
  Pick<AvatarProps, 'size' | 'label' | 'onPress'>;

export function ProfileAvatar({ icon, color, ...rest }: ProfileAvatarProps) {
  return <Avatar icon={AVATAR_ICON_COMPONENTS[icon]} color={avatarToken(color)} {...rest} />;
}
