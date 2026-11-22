# IPC — `src/shared/ipc.ts`, `src/preload/`, `src/main/ipc.ts`

Single typed contract shared by main and renderer.

## Adding a channel

1. Add `'domain:action': { args: [...]; result: T }` to `IpcContract`.
2. Add the method to `Api`.
3. Implement it in `src/preload/index.ts` with `invoke`.
4. Register a handler in `src/main/handlers.ts` with `handle`.

Push events from main: add the payload to `IpcEvents`, send with `broadcast`, subscribe in preload with `on`.

## Channels

| Channel                | Args                         | Result                                                              | Renderer call                    |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| `app:getInfo`          | —                            | `AppInfo { version, platform }`                                     | `api.app.getInfo()`              |
| `songs:list`           | —                            | `SongRef[]` (songs with at least one file)                          | `api.songs.list()`               |
| `songs:get`            | `id`                         | `SongRef \| null`                                                   | `api.songs.get(id)`              |
| `songs:pick`           | —                            | `SongRef \| null`. Opens a file dialog and imports the file.        | `api.songs.pick()`               |
| `songs:load`           | `id`                         | `SongFile { ref, bytes } \| null`                                   | `api.songs.load(id)`             |
| `songs:setFavorite`    | `id`, `favorite`             | —. For the active profile.                                          | `api.songs.setFavorite(id, on)`  |
| `profiles:list`        | —                            | `Profile[]`, oldest first                                           | `api.profiles.list()`            |
| `profiles:active`      | —                            | `Profile \| null`                                                   | `api.profiles.active()`          |
| `profiles:create`      | `ProfileInput`               | `Profile` (throws on invalid input)                                 | `api.profiles.create(input)`     |
| `profiles:update`      | `id`, `ProfileInput`         | `Profile`                                                           | `api.profiles.update(id, input)` |
| `profiles:delete`      | `id`                         | —                                                                   | `api.profiles.delete(id)`        |
| `profiles:select`      | `id \| null`                 | `Profile \| null`. Bumps the library revision so favorites refresh. | `api.profiles.select(id)`        |
| `settings:load`        | —                            | `Partial<SettingValues>`: app settings plus the active profile's    | `api.settings.load()`            |
| `settings:set`         | `key`, `value`               | — (throws if invalid, or a profile setting with no profile)         | `api.settings.set(key, value)`   |
| `history:record`       | `SessionInput`               | — (throws if invalid or no profile)                                 | `api.history.record(input)`      |
| `history:summary`      | `today` (local `YYYY-MM-DD`) | `HistorySummary`                                                    | `api.history.summary(today)`     |
| `history:song`         | `songId`                     | `SongHistory` (empty with no profile)                               | `api.history.song(id)`           |
| `songs:setHands`       | `id`, `HandOverride`         | `SongRef \| null`, re-analyzed with the override                    | `api.songs.setHands(id, hands)`  |
| `library:folders`      | —                            | `string[]`                                                          | `api.library.folders()`          |
| `library:addFolder`    | —                            | `string[]`. Opens a folder dialog, then scans.                      | `api.library.addFolder()`        |
| `library:removeFolder` | `path`                       | `string[]`                                                          | `api.library.removeFolder(path)` |
| `library:rescan`       | —                            | Resolves when the scan finishes.                                    | `api.library.rescan()`           |
| `library:status`       | —                            | `ScanStatus`                                                        | `api.library.status()`           |

| Event            | Payload                                                                                                        | Renderer call                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `library:status` | `ScanStatus { scanning, done, total, failed, revision }`. `revision` increments whenever library data changes. | `api.library.onStatus(fn) => unsubscribe` |

`SongRef = SongSummary & { id, source: 'bundled' | 'library' | 'file', favorite, hands, addedAt }`; `favorite` is for the active profile. `id` is the first 16 hex characters of the SHA-1 of the file's bytes, so identical files share one song.

## Helpers

| Name                                         | File               | Description                                                    |
| -------------------------------------------- | ------------------ | -------------------------------------------------------------- |
| `handle(channel, handler)`                   | `main/ipc.ts`      | Type-checked `ipcMain.handle`.                                 |
| `broadcast(event, payload)`                  | `main/ipc.ts`      | Sends an `IpcEvents` payload to every window.                  |
| `invoke(channel, ...args)` / `on(event, fn)` | `preload/index.ts` | Type-checked `ipcRenderer.invoke` / listener with unsubscribe. |
