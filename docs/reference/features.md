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

| Name                | Props / Signature                 | Description                                                                                                                                             |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PlayerView`        | `songId`                          | Loads the song and sampler, then renders the toolbar and stage. Shows loading and error states.                                                         |
| `PlayerToolbar`     | `player`                          | Row 1: back, title, MIDI status and stats, mode, metronome, restart, play/pause. Row 2: seek bar with times, loop button, tempo.                        |
| `MidiStatus`        | —                                 | Connected MIDI device names, or "No MIDI keyboard".                                                                                                     |
| `statsText`         | `(mode, stats) => string \| null` | Stats line for the toolbar (hidden in watch mode).                                                                                                      |
| `usePlayerState`    | `(player) => PlayerState`         |                                                                                                                                                         |
| `SongStage`         | `player`                          | `PixiStage` and `PianoScene`, kept in sync with the theme and the `noteFallTime` setting. Forwards on-screen key taps to `inputHub`.                    |
| `usePlayerSession`  | `(songId) => PlayerSession`       | `loading` / `error` / `ready { player, song }`. Applies the `volume` and `metronome` settings, routes `inputHub` to the player, and sounds touch notes. |
| `useTransportState` | `(transport) => TransportState`   |                                                                                                                                                         |
| `usePosition`       | `(player, fps=15) => number`      | Throttled position for UI text and sliders.                                                                                                             |
| `formatTime`        | `(seconds) => 'm:ss'`             | Negative values show as `0:00`.                                                                                                                         |

## `settings/`

| Name           | Props        | Description                                                                                     |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `SettingsForm` | —            | Every registry setting, grouped by section.                                                     |
| `SettingField` | `settingKey` | Renders the control declared in the registry: slider, toggle, segmented, theme, or MIDI device. |

## `library/`

| Name          | Props / Signature         | Description                   |
| ------------- | ------------------------- | ----------------------------- |
| `SongList`    | `songs`, `onSelect`       | List of songs as `ListItem`s. |
| `useSongList` | `() => SongRef[] \| null` | Songs registered in main.     |
