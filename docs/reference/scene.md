# Scene (PixiJS) — `src/renderer/scene/`

Imperative Pixi classes driven by the Pixi ticker. React only calls setters. Colors come from `PixiPalette` (`themes/pixiTheme`).

| Name                                                | Signature                                                 | Description                                                                                                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PianoScene`                                        | `new (app, { song, position, palette, fallTime, scrub })` | Lays out the highway and keyboard on resize, renders every frame, lights keys for sounding notes, and handles drag-to-scrub on the highway.                                            |
| `.setPalette(p)` / `.setFallTime(s)` / `.destroy()` |                                                           |                                                                                                                                                                                        |
| `NoteHighway`                                       | `new (noteTexture)`                                       | Pooled rounded note sprites (nine-slice), measure lines, and octave lanes. `layout(keys, area, palette)` on resize; `render(song, position, fallTime, keys, area, palette)` per frame. |
| `PianoKeyboard`                                     | `new (palette)`                                           | One sprite per key. `build(layout, height)`; `setActive(Map<pitch, ColorToken>)` re-tints only changed keys.                                                                           |
| `fitKeyRange`                                       | `(min, max, minKeys=25, margin=2) => { low, high }`       | Visible range snapped to whole octaves (C to B), clamped to 88 keys.                                                                                                                   |
| `layoutKeys`                                        | `(range, width) => KeyLayout`                             | Key rects: whites evenly spaced, blacks centered on boundaries. `keys` is in draw order (whites first); `byPitch` is an index.                                                         |
| `isBlackKey`                                        | `(pitch) => boolean`                                      |                                                                                                                                                                                        |

The highway's y position is `bottom - (time - position) / fallTime * height`.
