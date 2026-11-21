# Main process — `src/main/`

| Name                                             | File          | Description                                                                                                                                                             |
| ------------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createMainWindow()`                             | `window.ts`   | Sandboxed, context-isolated window with autoplay allowed. Blocks in-app navigation; https links open externally. Loads the dev server URL or `app://bundle/index.html`. |
| `registerSchemePrivileges()`                     | `protocol.ts` | Registers `app://` as standard/secure/fetch-capable. Must run before `ready`.                                                                                           |
| `serveDirectory(root)`                           | `protocol.ts` | Serves files from `root` over `app://`, rejecting path traversal.                                                                                                       |
| `resourcesDir()` / `rendererDir()`               | `paths.ts`    | Bundled resources (`resources/` in dev, `process.resourcesPath` when packaged) and the built renderer.                                                                  |
| `registerBundledSongs()`                         | `songs.ts`    | Registers `resources/songs/*.mid` as `demo-<name>`.                                                                                                                     |
| `listSongs()` / `pickSong(win)` / `loadSong(id)` | `songs.ts`    | In-memory song registry. Picked files are registered by path hash for the session. Replaced by the SQLite library in M4.                                                |
| `registerHandlers()`                             | `handlers.ts` | Registers all IPC handlers.                                                                                                                                             |

`scripts/generate-demos.mts` (`pnpm demos`) builds the demo MIDIs from note lists.
