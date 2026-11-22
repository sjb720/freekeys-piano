# Features — `src/renderer/features/`

Domain components composed from `ui/`.

## `shell/`

| Name         | Props / Signature                                            | Description                                                                                     |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `AppShell`   | `children`                                                   | Full-height app frame. Used by `pages/_layout.tsx`.                                             |
| `Page`       | `title`, `back=true`, `actions?`, `narrow=false`, `children` | Standard page: header plus scrollable padded body. `narrow` centers the body in a 760px column. |
| `PageHeader` | `title`, `back=true`, `actions?`                             | Back button, title, right-aligned actions.                                                      |
| `useAppInfo` | `() => AppInfo \| null`                                      | App version and platform from main.                                                             |

## `stage/`

| Name        | Props                      | Description                                                                                                              |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `PixiStage` | `onReady(app) => cleanup?` | Hosts a Pixi `Application` that fills its parent. Safe under StrictMode double mounting. `onReady` runs once after init. |

## `player/`

| Name                | Props / Signature                     | Description                                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PlayerView`        | `songId`                              | Loads the song and sampler, then renders the toolbar and stage. Shows loading and error states.                                                                                                                                                                                                                          |
| `PlayerToolbar`     | `player`, `songId`                    | Row 1: back, title, MIDI status and stats, tempo, metronome, restart, play/pause. Row 2 (wraps): hand focus, mode, loop, hands. Row 3: seek bar with times.                                                                                                                                                              |
| `HandsSheet`        | `player`, `songId`, `open`, `onClose` | Hand assignment: Automatic / Split at key (slider with note name) / Swap / By track (only for songs with several note tracks; a Left/Right control per track, labeled by name or instrument with note count and range, starting from `handsByMajority`). Saves through `songs:setHands`, which also re-rates difficulty. |
| `MidiStatus`        | —                                     | Connected MIDI device names, or "No MIDI keyboard".                                                                                                                                                                                                                                                                      |
| `statsText`         | `(mode, stats) => string \| null`     | Stats line for the toolbar (hidden in watch mode).                                                                                                                                                                                                                                                                       |
| `usePlayerState`    | `(player) => PlayerState`             |                                                                                                                                                                                                                                                                                                                          |
| `SongStage`         | `player`                              | `PixiStage` and `PianoScene`, kept in sync with the theme and the `noteFallTime` setting. Forwards on-screen key taps to `inputHub`.                                                                                                                                                                                     |
| `usePlayerSession`  | `(songId) => PlayerSession`           | `loading` / `error` / `ready { player, song, songId }`. Builds the player from settings and the song's saved hand override (`ref.hands`), saves each `PracticeSegment` through `history:record`, applies `volume`, `metronome`, and `otherHand`, routes `inputHub` to the player, and sounds touch notes.                |
| `useTransportState` | `(transport) => TransportState`       |                                                                                                                                                                                                                                                                                                                          |
| `usePosition`       | `(player, fps=15) => number`          | Throttled position for UI text and sliders.                                                                                                                                                                                                                                                                              |
| `formatTime`        | `(seconds) => 'm:ss'`                 | Negative values show as `0:00`.                                                                                                                                                                                                                                                                                          |

## `settings/`

| Name               | Props        | Description                                                                                     |
| ------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| `SettingsSections` | `layer`      | The registry settings for one layer (`profile` or `app`), each section a heading over a `Card`. |
| `SettingField`     | `settingKey` | Renders the control declared in the registry: slider, toggle, segmented, theme, or MIDI device. |

## `library/`

| Name                                                       | Props / Signature                      | Description                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SongList`                                                 | `songs`, `hand`, `onSelect`            | Song rows: duration, source, the top difficulty factor (level 3 and up), a favorite star, and a labeled level badge for `hand`.                                                                  |
| `LibraryFilters`                                           | —                                      | Search plus a sort button (label shows the order and hand) that opens a sheet for order and difficulty-by-hand; level band chips with counts and a Favorites chip. Bound to `useSongQueryStore`. |
| `SongFolders`                                              | —                                      | Card listing library folders with remove, add, and rescan actions, plus scan status.                                                                                                             |
| `OpenSongFile`                                             | —                                      | Card with "Open file…", which picks a MIDI file and opens it in the player.                                                                                                                      |
| `ImportSongs`                                              | —                                      | Card with "Add songs…" (multi-select import) and "Show added files".                                                                                                                             |
| `SongImports`                                              | —                                      | Mounted in the root layout: `useSongDrop` plus `DropOverlay` and `ImportResultSheet`, so files can be dropped on any page.                                                                       |
| `ImportResultSheet`                                        | —                                      | Lists added songs (tap to open) and skipped files with reasons, from `useImportStore`.                                                                                                           |
| `useSongDrop`                                              | `() => boolean`                        | Window-level file drag and drop that imports dropped files; returns whether files are being dragged over the window.                                                                             |
| `useFolders`                                               | `() => { folders, add, remove }`       | Library folders (`null` while loading) with add and remove actions that refresh them.                                                                                                            |
| `ScanStatusText`                                           | —                                      | "Analyzing songs… n of m" while scanning, or the count of unreadable files. Renders nothing when idle and clean.                                                                                 |
| `DifficultyBreakdown`                                      | `song`                                 | Overall level and score, a meter for each hand, and "What makes it hard".                                                                                                                        |
| `LevelBadge`                                               | `level`, `size?`, `labeled?`           | `Badge` toned by band. `labeled` reads "Level n".                                                                                                                                                |
| `useSong`                                                  | `(id) => SongRef \| null \| undefined` | From the library store, falling back to `songs:get`. `undefined` while loading.                                                                                                                  |
| `levelTone` / `levelLabel` / `factorText` / `SOURCE_LABEL` |                                        | Display helpers.                                                                                                                                                                                 |

