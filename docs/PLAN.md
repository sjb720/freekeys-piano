# FreeKeys — Plan

Open-source, offline piano practice app. Falling notes onto a piano, driven by a plugged-in MIDI keyboard (or a mic), running on a touch monitor sitting on the keyboard's music stand.

Reference product: [Artie](https://apps.apple.com/us/app/artie-learn-piano-with-ai/id6746756746). We match its practice tools and fix its weak spots: unreliable mic detection, coarse difficulty levels, small fixed library.

## Goals

- Import any MIDI library; rank songs by difficulty, per hand.
- Separate left and right hands; practice either hand alone or both.
- Wait mode: playback stops until the correct notes are played.
- MIDI keyboard input first-class; mic input with chord support.
- Touch-first UI with large, simple controls.
- Unlimited profiles, picked at launch (Netflix-style), each with its own settings and progress.
- Fully themeable: no hard-coded colors anywhere.
- Linux and Windows builds.

## Non-goals

- No AI/ML anywhere. Every algorithm is deterministic and explainable.
- No accounts, cloud, or network dependency at runtime.
- No sheet music in v1 (stretch goal).

## Stack

| Concern         | Choice                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------- |
| Shell           | Electron, built with `electron-vite`, packaged with `electron-builder` (AppImage/deb, NSIS) |
| Language        | TypeScript, `strict`                                                                        |
| UI              | React + CSS Modules, styled exclusively via theme CSS variables                             |
| Canvas          | PixiJS v8, imperative scene mounted by a React host                                         |
| State           | Zustand                                                                                     |
| MIDI files      | `@tonejs/midi`                                                                              |
| MIDI devices    | Web MIDI API                                                                                |
| Audio out       | In-house Web Audio sampler with bundled Salamander Grand samples (CC-BY)                    |
| Mic             | Web Audio + `AudioWorklet`, custom DSP                                                      |
| Storage         | SQLite via built-in `node:sqlite` in the main process (no native module to rebuild)         |
| Tests           | Vitest (unit), Playwright for Electron (e2e)                                                |
| Package manager | pnpm                                                                                        |
| License         | MIT                                                                                         |

## Source layout

```
src/
  main/            Electron main: window, db, library scan, IPC handlers
  preload/         Typed bridge exposing window.api
  shared/          Pure TS, no DOM/Node: song model, analysis, IPC contracts, settings schema
  renderer/
    pages/         Glob-routed pages
    router/        In-house glob router
    ui/            Primitive components (the only place raw elements are used)
    features/      Domain components composed from ui/
    scene/         PixiJS display objects and scene
    engine/        Transport clock, practice modes, grading
    input/         MIDI and mic input sources
    audio/         Sampler, metronome, MIDI out
    themes/        Theme definitions and token bridge (CSS + Pixi)
    state/         Zustand stores
docs/
  PLAN.md
  README.md        Docs index and module map
  reference/       One file per module: exports, signatures, one-line descriptions
```

`shared/` is imported by both main and renderer. Analysis (hand separation, difficulty) lives there so it can run in the main process during library scans and be unit tested without Electron.

## Architecture

### Process model

- **Main**: owns the filesystem and SQLite. Scans library folders, parses and analyzes new MIDIs in a utility process, caches results.
- **Preload**: exposes a typed `window.api` generated from the IPC contract in `shared/ipc`. `contextIsolation` on, `nodeIntegration` off.
- **Renderer**: UI, Pixi scene, engine, input, audio.

### Song model

```ts
type Hand = 'left' | 'right';
type Note = {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
  hand: Hand;
  measure: number;
};
type Song = {
  id: string;
  title: string;
  notes: Note[];
  tempoMap: TempoEvent[];
  timeSignatures: TimeSigEvent[];
  measures: number[];
  duration: number;
};
```

Times are in seconds after the tempo map is applied. Notes are sorted by start time. Per-song hand overrides are stored separately and applied on load.

### Hand separation

1. **Track/channel based**: if the file has two or more tracks with notes, use track names (`right`, `left`, `RH`, `LH`, `treble`, `bass`) when present, otherwise assign by mean pitch.
2. **Heuristic** for single-track files: walk notes in time order, tracking each hand's position. Assign each note (or split each chord) to minimize a cost made of distance from the hand's position, span limits (about a 9th per hand), a hand-crossing penalty, and at most 5 notes per hand at once.
3. **Manual override**: the user can change the split per song; overrides persist.

### Difficulty

Features are extracted per hand:

- notes per second (mean and peak over a sliding window)
- chord density and maximum polyphony
- hand span and leap size/frequency
- pitch range and black-key ratio
- rhythmic irregularity (onset spacing variance, syncopation)
- tempo
- hand independence (rhythmic divergence between hands)

Each feature is normalized, then combined as a weighted sum into a score from 0 to 100 per hand, plus an overall score. Scores map to levels 1–10. The UI shows the top contributing factors, e.g. "fast right hand, wide left-hand leaps". Weights are tuned by hand against a reference set of songs we rank ourselves.

### Engine

- **Transport**: a clock based on `performance.now`, with play/pause/seek, a playback rate (tempo %), and a loop region.
- **Practice modes**:
  - _Watch_: playback only.
  - _Play-along_: the song runs in real time; each note is graded against timing windows.
  - _Wait_: notes are grouped into steps (onsets within about 30 ms of each other). The transport stops at each step until every expected pitch for the active hands is down. Wrong notes are flagged but do not advance.
- **Hand focus**: set active hands to left, right, or both. Each inactive hand is played by the app, muted, or sent to MIDI out, per profile setting.
- **Session stats**: hits, misses, wrong notes, and timing error, per measure and per hand. These are recorded for progress tracking and future adaptive practice.

### Input

Every source implements one interface emitting `noteOn(pitch, time)` / `noteOff(pitch, time)`, so the engine does not know which source is active.

- **MIDI**: Web MIDI with hot-plug detection and device choice in settings.
- **Mic**:
  - _Score-informed detection (wait mode and play-along)_: semitone-band energy from an FFT inside an `AudioWorklet`, and onset detection via spectral flux. Each expected pitch is verified against a harmonic template and compared with its neighbors, so chords are checked rather than transcribed.
  - _Monophonic fallback_: a YIN/McLeod pitch tracker for free play.
  - _Calibration_: the user plays a few reference notes to learn the instrument and room. Strictness is a per-profile setting.
  - _Known weak spot_: octave doubling (C4+C5 when only C4 was played). Mitigated by calibration and strictness.

### Audio

The sampler plays the inactive hand, accompaniment, the metronome, and preview taps on the on-screen keys. Samples are bundled with the app and never fetched at runtime. Optional MIDI out sends the inactive hand to the keyboard's own sound engine.

### Rendering

- `<PixiStage>` (React) creates the Pixi app and mounts a scene. React only pushes state changes; the scene animates on Pixi's ticker.
- Scene components:
  - `NoteHighway`: pooled `NoteSprite`s, batched from shared textures.
  - `PianoKeyboard`: expected, pressed, correct, and wrong key states; auto-fits the visible range to the song.
  - `HitLine`, `MeasureLines`, `HandLane`.
- Touch: drag the highway to scrub; tap a key to hear it.
- Transport controls are React `ui/` components overlaid on the canvas.

### Theming

- A theme is a JSON file of design tokens (color, radius, spacing, typography, motion).
- `themes/` converts tokens to CSS custom properties for the DOM and numeric colors for Pixi (`pixiTheme`). Theme changes apply live in both.
- Themes are selected per profile. Two ship by default (light, dark).
- Lint rules forbid color literals outside `themes/`.

### Routing

The in-house router discovers pages with `import.meta.glob('/src/renderer/pages/**/*.tsx')`, using hash history. Production pages are served from a custom `app://` protocol so `fetch` works for bundled assets.

| File                                           | Route                                       |
| ---------------------------------------------- | ------------------------------------------- |
| `index.tsx`                                    | `/` (profile picker)                        |
| `profiles/new.tsx`, `profiles/[profileId].tsx` | `/profiles/new`, `/profiles/:profileId`     |
| `library/index.tsx`                            | `/library`                                  |
| `song/[songId].tsx`                            | `/song/:songId`                             |
| `play/[songId].tsx`                            | `/play/:songId`                             |
| `settings/index.tsx`                           | `/settings` (profile settings, System menu) |
| `settings/songs.tsx`, `settings/devices.tsx`   | `/settings/songs`, `/settings/devices`      |
| `settings/credits.tsx`                         | `/settings/credits`                         |
| `_layout.tsx`                                  | layout wrapping its folder                  |
| `[...rest].tsx`                                | catch-all                                   |

Pages are lazy-loaded. Params are typed.

### Profiles and settings

- On launch, a profile picker shows a tile grid plus an "Add profile" tile. Profiles are unlimited, each with a name, avatar (icon and color), and their own settings, including theme and key labels. Favorites are per profile. An optional setting auto-selects the last-used profile.
- Settings have two layers:
  - **App**: MIDI devices, audio output device, kiosk/fullscreen. Library folders are library data, managed from Settings → Songs, which also opens single files.
  - **Profile**: theme, hand colors, default mode, wait tolerance, mic sensitivity, note speed, inactive-hand behavior.
- A profile value overrides an app value when both exist.
- **Schema-driven**: every setting is declared once in `shared/settings` with key, layer, type, default, label, and control. The settings page renders from that registry using `ui/` controls. Adding a setting means adding one registry entry.

### Data (SQLite)

Library (M4): `folders`, `songs` (content-hash id, summary, difficulty JSON, analysis version, hand override, favorite), `files` (path → song). Profiles (M5): `profiles`, `settings` (scope `app` or profile id, key, JSON value), `favorites` (profile, song), `sessions` (profile, song, mode, focus, tempo, play time, note counts, completed, start time, local day).

## Engineering rules

See `CLAUDE.md`. In short: reuse components, keep comments minimal and put documentation in `docs/reference/`, use theme tokens only, put pages in `pages/`.

## Milestones

Each milestone ends with a working app and updated `docs/reference/`.

### M0 — Scaffold

`electron-vite` + React + TS strict, pnpm, ESLint/Stylelint with the custom rules (no raw elements outside `ui/`, no color literals outside `themes/`), theme token system with light and dark themes, glob router, first `ui/` primitives (`Button`, `IconButton`, `Stack`, `Text`), docs skeleton, CI building Linux and Windows.
**Done when:** the app launches to placeholder pages, the theme switches live, and lint rejects violations.

### M1 — Play a song

MIDI parsing into `Song`, `<PixiStage>`, `NoteHighway`, `PianoKeyboard`, transport (play/pause/seek/tempo), sampler playback, settings registry with a single implicit profile.
**Done when:** you can open a MIDI and watch and hear it at a steady 60 fps on the laptop.

### M2 — Play along with a MIDI keyboard

Web MIDI input, live key highlighting, wait mode, play-along grading, loop regions, metronome.
**Done when:** wait mode works end-to-end with a real keyboard, including chords.

### M3 — Hands

Track-based and heuristic hand separation, hand focus, inactive-hand behavior (play/mute), manual split override.
**Done when:** you can practice the left hand alone while the app plays the right hand, on both two-track and single-track files.

### M4 — Library and difficulty

Folder scan in a utility process, SQLite index, feature extraction, scoring, a library page with sort/filter/search and favorites, a song detail page with difficulty breakdown, bundled starter pack (3 demos plus 177 Mutopia pieces in `resources/songs/<level>/`, credited in `CREDITS.md`).
**Done when:** a folder of hundreds of MIDIs is indexed and ranked, and the rankings look reasonable against the reference set.

### M5 — Profiles and settings

Profile picker, CRUD, avatars, per-profile settings and themes, settings page rendered from the schema, progress history (practice time, best scores, streaks), MIDI out option.
**Done when:** two profiles have independent settings, themes, and history.

### M6 — Mic input

`AudioWorklet` DSP, score-informed chord verification, monophonic fallback, calibration flow, strictness setting.
**Done when:** wait mode works on an acoustic piano for single notes and common chords.

### M7 — Ship

Kiosk mode, touch audit (target sizes, no hover dependencies), performance audit, installers, first release.

## Post-v1

- **Deterministic adaptive practice**: rank trouble measures by recent error rate, suggest a slowed loop on them, and step the tempo back up after N clean runs. Every suggestion shows its reason.
- Raspberry Pi build (ARM, reduced effects, resolution cap).
- Sheet music view.
- Theme editor.

## Risks

| Risk                                                | Mitigation                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| Mic chord accuracy (octaves, room noise)            | Score-informed checking, calibration, strictness setting; MIDI recommended |
| Hand-split heuristic errors                         | Prefer track data; manual override; fixture tests on known pieces          |
| Difficulty weights feel wrong                       | Reference ranking set; factor breakdown visible to users                   |
| `node:sqlite` is still flagged experimental in Node | Small wrapper (`LibraryDb`); swap to `better-sqlite3` if the API changes   |
| Audio latency on Linux                              | Low-latency `AudioContext` hint, measure in M1, MIDI out alternative       |
| Pi performance                                      | Keep the scene batched and pooled from day one                             |
