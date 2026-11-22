import { SETTING_SECTIONS, SETTINGS, settingKeysFor, type SettingLayer } from '@shared/settings';
import { Card, Stack, Text } from '@renderer/ui';
import { SettingField } from './SettingField';

export function SettingsSections({ layer }: { layer: SettingLayer }) {
  const keys = settingKeysFor(layer);
  return (
    <>
      {SETTING_SECTIONS.map((section) => {
        const inSection = keys.filter((k) => SETTINGS[k].section === section);
        if (!inSection.length) return null;
        return (
          <Stack key={section} gap="sm">
            <Text variant="heading">{section}</Text>
            <Card>
              {inSection.map((key) => (
                <SettingField key={key} settingKey={key} />
              ))}
            </Card>
          </Stack>
        );
      })}
    </>
  );
}
