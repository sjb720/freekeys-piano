import { Moon, Sun } from 'lucide-react';
import { formatSettingValue, SETTINGS, type SettingDef, type SettingKey } from '@shared/settings';
import { setSetting, useSetting } from '@renderer/state/settingsStore';
import { THEMES } from '@renderer/themes';
import { Field, SegmentedControl, Slider, Stack } from '@renderer/ui';

const themeOptions = THEMES.map((t) => ({
  value: t.id,
  label: t.name,
  icon: t.scheme === 'dark' ? Moon : Sun,
}));

export function SettingField({ settingKey }: { settingKey: SettingKey }) {
  const def: SettingDef = SETTINGS[settingKey];
  const value = useSetting(settingKey);
  const set = (v: unknown) => setSetting(settingKey, v as never);
  const { control, description } = def;

  switch (control.type) {
    case 'slider':
      return (
        <Field
          label={def.label}
          description={description}
          value={formatSettingValue(control, value)}
        >
          <Slider
            label={def.label}
            value={value as number}
            min={control.min}
            max={control.max}
            step={control.step}
            onChange={set}
          />
        </Field>
      );
    case 'segmented':
    case 'theme':
      return (
        <Field label={def.label} description={description}>
          <Stack direction="row">
            <SegmentedControl
              label={def.label}
              options={control.type === 'theme' ? themeOptions : control.options}
              value={value as string}
              onChange={set}
            />
          </Stack>
        </Field>
      );
  }
}
