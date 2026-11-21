import { Library, Settings } from 'lucide-react';
import { useAppInfo } from '@renderer/features/shell';
import { useNavigate } from '@renderer/router';
import { Button, Stack, Text } from '@renderer/ui';

export default function HomePage() {
  const navigate = useNavigate();
  const info = useAppInfo();

  return (
    <Stack grow align="center" justify="center" gap="xl" padding="xl">
      <Stack align="center" gap="sm">
        <Text variant="display" align="center">
          Piano Teacher
        </Text>
        {info && (
          <Text variant="caption" tone="muted">
            v{info.version} · {info.platform}
          </Text>
        )}
      </Stack>
      <Stack direction="row" gap="md" wrap justify="center">
        <Button variant="primary" size="lg" icon={Library} onClick={() => navigate.to('/library')}>
          Library
        </Button>
        <Button size="lg" icon={Settings} onClick={() => navigate.to('/settings')}>
          Settings
        </Button>
      </Stack>
    </Stack>
  );
}
