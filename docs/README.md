# Docs

- [PLAN.md](PLAN.md): goals, architecture, milestones
- `reference/`: one file per module, listing its exports with one-line descriptions

## Module map

| Module                | Path                             | Reference               |
| --------------------- | -------------------------------- | ----------------------- |
| Main process          | `src/main/`                      | `reference/main.md`     |
| Preload / IPC         | `src/preload/`, `src/shared/ipc` | `reference/ipc.md`      |
| Song model & analysis | `src/shared/`                    | `reference/shared.md`   |
| Settings registry     | `src/shared/settings`            | `reference/settings.md` |
| Router                | `src/renderer/router/`           | `reference/router.md`   |
| UI primitives         | `src/renderer/ui/`               | `reference/ui.md`       |
| Features              | `src/renderer/features/`         | `reference/features.md` |
| Scene (Pixi)          | `src/renderer/scene/`            | `reference/scene.md`    |
| Engine                | `src/renderer/engine/`           | `reference/engine.md`   |
| Input                 | `src/renderer/input/`            | `reference/input.md`    |
| Audio                 | `src/renderer/audio/`            | `reference/audio.md`    |
| Themes                | `src/renderer/themes/`           | `reference/themes.md`   |
| State                 | `src/renderer/state/`            | `reference/state.md`    |
| Lint rules            | `eslint-rules/`                  | `reference/lint.md`     |

Reference files are created alongside their module.

## Tests

- Unit tests live next to their modules (`*.test.ts`).
- `tests/` holds Node-only tests. `tests/fixtures.test.ts` parses every MIDI in `fixtures/local/` (gitignored). Drop real-world files there for local regression checks.
