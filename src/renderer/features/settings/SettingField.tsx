import { Moon, Sun } from 'lucide-react';
import { formatSettingValue, SETTINGS, type SettingDef, type SettingKey } from '@shared/settings';
import { ALL_DEVICES, useMidiDevices } from '@renderer/input';
import { setSetting, useSetting } from '@renderer/state/settingsStore';
import { THEMES } from '@renderer/themes';
import { Field, SegmentedControl, Slider, Stack, Text, Toggle } from '@renderer/ui';

const themeOptions = THEMES.map((t) => ({
  value: t.id,
  label: t.name,
  icon: t.scheme === 'dark' ? Moon : Sun,
}));

function MidiDeviceControl({ label, value, onChange }: ChoiceProps) {
  const devices = useMidiDevices();
  const options = [
    { value: ALL_DEVICES, label: 'All devices' },
    ...devices.map((d) => ({ value: d.id, label: d.name })),
  ];
  return (
    <Stack gap="xs">
      <Stack direction="row">
        <SegmentedControl label={label} options={options} value={value} onChange={onChange} />
      </Stack>
      {devices.length === 0 && (
        <Text variant="caption" tone="muted">
          No MIDI devices connected.
        </Text>
      )}
    </Stack>
  );
}

type ChoiceProps = { label: string; value: string; onChange: (value: string) => void };

export function SettingField({ settingKey }: { settingKey: SettingKey }) {
  const def: SettingDef = SETTINGS[settingKey];
  const value = useSetting(settingKey);
  const set = (v: unknown) => setSetting(settingKey, v as never);
  const { control, description, label } = def;

  switch (control.type) {
    case 'slider':
      return (
        <Field label={label} description={description} value={formatSettingValue(control, value)}>
          <Slider
            label={label}
            value={value as number}
            min={control.min}
            max={control.max}
            step={control.step}
            onChange={set}
          />
        </Field>
      );
    case 'toggle':
      return (
        <Field
          label={label}
          description={description}
          trailing={<Toggle label={label} checked={value as boolean} onChange={set} />}
        />
      );
    case 'midiDevice':
      return (
        <Field label={label} description={description}>
          <MidiDeviceControl label={label} value={value as string} onChange={set} />
        </Field>
      );
    case 'segmented':
    case 'theme':
      return (
        <Field label={label} description={description}>
          <Stack direction="row">
            <SegmentedControl
              label={label}
              options={control.type === 'theme' ? themeOptions : control.options}
              value={value as string}
              onChange={set}
            />
          </Stack>
        </Field>
      );
  }
}
