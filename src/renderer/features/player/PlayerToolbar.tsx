import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import type { Player } from '@renderer/engine';
import { MAX_RATE, MIN_RATE } from '@renderer/engine';
import { useNavigate } from '@renderer/router';
import { IconButton, Slider, Stack, Text } from '@renderer/ui';
import { formatTime } from './formatTime';
import { usePosition, useTransportState } from './hooks';

export function PlayerToolbar({ player }: { player: Player }) {
  const navigate = useNavigate();
  const { playing, rate, duration } = useTransportState(player.transport);
  const position = usePosition(player);

  return (
    <Stack gap="none" padding="sm">
      <Stack direction="row" align="center" gap="sm">
        <IconButton icon={ArrowLeft} label="Back" onClick={navigate.back} />
        <Stack grow>
          <Text variant="heading" truncate>
            {player.song.title}
          </Text>
        </Stack>
        <Text tone="muted">Tempo {Math.round(rate * 100)}%</Text>
        <Slider
          label="Tempo"
          size="sm"
          value={rate}
          min={MIN_RATE}
          max={MAX_RATE}
          step={0.05}
          onChange={(v) => player.transport.setRate(v)}
        />
        <IconButton icon={RotateCcw} label="Restart" onClick={() => player.restart()} />
        <IconButton
          icon={playing ? Pause : Play}
          label={playing ? 'Pause' : 'Play'}
          variant="primary"
          size="lg"
          onClick={() => player.transport.toggle()}
        />
      </Stack>
      <Stack direction="row" align="center" gap="md" padding="xs">
        <Text variant="caption" tone="muted">
          {formatTime(position)}
        </Text>
        <Stack grow>
          <Slider
            label="Position"
            value={Math.max(position, 0)}
            min={0}
            max={duration}
            step={0.1}
            onChange={(v) => player.scrubTo(v)}
          />
        </Stack>
        <Text variant="caption" tone="muted">
          {formatTime(duration)}
        </Text>
      </Stack>
    </Stack>
  );
}
