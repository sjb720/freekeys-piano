export const AVATAR_ICONS = [
  'cat',
  'dog',
  'bird',
  'fish',
  'rabbit',
  'squirrel',
  'turtle',
  'music',
  'star',
  'heart',
  'rocket',
  'crown',
] as const;
export type AvatarIcon = (typeof AVATAR_ICONS)[number];

export const AVATAR_COLORS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export const NAME_MAX = 24;

export type Profile = {
  id: string;
  name: string;
  icon: AvatarIcon;
  color: AvatarColor;
  createdAt: number;
  lastUsedAt: number | null;
};

export type ProfileInput = Pick<Profile, 'name' | 'icon' | 'color'>;

export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ');

export function profileInputError(
  input: ProfileInput,
  taken: readonly string[] = [],
): string | null {
  const name = cleanName(input.name);
  if (!name) return 'Enter a name.';
  if (name.length > NAME_MAX) return `Names can be up to ${NAME_MAX} characters.`;
  if (taken.some((t) => t.toLowerCase() === name.toLowerCase()))
    return 'That name is already used.';
  if (!AVATAR_ICONS.includes(input.icon)) return 'Pick an avatar.';
  if (!AVATAR_COLORS.includes(input.color)) return 'Pick a color.';
  return null;
}

export function suggestAvatar(existing: readonly Profile[]): Pick<Profile, 'icon' | 'color'> {
  const n = existing.length;
  return {
    icon: AVATAR_ICONS[n % AVATAR_ICONS.length]!,
    color: AVATAR_COLORS[n % AVATAR_COLORS.length]!,
  };
}
