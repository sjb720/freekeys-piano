import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from '@renderer/router';
import { IconButton, Stack, Text } from '@renderer/ui';

export type PageHeaderProps = {
  title: string;
  back?: boolean;
  actions?: ReactNode;
};

export function PageHeader({ title, back = true, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <Stack direction="row" align="center" gap="sm" padding="md">
      {back && <IconButton icon={ArrowLeft} label="Back" onClick={navigate.back} />}
      <Stack grow>
        <Text variant="title" truncate>
          {title}
        </Text>
      </Stack>
      {actions}
    </Stack>
  );
}
