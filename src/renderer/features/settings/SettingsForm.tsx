import { SETTING_KEYS, SETTING_SECTIONS, SETTINGS } from '@shared/settings';
import { useActiveProfile } from '@renderer/state/profileStore';
import { Stack, Text } from '@renderer/ui';
import { SettingField } from './SettingField';

export function SettingsForm() {
  const profile = useActiveProfile();
  return (
    <Stack gap="xl">
      {profile && (
        <Text tone="muted">
          Settings for {profile.name}. Sections marked “All profiles” are shared on this device.
        </Text>
      )}
      {SETTING_SECTIONS.map((section) => {
        const keys = SETTING_KEYS.filter((k) => SETTINGS[k].section === section);
        if (!keys.length) return null;
        return (
          <Stack key={section} gap="md">
            <Stack direction="row" align="center" gap="sm">
              <Text variant="heading">{section}</Text>
              {keys.every((k) => SETTINGS[k].layer === 'app') && (
                <Text variant="caption" tone="muted">
                  All profiles
                </Text>
              )}
            </Stack>
            {keys.map((key) => (
              <SettingField key={key} settingKey={key} />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
