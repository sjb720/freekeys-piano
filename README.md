# Piano Teacher

Open-source, offline piano practice app for Linux and Windows. Falling notes onto a piano, wait mode, left/right hand practice, MIDI keyboard and mic input, difficulty-ranked library, profiles, and swappable themes.

Status: early development (M0 scaffold). See [docs/PLAN.md](docs/PLAN.md).

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

Contributor rules live in [CLAUDE.md](CLAUDE.md); module docs in [docs/](docs/README.md).

## License

MIT
