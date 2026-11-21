# Shared — `src/shared/`

Pure TypeScript used by main and renderer. No DOM, Node, or Electron imports.

## `song/` (`@shared/song`)

| Name                                                       | Signature                                      | Description                                                                                                                                   |
| ---------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `parseMidi`                                                | `(bytes, fallbackTitle) => Song`               | Parses a MIDI file, drops percussion, assigns hands, sorts notes, computes measures and metadata.                                             |
| `handsByTrack`                                             | `(TrackSummary[]) => Map<track, Hand> \| null` | Hand per track: name match (`right/RH/treble`, `left/LH/bass`), else mean pitch. `null` for single-track files. Replaced by the M3 heuristic. |
| `handBySplit`                                              | `(pitch) => Hand`                              | Fallback split at `SPLIT_PITCH` (middle C).                                                                                                   |
| `measureStartTicks`                                        | `(signatures, endTicks, ppq) => number[]`      | Measure start ticks across time-signature changes; defaults to 4/4.                                                                           |
| `lowerBound`                                               | `(notes, time) => index`                       | First note with `start >= time`.                                                                                                              |
| `forEachNoteInWindow`                                      | `(song, from, to, visit)`                      | Visits notes overlapping `[from, to)`, including long notes that started earlier.                                                             |
| `Song`, `Note`, `Hand`, `TempoEvent`, `TimeSignatureEvent` | types                                          | Times are in seconds; `notes` sorted by start then pitch; `id` is the sorted index.                                                           |

## `settings/` (`@shared/settings`)

| Name                 | Signature                    | Description                                                                                         |
| -------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `SETTINGS`           | registry                     | Every setting: `layer` (`app`/`profile`), `section`, `label`, `description?`, `default`, `control`. |
| `SETTING_SECTIONS`   | `readonly string[]`          | Section order on the settings page.                                                                 |
| `SETTING_KEYS`       | `SettingKey[]`               | All keys.                                                                                           |
| `defaultSettings`    | `() => SettingValues`        | Defaults for every key.                                                                             |
| `formatSettingValue` | `(control, value) => string` | Display text for a value (`80%`, `2.5 s`).                                                          |

Controls: `slider` (`min/max/step/format`), `segmented` (`options`), `theme` (options come from the theme registry).

### Adding a setting

1. Add an entry to `SETTINGS`.
2. Read it with `useSetting(key)`. The settings page picks it up automatically.

## `ipc.ts`

See `ipc.md`.
