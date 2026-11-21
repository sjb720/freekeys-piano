import { SETTING_KEYS, SETTING_SECTIONS, SETTINGS } from '@shared/settings';
import { Stack, Text } from '@renderer/ui';
import { SettingField } from './SettingField';

export function SettingsForm() {
  return (
    <Stack gap="xl">
      {SETTING_SECTIONS.map((section) => {
        const keys = SETTING_KEYS.filter((k) => SETTINGS[k].section === section);
        if (!keys.length) return null;
        return (
          <Stack key={section} gap="md">
            <Text variant="heading">{section}</Text>
            {keys.map((key) => (
              <SettingField key={key} settingKey={key} />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
