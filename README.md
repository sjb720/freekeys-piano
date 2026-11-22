# FreeKeys

FreeKeys is an open-source piano practice app that runs fully offline. Notes fall onto an on-screen keyboard while you play along on a MIDI keyboard. It ships with 180 songs ranked by difficulty, splits every song into left and right hands, and can wait for you to play each note before moving on.

It runs on Linux and Windows, with installers on the Releases page, and on macOS from source.

Status: early development. Milestones M0 to M4 are done and M5 (profiles and settings) is mostly done. See [docs/PLAN.md](docs/PLAN.md) for the roadmap.

## Features

**Library**

- 180 songs included: 3 short demos plus 177 classical pieces from [The Mutopia Project](https://www.mutopiaproject.org/), from Bach minuets to Chopin études.
- Add your own songs by dragging MIDI files onto the window, from Settings → Songs, or by adding whole folders that are scanned recursively.
- Search, filter by level (Beginner, Intermediate, Advanced), show favorites, and sort by easiest, hardest, title, or newest.

**Difficulty**

- Every song gets a level from 1 to 10, computed from the notes. No hand-entered ratings.
- Levels are rated per hand, so you can find songs where the left hand is easy.
- The song page explains what makes a piece hard, such as fast passages, leaps, wide stretches, big chords, or tricky rhythm.

**Practice modes**

- **Watch:** the song plays itself.
- **Play along:** the song keeps time and scores you.
- **Wait:** playback stops at each note or chord until you play it.
- Practice the left hand, the right hand, or both. The app can play the other hand for you or leave it silent.
- Loop a section, slow the tempo, turn on the metronome, and show note names on the keys and falling notes.

**Hands**

- Hands are detected automatically. Two-track files use their tracks. Files with more tracks are split by what each hand can physically reach. Single-track files are split note by note.
- If the split looks wrong, open Hands in the player to split at a key, swap hands, or assign each track to a hand yourself.

**Profiles and progress**

- Each person gets a profile with their own avatar, theme, settings, and favorites.
- Progress tracks practice time, daily streaks, sessions, and best scores per song.

**Offline and private**

- No accounts, no cloud, and no network access while the app runs.
- Everything is computed on your computer, with no AI or machine learning.

**Planned:** microphone input for acoustic pianos, MIDI out to your keyboard's own sound, kiosk mode, and macOS installers.

## Download

Get the latest build from [Releases](https://github.com/sjb720/freekeys-piano/releases):

- **Windows:** `FreeKeys-<version>-windows-setup.exe`. The installer isn't code-signed yet, so Windows SmartScreen may warn. Choose **More info**, then **Run anyway**.
- **Linux:** `FreeKeys-<version>-linux-x86_64.AppImage` (run `chmod +x` on it, then run it) or `freekeys_<version>_amd64.deb` (`sudo apt install ./freekeys_<version>_amd64.deb`).
- **macOS:** no installer yet. Run from source (see below).

`SHA256SUMS.txt` lists checksums for every file.

## Using your own songs

FreeKeys reads standard MIDI files (`.mid`, `.midi`). Files with separate tracks for each hand work best, but single-track files work too.

- **Add songs** (Settings → Songs, or drag files onto the window) copies the files into FreeKeys's own "Imported songs" folder, so you can move or delete the originals. Files that aren't MIDI, or are already in your library, are skipped.
- **Song folders** (Settings → Songs) are read in place, including subfolders. They're rescanned at launch and when you press Rescan.
- **Open file** plays a single file without adding it to the library.

## Develop

Requires Node.js 24 and pnpm.

```sh
pnpm install
pnpm dev
```

| Command                                   | Does                                                          |
| ----------------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                                | Run the app with hot reload                                   |
| `pnpm build`                              | Typecheck and build to `out/`                                 |
| `pnpm lint`                               | ESLint and Stylelint, including the component and color rules |
| `pnpm typecheck`                          | `tsc` for the node and web projects                           |
| `pnpm test`                               | Vitest unit tests and lint rule tests                         |
| `pnpm package:linux` / `pnpm package:win` | Build installers into `release/`                              |
| `pnpm release`                            | Pick a version, bump, tag, and push to publish a release      |

Platform notes:

- **WSL:** Electron needs `--no-sandbox`, as in `pnpm dev -- --no-sandbox`.
- **macOS:** if `pnpm dev` can't find Electron (common after copying `node_modules` from another OS), run `node node_modules/electron/install.js` to download the macOS binary.

### Project layout

| Path               | Contents                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| `src/main/`        | Electron main process: window, SQLite database, library scanning, IPC       |
| `src/preload/`     | The typed `window.api` bridge                                               |
| `src/shared/`      | Pure TypeScript: MIDI parsing, hand separation, difficulty, settings schema |
| `src/renderer/`    | React UI, PixiJS scene, practice engine, MIDI input, audio, themes          |
| `resources/songs/` | Bundled songs and their `CREDITS.md`                                        |
| `docs/`            | Plan and per-module reference                                               |

Contributor rules are in [CLAUDE.md](CLAUDE.md). Module docs are in [docs/](docs/README.md): every exported function and component is listed in `docs/reference/`.

### Updating the bundled songs

The 177 Mutopia pieces come from the [freekeys-finder](../freekeys-finder) collection. With a checkout of freekeys-finder next to this repo, run:

```sh
node ../freekeys-finder/scripts/download.mjs --out resources/songs
```

It downloads each file, checks it against the manifest checksum, sets the embedded title to "Composer: Title", and rewrites `resources/songs/CREDITS.md`. A test fails if any bundled song is missing a credit, or any credit is missing its file.

## Releasing

Run `pnpm release` on an up-to-date, clean `main`. It shows the current version and lets you pick patch, minor, major, or a custom version (or the current version if it was never tagged). It then runs lint, typecheck, and tests, bumps `package.json`, commits `Release vX.Y.Z`, tags it, and asks before pushing. Skip the menu with `pnpm release minor` (or `patch`, `major`, `current`, `1.2.3`). Add `--skip-checks` to skip the local checks.

Pushing the tag starts the Release workflow. It checks that the tag matches `package.json`, runs lint and tests, builds the Windows and Linux packages, and publishes a GitHub Release with generated notes. `v0.x` releases are marked as pre-releases.

## License

The code is MIT licensed. That license covers the code only. Bundled content keeps its own license:

- **Songs:** the pieces in `resources/songs/` (all but the three demos) come from [The Mutopia Project](https://www.mutopiaproject.org/). [`resources/songs/CREDITS.md`](resources/songs/CREDITS.md) lists each file's typesetter and license: 138 are public domain, 6 are CC BY 3.0, and 33 are CC BY-SA. Each file's embedded title was changed to "Composer: Title", and the CC BY-SA files stay under CC BY-SA.
- **Piano samples:** Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.

The app shows these credits under Settings → Credits & licenses.
