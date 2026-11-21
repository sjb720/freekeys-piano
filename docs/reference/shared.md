# Shared — `src/shared/`

Pure TypeScript used by main and renderer. No DOM, Node, or Electron imports.

## `song/` (`@shared/song`)

| Name                                                                        | Signature                                      | Description                                                                                                                                   |
| --------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `parseMidi`                                                                 | `(bytes, fallbackTitle) => Song`               | Parses a MIDI file, drops percussion, assigns hands, sorts notes, computes measures and metadata.                                             |
| `handsByTrack`                                                              | `(TrackSummary[]) => Map<track, Hand> \| null` | Hand per track: name match (`right/RH/treble`, `left/LH/bass`), else mean pitch. `null` for single-track files. Replaced by the M3 heuristic. |
| `handBySplit`                                                               | `(pitch) => Hand`                              | Fallback split at `SPLIT_PITCH` (middle C).                                                                                                   |
| `measureStartTicks`                                                         | `(signatures, endTicks, ppq) => number[]`      | Measure start ticks across time-signature changes; defaults to 4/4.                                                                           |
| `lowerBound`                                                                | `(items: Timed[], time) => index`              | First item with `start >= time`.                                                                                                              |
| `measureIndexAt` / `measureBounds`                                          | `(song, time)` / `(song, index)`               | Measure containing a time; a measure's `{ start, end }`, where the last one ends at `duration`.                                               |
| `beatTicks`                                                                 | `(signatures, endTicks, ppq) => TickBeat[]`    | Beat ticks with downbeat flags. Beat length follows the denominator.                                                                          |
| `forEachNoteInWindow`                                                       | `(song, from, to, visit)`                      | Visits notes overlapping `[from, to)`, including long notes that started earlier.                                                             |
| `Song`, `Note`, `Beat`, `Hand`, `Timed`, `TempoEvent`, `TimeSignatureEvent` | types                                          | Times are in seconds; `notes` sorted by start then pitch; `id` is the sorted index; `beats` drive the metronome.                              |

## `settings/` (`@shared/settings`)

| Name                 | Signature                    | Description                                                                                         |
| -------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `SETTINGS`           | registry                     | Every setting: `layer` (`app`/`profile`), `section`, `label`, `description?`, `default`, `control`. |
| `SETTING_SECTIONS`   | `readonly string[]`          | Section order on the settings page.                                                                 |
| `SETTING_KEYS`       | `SettingKey[]`               | All keys.                                                                                           |
| `defaultSettings`    | `() => SettingValues`        | Defaults for every key.                                                                             |
| `formatSettingValue` | `(control, value) => string` | Display text for a value (`80%`, `2.5 s`).                                                          |

Controls: `slider` (`min/max/step/format`), `segmented` (`options`), `toggle`, `theme` (options from the theme registry), `midiDevice` (options from connected devices).

`PRACTICE_MODES` / `PracticeMode` / `PRACTICE_MODE_LABELS`: `watch`, `playAlong`, `wait`.

### Adding a setting

1. Add an entry to `SETTINGS`.
2. Read it with `useSetting(key)`. The settings page picks it up automatically.

## `ipc.ts`

See `ipc.md`.
