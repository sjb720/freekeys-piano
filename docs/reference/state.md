# State — `src/renderer/state/`

Zustand stores.

| Name                                  | Signature                                    | Description                                                                                                                              |
| ------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `useSettingsStore`                    | store `{ values, set(key, value), reset() }` | All setting values. Persisted to `localStorage` (`settings:v1`) until profiles move to SQLite in M5. Unknown keys fall back to defaults. |
| `useSetting`                          | `(key) => value`                             | Subscribe to one setting.                                                                                                                |
| `setSetting`                          | `(key, value) => void`                       | Update one setting outside React.                                                                                                        |
| `useHandOverrideStore`                | store `{ bySong, set(songId, override) }`    | Per-song hand overrides, persisted to `localStorage` (`hand-overrides:v1`). `auto` removes the entry. Moves to SQLite in M4.             |
| `getHandOverride` / `setHandOverride` | `(songId)` / `(songId, override)`            | Non-React access.                                                                                                                        |
