import { Piano } from 'lucide-react';
import { useMidiDevices } from '@renderer/input';
import { Icon, Stack, Text } from '@renderer/ui';

export function MidiStatus() {
  const devices = useMidiDevices();
  const label = devices.length ? devices.map((d) => d.name).join(', ') : 'No MIDI keyboard';
  return (
    <Stack direction="row" align="center" gap="xs">
      <Icon icon={Piano} size="sm" />
      <Text variant="caption" tone={devices.length ? 'default' : 'muted'} truncate>
        {label}
      </Text>
    </Stack>
  );
}
