import { noteName, type HandOverride } from '@shared/song';
import type { Player } from '@renderer/engine';
import { setHandOverride } from '@renderer/state/handOverrideStore';
import { Field, SegmentedControl, Sheet, Slider, Stack, Text } from '@renderer/ui';
import { usePlayerState } from './hooks';

type Kind = HandOverride['kind'];

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'split', label: 'Split at key' },
  { value: 'swap', label: 'Swap hands' },
];

const SOURCE_TEXT = {
  tracks: 'Detected from the file’s hand tracks.',
  heuristic: 'Detected automatically from the notes. Use a split point if it looks wrong.',
};

export type HandsSheetProps = {
  player: Player;
  songId: string;
  open: boolean;
  onClose: () => void;
};

export function HandsSheet({ player, songId, open, onClose }: HandsSheetProps) {
  const { hands } = usePlayerState(player);
  const { min, max } = player.song.pitchRange;

  const apply = (override: HandOverride) => {
    player.setHands(override);
    setHandOverride(songId, override);
  };

  const choose = (kind: Kind) =>
    apply(kind === 'split' ? { kind, pitch: hands.kind === 'split' ? hands.pitch : 60 } : { kind });

  return (
    <Sheet title="Hands" open={open} onClose={onClose}>
      <Text tone="muted">{SOURCE_TEXT[player.song.handSource]}</Text>
      <Stack direction="row">
        <SegmentedControl
          label="Hand assignment"
          options={KIND_OPTIONS}
          value={hands.kind}
          onChange={choose}
        />
      </Stack>
      {hands.kind === 'split' && (
        <Field
          label="Split point"
          description="Notes at or above this key go to the right hand."
          value={noteName(hands.pitch)}
        >
          <Slider
            label="Split point"
            value={hands.pitch}
            min={min}
            max={max + 1}
            onChange={(pitch) => apply({ kind: 'split', pitch })}
          />
        </Field>
      )}
    </Sheet>
  );
}
