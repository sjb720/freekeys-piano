# State — `src/renderer/state/`

Zustand stores.

| Name                | Signature                                    | Description                                                                                                                              |
| ------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `useSettingsStore`  | store `{ values, set(key, value), reset() }` | All setting values. Persisted to `localStorage` (`settings:v1`) until profiles move to SQLite in M5. Unknown keys fall back to defaults. |
| `useSetting`        | `(key) => value`                             | Subscribe to one setting.                                                                                                                |
| `setSetting`        | `(key, value) => void`                       | Update one setting outside React.                                                                                                        |
| `useLibraryStore`   | store `{ songs, status }`                    | Library songs and the latest `ScanStatus`. Refetches songs whenever `status.revision` changes.                                           |
| `startLibrarySync`  | `() => void`                                 | Subscribes to `library:status`. Called once from `App`.                                                                                  |
| `findSong`          | `(id) => SongRef \| undefined`               | Non-React lookup.                                                                                                                        |
| `useSongQueryStore` | store `{ query, set(patch) }`                | Library filters and sort, persisted to `localStorage` (`library-query:v1`) without the search text.                                      |
