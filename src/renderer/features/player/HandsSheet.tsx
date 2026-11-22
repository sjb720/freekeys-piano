import {
  handsByMajority,
  noteName,
  type Hand,
  type HandOverride,
  type SongTrack,
} from '@shared/song';
import type { Player } from '@renderer/engine';
import { Field, SegmentedControl, Sheet, Slider, Stack, Text } from '@renderer/ui';
import { usePlayerState } from './hooks';

type Kind = HandOverride['kind'];

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'split', label: 'Split at key' },
  { value: 'swap', label: 'Swap hands' },
  { value: 'tracks', label: 'By track' },
];

const HAND_OPTIONS: { value: Hand; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const SOURCE_TEXT = {
  tracks: 'Detected from the file’s hand tracks.',
  heuristic:
    'Detected automatically from the notes. Use a split point or assign tracks if it looks wrong.',
};

const capitalize = (text: string) => text.replace(/^\w/, (c) => c.toUpperCase());

function trackLabel(track: SongTrack, position: number) {
  const title = track.name || capitalize(track.instrument) || `Track ${position + 1}`;
  const detail = [
    track.name ? capitalize(track.instrument) : '',
    `${track.noteCount} notes`,
    `${noteName(track.minPitch)}–${noteName(track.maxPitch)}`,
  ];
  return { title, detail: detail.filter(Boolean).join(' · ') };
}

export type HandsSheetProps = {
  player: Player;
  songId: string;
  open: boolean;
  onClose: () => void;
};

export function HandsSheet({ player, songId, open, onClose }: HandsSheetProps) {
  const { hands } = usePlayerState(player);
  const { song } = player;
  const { min, max } = song.pitchRange;
  const kinds =
    song.tracks.length > 1 ? KIND_OPTIONS : KIND_OPTIONS.filter((k) => k.value !== 'tracks');

  const apply = (override: HandOverride) => {
    player.setHands(override);
    void window.api.songs.setHands(songId, override);
  };

  const choose = (kind: Kind) => {
    if (kind === 'split') apply({ kind, pitch: hands.kind === 'split' ? hands.pitch : 60 });
    else if (kind === 'tracks') apply({ kind, hands: handsByMajority(song.notes) });
    else apply({ kind });
  };

  return (
    <Sheet title="Hands" open={open} onClose={onClose}>
      <Text tone="muted">{SOURCE_TEXT[song.handSource]}</Text>
      <Stack direction="row" wrap>
        <SegmentedControl
          label="Hand assignment"
          options={kinds}
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
      {hands.kind === 'tracks' && (
        <Stack gap="md">
          {song.tracks.map((track, i) => {
            const { title, detail } = trackLabel(track, i);
            return (
              <Field
                key={track.index}
                label={title}
                description={detail}
                trailing={
                  <SegmentedControl
                    label={`${title} hand`}
                    options={HAND_OPTIONS}
                    value={hands.hands[track.index] ?? 'right'}
                    onChange={(hand) =>
                      apply({ kind: 'tracks', hands: { ...hands.hands, [track.index]: hand } })
                    }
                  />
                }
              />
            );
          })}
        </Stack>
      )}
    </Sheet>
  );
}
