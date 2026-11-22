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

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag v0.2.0 && git push origin v0.2.0`.
3. The Release workflow checks that the tag matches `package.json`, runs lint and tests, builds the Windows and Linux packages, and publishes a GitHub Release with generated notes. `v0.x` releases are marked as pre-releases.

Contributor rules live in [CLAUDE.md](CLAUDE.md); module docs in [docs/](docs/README.md).

## License

MIT
