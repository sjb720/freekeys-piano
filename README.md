# FreeKeys

Open-source, offline piano practice app for Linux and Windows. Falling notes onto a piano, wait mode, left/right hand practice, MIDI keyboard and mic input, difficulty-ranked library, profiles, and swappable themes.

Status: early development. Milestones M0–M4 are done and M5 (profiles) is in progress. See [docs/PLAN.md](docs/PLAN.md).

## Download

Get the latest build from [Releases](https://github.com/sjb720/freekeys-piano/releases):

- **Windows:** `FreeKeys-<version>-windows-setup.exe`. The installer isn't code-signed yet, so Windows SmartScreen may warn; choose **More info → Run anyway**.
- **Linux:** `FreeKeys-<version>-linux-x86_64.AppImage` (`chmod +x`, then run) or `freekeys_<version>_amd64.deb` (`sudo apt install ./freekeys_<version>_amd64.deb`).

`SHA256SUMS.txt` lists checksums for every file.

## Develop

```sh
pnpm install
pnpm dev
```

| Command                                      | Does                             |
| -------------------------------------------- | -------------------------------- |
| `pnpm dev`                                   | Run with hot reload              |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Checks                           |
| `pnpm package:linux` / `pnpm package:win`    | Build installers into `release/` |

## Releasing

Run `pnpm release` on an up-to-date, clean `main`. It shows the current version and lets you pick patch, minor, major, or a custom version (or the current version if it was never tagged). It then runs lint, typecheck, and tests, bumps `package.json`, commits `Release vX.Y.Z`, tags it, and asks before pushing. Skip the menu with `pnpm release minor` (or `patch`, `major`, `current`, `1.2.3`); add `--skip-checks` to skip the local checks.

Pushing the tag starts the Release workflow. It checks that the tag matches `package.json`, runs lint and tests, builds the Windows and Linux packages, and publishes a GitHub Release with generated notes. `v0.x` releases are marked as pre-releases.

Contributor rules live in [CLAUDE.md](CLAUDE.md); module docs in [docs/](docs/README.md).

## License

The code is MIT licensed. That covers the code only. Bundled content keeps its own license:

- **Songs** in `resources/songs/` (other than the three demos) come from [The Mutopia Project](https://www.mutopiaproject.org/). Each file's license and typesetter are listed in [`resources/songs/CREDITS.md`](resources/songs/CREDITS.md): 138 are public domain, 6 are CC BY 3.0, and 33 are CC BY-SA. Each file's embedded title was changed to "Composer: Title"; CC BY-SA files stay under CC BY-SA. The app shows these credits under Settings → Credits & licenses.
- **Piano samples** are Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.

To refresh the songs, run `node ../freekeys-finder/scripts/download.mjs --out resources/songs` from a checkout of freekeys-finder next to this repo. It verifies each file against its manifest checksum and rewrites `CREDITS.md`.
