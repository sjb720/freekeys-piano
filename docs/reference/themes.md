# Themes — `src/renderer/themes/`

The only place color values may appear (lint-enforced in TS, TSX, and CSS).

- Color tokens: `schema.ts` → `COLOR_TOKENS`. Each becomes a CSS variable `--color-<kebab-token>` (e.g. `surfaceRaised` → `--color-surface-raised`).
- Non-color tokens (space, radius, type, touch sizes, motion): `base.css` `:root`.
- Presets: `presets/*.json`; register new ones in `registry.ts`. The preset test fails if a theme is missing or adds tokens.

## Exports (`@renderer/themes`)

| Name                                  | Signature                | Description                                                                     |
| ------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `THEMES`                              | `readonly Theme[]`       | Registered presets.                                                             |
| `DEFAULT_THEME_ID`                    | `string`                 | Fallback theme id.                                                              |
| `getTheme`                            | `(id) => Theme`          | Theme by id, falling back to the default.                                       |
| `applyTheme`                          | `(theme, root?) => void` | Writes color variables, `color-scheme`, and `data-theme` on root.               |
| `useThemeSync`                        | `() => void`             | Applies the theme from `themeStore` whenever it changes. Mounted once in `App`. |
| `colorVarName`                        | `(token) => string`      | `--color-…` variable name.                                                      |
| `colorVar`                            | `(token) => string`      | `var(--color-…)` for inline styles.                                             |
| `COLOR_TOKENS`, `ColorToken`, `Theme` | —                        | Token list and types.                                                           |

## Adding a token

1. Add it to `COLOR_TOKENS`.
2. Add a value to every preset.
3. Use `var(--color-…)` in CSS.
