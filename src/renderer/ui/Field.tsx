import type { ReactNode } from 'react';
import { Stack } from './Stack';
import { Text } from './Text';

export type FieldProps = {
  label: string;
  description?: string;
  value?: string;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function Field({ label, description, value, trailing, children }: FieldProps) {
  return (
    <Stack gap="xs">
      <Stack direction="row" justify="between" align="center" gap="md">
        <Text>{label}</Text>
        {trailing ?? (value !== undefined && <Text tone="muted">{value}</Text>)}
      </Stack>
      {description && (
        <Text variant="caption" tone="muted">
          {description}
        </Text>
      )}
      {children}
    </Stack>
  );
}
