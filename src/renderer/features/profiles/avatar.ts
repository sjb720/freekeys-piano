import {
  Bird,
  Cat,
  Crown,
  Dog,
  Fish,
  Heart,
  Music,
  Rabbit,
  Rocket,
  Squirrel,
  Star,
  Turtle,
  type LucideIcon,
} from 'lucide-react';
import type { AvatarColor, AvatarIcon } from '@shared/profiles';
import type { ColorToken } from '@renderer/themes';

export const AVATAR_ICON_COMPONENTS: Record<AvatarIcon, LucideIcon> = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  squirrel: Squirrel,
  turtle: Turtle,
  music: Music,
  star: Star,
  heart: Heart,
  rocket: Rocket,
  crown: Crown,
};

export const avatarToken = (color: AvatarColor): ColorToken => `avatar${color}`;
