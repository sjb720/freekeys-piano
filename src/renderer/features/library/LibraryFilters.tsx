import { ArrowUpDown, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { bandCounts, LEVEL_BAND_KEYS, LEVEL_BANDS, type SongSort } from '@shared/library';
import { HAND_FOCUS_LABELS, HAND_FOCUSES } from '@shared/settings';
import { useLibraryStore, useSongQueryStore } from '@renderer/state/libraryStore';
import { Button, Chip, Field, SegmentedControl, Sheet, Stack, TextField } from '@renderer/ui';

const SORT_LABELS: Record<SongSort, string> = {
  easiest: 'Easiest first',
  hardest: 'Hardest first',
  title: 'A–Z',
  recent: 'Newest first',
};
const SORT_OPTIONS: { value: SongSort; label: string }[] = [
  { value: 'easiest', label: 'Easiest' },
  { value: 'hardest', label: 'Hardest' },
  { value: 'title', label: 'A–Z' },
  { value: 'recent', label: 'Newest' },
];
const HAND_OPTIONS = HAND_FOCUSES.map((value) => ({
  value,
  label: value === 'both' ? 'Both hands' : `${HAND_FOCUS_LABELS[value]} hand`,
}));

export function LibraryFilters() {
  const songs = useLibraryStore((s) => s.songs);
  const query = useSongQueryStore((s) => s.query);
  const set = useSongQueryStore((s) => s.set);
  const [sortOpen, setSortOpen] = useState(false);
  const counts = useMemo(() => (songs ? bandCounts(songs, query) : null), [songs, query]);

  const sortText =
    query.hand === 'both'
      ? SORT_LABELS[query.sort]
      : `${SORT_LABELS[query.sort]} · ${HAND_FOCUS_LABELS[query.hand]} hand`;

  return (
    <Stack gap="md">
      <Stack direction="row" align="center" gap="sm">
        <TextField
          type="search"
          label="Search songs"
          placeholder="Search songs"
          icon={Search}
          value={query.search}
          onChange={(search) => set({ search })}
        />
        <Button icon={ArrowUpDown} onClick={() => setSortOpen(true)}>
          {sortText}
        </Button>
      </Stack>
      <Stack direction="row" align="center" gap="sm" wrap>
        {LEVEL_BAND_KEYS.map((band) => (
          <Chip
            key={band}
            label={LEVEL_BANDS[band].label}
            count={counts?.[band]}
            selected={query.band === band}
            onPress={() => set({ band })}
          />
        ))}
        <Chip
          label="Favorites"
          icon={Star}
          selected={query.favorites}
          onPress={() => set({ favorites: !query.favorites })}
        />
      </Stack>
      <Sheet title="Sort songs" open={sortOpen} onClose={() => setSortOpen(false)}>
        <Field label="Order">
          <Stack direction="row">
            <SegmentedControl
              label="Order"
              options={SORT_OPTIONS}
              value={query.sort}
              onChange={(sort) => set({ sort })}
            />
          </Stack>
        </Field>
        <Field
          label="Difficulty for"
          description="Rate and sort songs by how hard they are for one hand, or both together."
        >
          <Stack direction="row">
            <SegmentedControl
              label="Difficulty for"
              options={HAND_OPTIONS}
              value={query.hand}
              onChange={(hand) => set({ hand })}
            />
          </Stack>
        </Field>
        <Button variant="primary" onClick={() => setSortOpen(false)}>
          Done
        </Button>
      </Sheet>
    </Stack>
  );
}
