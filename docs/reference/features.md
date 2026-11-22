# Features — `src/renderer/features/`

Domain components composed from `ui/`.

## `shell/`

| Name         | Props / Signature                            | Description                                         |
| ------------ | -------------------------------------------- | --------------------------------------------------- |
| `AppShell`   | `children`                                   | Full-height app frame. Used by `pages/_layout.tsx`. |
| `Page`       | `title`, `back=true`, `actions?`, `children` | Standard page: header plus scrollable padded body.  |
| `PageHeader` | `title`, `back=true`, `actions?`             | Back button, title, right-aligned actions.          |
| `useAppInfo` | `() => AppInfo \| null`                      | App version and platform from main.                 |

## `stage/`

| Name        | Props                      | Description                                                                                                              |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `PixiStage` | `onReady(app) => cleanup?` | Hosts a Pixi `Application` that fills its parent. Safe under StrictMode double mounting. `onReady` runs once after init. |

## `player/`

| Name                | Props / Signature                     | Description                                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PlayerView`        | `songId`                              | Loads the song and sampler, then renders the toolbar and stage. Shows loading and error states.                                                                                                                                                    |
| `PlayerToolbar`     | `player`, `songId`                    | Row 1: back, title, MIDI status and stats, tempo, metronome, restart, play/pause. Row 2 (wraps): hand focus, mode, loop, hands. Row 3: seek bar with times.                                                                                        |
| `HandsSheet`        | `player`, `songId`, `open`, `onClose` | Hand assignment: Automatic / Split at key (slider with note name) / Swap. Saves through `songs:setHands`, which also re-rates difficulty.                                                                                                          |
| `MidiStatus`        | —                                     | Connected MIDI device names, or "No MIDI keyboard".                                                                                                                                                                                                |
| `statsText`         | `(mode, stats) => string \| null`     | Stats line for the toolbar (hidden in watch mode).                                                                                                                                                                                                 |
| `usePlayerState`    | `(player) => PlayerState`             |                                                                                                                                                                                                                                                    |
| `SongStage`         | `player`                              | `PixiStage` and `PianoScene`, kept in sync with the theme and the `noteFallTime` setting. Forwards on-screen key taps to `inputHub`.                                                                                                               |
| `usePlayerSession`  | `(songId) => PlayerSession`           | `loading` / `error` / `ready { player, song, songId }`. Builds the player from settings and the song's saved hand override (`ref.hands`), applies `volume`, `metronome`, and `otherHand`, routes `inputHub` to the player, and sounds touch notes. |
| `useTransportState` | `(transport) => TransportState`       |                                                                                                                                                                                                                                                    |
| `usePosition`       | `(player, fps=15) => number`          | Throttled position for UI text and sliders.                                                                                                                                                                                                        |
| `formatTime`        | `(seconds) => 'm:ss'`                 | Negative values show as `0:00`.                                                                                                                                                                                                                    |

## `settings/`

| Name           | Props        | Description                                                                                                                                      |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SettingsForm` | —            | Every registry setting, grouped by section, with the active profile's name. Sections whose settings are all app-level are marked "All profiles". |
| `SettingField` | `settingKey` | Renders the control declared in the registry: slider, toggle, segmented, theme, or MIDI device.                                                  |

## `library/`

| Name                                                       | Props / Signature                      | Description                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `SongList`                                                 | `songs`, `hand`, `onSelect`            | Song rows: duration, source, the top difficulty factor (level 3 and up), a favorite star, and the level badge for `hand`. |
| `LibraryFilters`                                           | —                                      | Search, sort, favorites, level band, and rank-by-hand. Bound to `useSongQueryStore`.                                      |
| `FoldersSheet`                                             | `open`, `onClose`                      | Lists library folders with remove, add, and rescan actions, plus scan status.                                             |
| `ScanStatusText`                                           | —                                      | "Analyzing songs… n of m" while scanning, or the count of unreadable files. Renders nothing when idle and clean.          |
| `DifficultyBreakdown`                                      | `song`                                 | Overall level and score, a meter for each hand, and "What makes it hard".                                                 |
| `LevelBadge`                                               | `level`, `size?`                       | `Badge` toned by band.                                                                                                    |
| `useSong`                                                  | `(id) => SongRef \| null \| undefined` | From the library store, falling back to `songs:get`. `undefined` while loading.                                           |
| `levelTone` / `levelLabel` / `factorText` / `SOURCE_LABEL` |                                        | Display helpers.                                                                                                          |

## `profiles/`

| Name                                     | Props / Signature                              | Description                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProfilePicker`                          | —                                              | "Who's playing?" tiles plus Add profile. Picking selects the profile and opens the library. "Manage profiles" turns tiles into edit links.         |
| `ProfileForm`                            | `profile?`                                     | Name, avatar icon, and color. Creates or saves, then returns to the picker. Edit mode has Delete with a confirmation sheet.                        |
| `ProfileButton`                          | —                                              | The active profile's avatar; tapping it clears the selection and returns to the picker.                                                            |
| `ProfileAvatar`                          | `icon`, `color`, `size?`, `label?`, `onPress?` | `Avatar` for a profile's icon and color.                                                                                                           |
| `useProfileGate`                         | `() => boolean`                                | Used by the root layout. Until profiles load it returns false; with no active profile it redirects every path except `/` and `/profiles/*` to `/`. |
| `AVATAR_ICON_COMPONENTS` / `avatarToken` |                                                | Icon key → lucide icon; color index → `avatar1`–`avatar8` token.                                                                                   |
