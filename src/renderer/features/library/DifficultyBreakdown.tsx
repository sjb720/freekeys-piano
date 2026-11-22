import type { SongRef } from '@shared/ipc';
import { levelFor } from '@shared/analysis';
import { Field, Meter, Stack, Text } from '@renderer/ui';
import { factorText, levelLabel, levelTone } from './difficulty';
import { LevelBadge } from './LevelBadge';

const HANDS = [
  { hand: 'left', label: 'Left hand' },
  { hand: 'right', label: 'Right hand' },
] as const;

export function DifficultyBreakdown({ song }: { song: SongRef }) {
  const { difficulty } = song;
  return (
    <Stack gap="lg">
      <Stack direction="row" align="center" gap="md">
        <LevelBadge level={difficulty.level} size="lg" />
        <Stack gap="none">
          <Text variant="heading">
            Level {difficulty.level} · {levelLabel(difficulty.level)}
          </Text>
          <Text variant="caption" tone="muted">
            Difficulty {difficulty.score} of 100
          </Text>
        </Stack>
      </Stack>
      {HANDS.map(({ hand, label }) => {
        const { score } = difficulty[hand];
        const level = levelFor(score);
        return (
          <Field key={hand} label={label} value={`Level ${level}`}>
            <Meter label={`${label} difficulty`} value={score / 100} tone={levelTone(level)} />
          </Field>
        );
      })}
      {difficulty.factors.length > 0 && (
        <Stack gap="xs">
          <Text variant="heading">What makes it hard</Text>
          {difficulty.factors.map((factor) => (
            <Text key={`${factor.key}-${factor.hand ?? ''}`} tone="muted">
              {factorText(factor)}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
