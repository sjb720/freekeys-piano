import { ArrowLeft, Pause, Play, Repeat, RotateCcw, Timer } from 'lucide-react';
import { PRACTICE_MODE_LABELS, PRACTICE_MODES } from '@shared/settings';
import { MAX_RATE, MIN_RATE, type Player } from '@renderer/engine';
import { useNavigate } from '@renderer/router';
import { setSetting } from '@renderer/state/settingsStore';
import { Button, IconButton, SegmentedControl, Slider, Stack, Text } from '@renderer/ui';
import { formatTime } from './formatTime';
import { usePlayerState, usePosition, useTransportState } from './hooks';
import { MidiStatus } from './MidiStatus';
import { statsText } from './statsText';

const MODE_OPTIONS = PRACTICE_MODES.map((value) => ({ value, label: PRACTICE_MODE_LABELS[value] }));

export function PlayerToolbar({ player }: { player: Player }) {
  const navigate = useNavigate();
  const { playing, rate, duration } = useTransportState(player.transport);
  const { mode, metronome, loop, loopDraftStart, stats } = usePlayerState(player);
  const position = usePosition(player);
  const summary = statsText(mode, stats);

  const loopLabel = loop ? 'Clear loop' : loopDraftStart !== null ? 'Set loop end' : 'Loop';

  return (
    <Stack gap="xs" padding="sm">
      <Stack direction="row" align="center" gap="sm">
        <IconButton icon={ArrowLeft} label="Back" onClick={navigate.back} />
        <Stack grow gap="none">
          <Text variant="heading" truncate>
            {player.song.title}
          </Text>
          <Stack direction="row" gap="md" align="center">
            <MidiStatus />
            {summary && (
              <Text variant="caption" tone="muted" truncate>
                {summary}
              </Text>
            )}
          </Stack>
        </Stack>
        <SegmentedControl
          label="Practice mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={(m) => player.setMode(m)}
        />
        <IconButton
          icon={Timer}
          label={metronome ? 'Metronome on' : 'Metronome off'}
          variant={metronome ? 'primary' : 'ghost'}
          aria-pressed={metronome}
          onClick={() => setSetting('metronome', !metronome)}
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
      <Stack direction="row" align="center" gap="md">
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
        <Button
          icon={Repeat}
          variant={loop || loopDraftStart !== null ? 'primary' : 'secondary'}
          onClick={() => player.cycleLoop()}
        >
          {loopLabel}
        </Button>
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
      </Stack>
    </Stack>
  );
}
