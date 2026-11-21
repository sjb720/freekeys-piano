# IPC — `src/shared/ipc.ts`, `src/preload/`, `src/main/ipc.ts`

Single typed contract shared by main and renderer.

## Adding a channel

1. Add `'domain:action': { args: [...]; result: T }` to `IpcContract`.
2. Add the method to `Api`.
3. Implement it in `src/preload/index.ts` with `invoke`.
4. Register a handler in `src/main/handlers.ts` with `handle`.

## Channels

| Channel       | Args | Result                            | Renderer call               |
| ------------- | ---- | --------------------------------- | --------------------------- |
| `app:getInfo` | —    | `AppInfo { version, platform }`   | `window.api.app.getInfo()`  |
| `songs:list`  | —    | `SongRef[]`                       | `window.api.songs.list()`   |
| `songs:pick`  | —    | `SongRef \| null` (open dialog)   | `window.api.songs.pick()`   |
| `songs:load`  | `id` | `SongFile { ref, bytes } \| null` | `window.api.songs.load(id)` |

`SongRef = { id, title, source: 'bundled' | 'file' }`. Ids are `demo-<name>` or `file-<sha1(path)[:12]>`.

## Helpers

| Name                       | File               | Description                        |
| -------------------------- | ------------------ | ---------------------------------- |
| `handle(channel, handler)` | `main/ipc.ts`      | Type-checked `ipcMain.handle`.     |
| `invoke(channel, ...args)` | `preload/index.ts` | Type-checked `ipcRenderer.invoke`. |
