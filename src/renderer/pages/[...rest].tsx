import { Home } from 'lucide-react';
import { useNavigate, useParams } from '@renderer/router';
import { Button, Stack, Text } from '@renderer/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { rest } = useParams<{ rest: string }>();
  return (
    <Stack grow align="center" justify="center" gap="lg">
      <Text variant="title">Page not found</Text>
      <Text tone="muted">/{rest}</Text>
      <Button icon={Home} onClick={() => navigate.to('/library', { replace: true })}>
        Home
      </Button>
    </Stack>
  );
}
