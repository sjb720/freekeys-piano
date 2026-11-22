import { Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AVATAR_COLORS,
  AVATAR_ICONS,
  NAME_MAX,
  profileInputError,
  suggestAvatar,
  type Profile,
  type ProfileInput,
} from '@shared/profiles';
import { useNavigate } from '@renderer/router';
import {
  createProfile,
  deleteProfile,
  updateProfile,
  useProfileStore,
} from '@renderer/state/profileStore';
import { Button, ChoiceGrid, Field, Sheet, Stack, Text, TextField } from '@renderer/ui';
import { ProfileAvatar } from './ProfileAvatar';

export function ProfileForm({ profile }: { profile?: Profile }) {
  const navigate = useNavigate();
  const profiles = useProfileStore((s) => s.profiles);
  const [input, setInput] = useState<ProfileInput>(
    () => profile ?? { name: '', ...suggestAvatar(profiles) },
  );
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const set = (patch: Partial<ProfileInput>) => {
    setInput((current) => ({ ...current, ...patch }));
    setError(null);
  };

  const save = async () => {
    const taken = profiles.filter((p) => p.id !== profile?.id).map((p) => p.name);
    const problem = profileInputError(input, taken);
    if (problem) return setError(problem);
    try {
      if (profile) await updateProfile(profile.id, input);
      else await createProfile(input);
      navigate.to('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const remove = async () => {
    if (!profile) return;
    await deleteProfile(profile.id);
    navigate.to('/');
  };

  const iconOptions = AVATAR_ICONS.map((icon) => ({
    value: icon,
    label: icon,
    content: <ProfileAvatar icon={icon} color={input.color} size="md" />,
  }));
  const colorOptions = AVATAR_COLORS.map((color) => ({
    value: color,
    label: `Color ${color}`,
    content: <ProfileAvatar icon={input.icon} color={color} size="md" />,
  }));

  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" gap="lg">
        <ProfileAvatar icon={input.icon} color={input.color} size="lg" />
        <TextField
          label="Name"
          placeholder="Name"
          value={input.name}
          onChange={(name) => set({ name: name.slice(0, NAME_MAX) })}
        />
      </Stack>
      <Field label="Avatar">
        <ChoiceGrid
          label="Avatar"
          options={iconOptions}
          value={input.icon}
          onChange={(icon) => set({ icon })}
        />
      </Field>
      <Field label="Color">
        <ChoiceGrid
          label="Color"
          options={colorOptions}
          value={input.color}
          onChange={(color) => set({ color })}
        />
      </Field>
      {error && <Text tone="danger">{error}</Text>}
      <Stack direction="row" gap="sm" wrap>
        <Button variant="primary" size="lg" icon={Check} onClick={() => void save()}>
          {profile ? 'Save' : 'Create profile'}
        </Button>
        {profile && (
          <Button variant="ghost" size="lg" icon={Trash2} onClick={() => setConfirming(true)}>
            Delete profile
          </Button>
        )}
      </Stack>
      {profile && (
        <Sheet
          title={`Delete ${profile.name}?`}
          open={confirming}
          onClose={() => setConfirming(false)}
        >
          <Text tone="muted">
            Their settings and favorites will be removed. Songs stay in the library.
          </Text>
          <Stack direction="row" gap="sm">
            <Button variant="danger" icon={Trash2} onClick={() => void remove()}>
              Delete
            </Button>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
          </Stack>
        </Sheet>
      )}
    </Stack>
  );
}
