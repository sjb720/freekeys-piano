# CLAUDE.md

FreeKeys: an open-source Electron piano teacher. Read `docs/PLAN.md` for architecture and milestones, and `docs/README.md` for the module map.

## Rules

### Components

- Raw interactive/structural elements (`<button>`, `<input>`, `<select>`, etc.) appear only in `src/renderer/ui/`. Everywhere else, use or create a `ui/` component. Lint enforces this.
- Domain components live in `src/renderer/features/` and are composed from `ui/`.
- Pixi display objects are components too: reusable classes in `src/renderer/scene/`.
- Before writing UI, check `docs/reference/ui.md` for an existing component.

### Comments and docs

- Code comments are brief, one line, and only for non-obvious intent. No doc blocks, banners, timestamps, or change notes.
- Document exports in `docs/reference/<module>.md`: a table of name, signature, and a one-line description. Update it in the same change as the code.

### Theming

- No color literals (hex, `rgb()`, `hsl()`, named colors, `0x` colors) outside `src/renderer/themes/`.
- DOM styles use theme CSS variables. Pixi uses `pixiTheme` tokens.
- Add a token to the theme schema rather than inlining a value.

### Routing

- Pages live in `src/renderer/pages/` and are discovered by the glob router.
- `[param].tsx` creates a dynamic segment, `_layout.tsx` a layout, `[...rest].tsx` a catch-all.
- Navigate through the router API, never `window.location`.

### Settings

- Declare every setting in the `shared/settings` registry. Never build a settings control by hand.

### General

- No AI/ML features or dependencies. All algorithms are deterministic.
- `src/shared/` stays pure: no DOM, no Node, no Electron imports.
- No network access at runtime. Assets are bundled.
- TypeScript `strict`; avoid `any`.

## Commands

| Command                                   | Does                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                                | Run the app with hot reload                                 |
| `pnpm build`                              | Typecheck and build to `out/`                               |
| `pnpm lint`                               | ESLint + Stylelint (includes the component and color rules) |
| `pnpm typecheck`                          | `tsc` for node and web projects                             |
| `pnpm test`                               | Vitest (unit tests + lint rule tests)                       |
| `pnpm package:linux` / `pnpm package:win` | Installers in `release/`                                    |
| `pnpm release`                            | Pick a version, bump, tag, and push to publish a release    |

On WSL, Electron needs `--no-sandbox` (e.g. `pnpm dev -- --no-sandbox`).
