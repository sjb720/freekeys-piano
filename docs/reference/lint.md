# Lint rules — `eslint-rules/`

Local ESLint plugin `piano`, tested in `eslint-rules/rules.test.mjs`.

| Rule                      | Applies to                           | Description                                                                                                                                                                        |
| ------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `piano/no-raw-elements`   | `src/renderer/**/*.tsx` except `ui/` | Bans `a, button, dialog, form, h1–h6, img, input, label, option, p, select, textarea`. Option `{ elements }` overrides the list.                                                   |
| `piano/no-color-literals` | all TS/TSX except `themes/`          | Bans hex strings, color functions (`rgb()`, `oklch()`, …), `0xRRGGBB` numbers, and named colors in color-ish props (`color`, `background`, `fill`, `stroke`, `tint`, `border`, …). |

Stylelint (`.stylelintrc.json`) applies the same color ban to CSS outside `src/renderer/themes/`.
