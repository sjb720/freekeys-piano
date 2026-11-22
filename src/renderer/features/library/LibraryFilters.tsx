import { Search, Star } from 'lucide-react';
import { LEVEL_BAND_KEYS, LEVEL_BANDS, type SongSort } from '@shared/library';
import { HAND_FOCUS_LABELS, HAND_FOCUSES } from '@shared/settings';
import { useSongQueryStore } from '@renderer/state/libraryStore';
import { Button, SegmentedControl, Stack, TextField } from '@renderer/ui';

const BAND_OPTIONS = LEVEL_BAND_KEYS.map((value) => ({ value, label: LEVEL_BANDS[value].label }));
const HAND_OPTIONS = HAND_FOCUSES.map((value) => ({
  value,
  label: value === 'both' ? 'Both hands' : HAND_FOCUS_LABELS[value],
}));
const SORT_OPTIONS: { value: SongSort; label: string }[] = [
  { value: 'easiest', label: 'Easiest' },
  { value: 'hardest', label: 'Hardest' },
  { value: 'title', label: 'A–Z' },
  { value: 'recent', label: 'Newest' },
];

export function LibraryFilters() {
  const query = useSongQueryStore((s) => s.query);
  const set = useSongQueryStore((s) => s.set);

  return (
    <Stack gap="sm">
      <Stack direction="row" align="center" gap="sm" wrap>
        <TextField
          type="search"
          label="Search songs"
          placeholder="Search"
          icon={Search}
          value={query.search}
          onChange={(search) => set({ search })}
        />
        <SegmentedControl
          label="Sort"
          options={SORT_OPTIONS}
          value={query.sort}
          onChange={(sort) => set({ sort })}
        />
        <Button
          icon={Star}
          variant={query.favorites ? 'primary' : 'secondary'}
          aria-pressed={query.favorites}
          onClick={() => set({ favorites: !query.favorites })}
        >
          Favorites
        </Button>
      </Stack>
      <Stack direction="row" align="center" gap="sm" wrap>
        <SegmentedControl
          label="Level"
          options={BAND_OPTIONS}
          value={query.band}
          onChange={(band) => set({ band })}
        />
        <SegmentedControl
          label="Rank by hand"
          options={HAND_OPTIONS}
          value={query.hand}
          onChange={(hand) => set({ hand })}
        />
      </Stack>
    </Stack>
  );
}
