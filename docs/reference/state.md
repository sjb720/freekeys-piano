# State — `src/renderer/state/`

Zustand stores.

| Name                                                | Signature                           | Description                                                                                                                        |
| --------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `useSetting`                                        | `(key) => value`                    | Subscribe to one setting.                                                                                                          |
| `useLibraryStore`                                   | store `{ songs, status }`           | Library songs and the latest `ScanStatus`. Refetches songs whenever `status.revision` changes.                                     |
| `startLibrarySync`                                  | `() => void`                        | Subscribes to `library:status`. Called once from `App`.                                                                            |
| `findSong`                                          | `(id) => SongRef \| undefined`      | Non-React lookup.                                                                                                                  |
| `useSongQueryStore`                                 | store `{ query, set(patch) }`       | Library filters and sort, persisted to `localStorage` (`library-query:v1`) without the search text.                                |
| `useSettingsStore`                                  | store `{ values }`                  | Effective setting values: defaults, then app settings, then the active profile's. Loaded from main; not persisted in the renderer. |
| `loadSettings`                                      | `() => Promise<void>`               | Reloads values from `settings:load`.                                                                                               |
| `setSetting`                                        | `(key, value) => void`              | Updates the store immediately and saves through `settings:set`; reloads from main if the save fails.                               |
| `useProfileStore`                                   | store `{ ready, profiles, active }` | `ready` turns true after the first load.                                                                                           |
| `initProfiles`                                      | `() => Promise<void>`               | Loads profiles, the active profile, and settings. Called once from `App`.                                                          |
| `selectProfile`                                     | `(id \| null) => Promise<void>`     | Selects (or clears) the profile in main, then reloads settings.                                                                    |
| `createProfile` / `updateProfile` / `deleteProfile` |                                     | Write through IPC, then refresh the list.                                                                                          |
| `useActiveProfile`                                  | `() => Profile \| null`             |                                                                                                                                    |
