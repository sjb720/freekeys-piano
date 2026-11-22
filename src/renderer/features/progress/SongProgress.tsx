import { formatDuration } from '@shared/history';
import { Field, Stack, Text } from '@renderer/ui';
import { bestText, percent } from './format';
import { useSongHistory } from './useHistory';

export function SongProgress({ songId }: { songId: string }) {
  const history = useSongHistory(songId);
  if (!history) return null;

  return (
    <Stack gap="md">
      <Text variant="heading">Your progress</Text>
      {history.sessions === 0 ? (
        <Text tone="muted">You haven’t practiced this song yet.</Text>
      ) : (
        <>
          <Field
            label="Practiced"
            value={`${formatDuration(history.playTime)} · ${history.sessions} session${history.sessions === 1 ? '' : 's'}`}
          />
          <Field
            label="Played to the end"
            value={`${history.completions} time${history.completions === 1 ? '' : 's'}`}
          />
          {history.best.map((b) => (
            <Field
              key={`${b.mode}-${b.focus}`}
              label={`Best · ${bestText(b)}`}
              value={
                b.tempo < 0.995
                  ? `${percent(b.accuracy)} at ${percent(b.tempo)} tempo`
                  : percent(b.accuracy)
              }
            />
          ))}
        </>
      )}
    </Stack>
  );
}