## `credits/`

| Name         | Props / Signature            | Description                                                                                                                                                  |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Credits`    | —                            | MIT-covers-code note, the piano sample credit, and every bundled song with typesetter and license. Rows open their source page through `app:openCreditLink`. |
| `useCredits` | `() => SongCredit[] \| null` | Bundled song credits from main; `null` while loading.                                                                                                        |

## `profiles/`

| Name                                     | Props / Signature                              | Description                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProfilePicker`                          | —                                              | "Who's playing?" tiles plus Add profile. Picking selects the profile and opens the library. "Manage profiles" turns tiles into edit links.         |
| `ProfileForm`                            | `profile?`                                     | Name, avatar icon, and color. Creates or saves, then returns to the picker. Edit mode has Delete with a confirmation sheet.                        |
| `ProfileSummary`                         | —                                              | Card with the active profile's avatar and name, plus Edit and Switch buttons. Top of the settings page.                                            |
| `ProfileButton`                          | —                                              | The active profile's avatar; tapping it clears the selection and returns to the picker.                                                            |
| `ProfileAvatar`                          | `icon`, `color`, `size?`, `label?`, `onPress?` | `Avatar` for a profile's icon and color.                                                                                                           |
| `useProfileGate`                         | `() => boolean`                                | Used by the root layout. Until profiles load it returns false; with no active profile it redirects every path except `/` and `/profiles/*` to `/`. |
| `AVATAR_ICON_COMPONENTS` / `avatarToken` |                                                | Icon key → lucide icon; color index → `avatar1`–`avatar8` token.                                                                                   |

## `progress/`

| Name                                                 | Props / Signature       | Description                                                                                    |
| ---------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `ProgressOverview`                                   | —                       | Streak, today, and all-time stats; the activity chart; recent sessions linking to their songs. |
| `ActivityChart`                                      | `days`                  | Practice time per day as a `BarChart` (labels on today and the peak), with a table view.       |
| `SongProgress`                                       | `songId`                | Practice time, sessions, completions, and best scores for one song.                            |
| `useHistorySummary` / `useSongHistory`               | `() =>` / `(songId) =>` | Fetched for the active profile; `null` while loading.                                          |
| `sessionText` / `bestText` / `formatDay` / `percent` |                         | Display helpers.                                                                               |
