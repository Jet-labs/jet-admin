# Jet Admin launcher (`start.ps1` / `start.sh`)

One command starts the whole application: it checks/starts Docker, brings up the
Docker Compose infrastructure, and launches any combination of the apps in this
monorepo.

The logic lives in [`scripts/start.js`](../scripts/start.js) (Node built-ins only).
`start.ps1` and `start.sh` are thin cross-platform wrappers.

## Quick start

```powershell
# PowerShell (Windows)
.\start.ps1                       # core: web app + API + Postgres/Redis/Temporal
.\start.ps1 --all                 # the complete application: every app + every Docker profile
.\start.ps1 --all --mode dev      # same, but apps run locally with hot reload
.\start.ps1 --stop                # stop everything
.\start.ps1 --ps                  # container status
.\start.ps1 --logs backend        # follow logs for one service
```

```bash
# Bash / WSL / macOS
./start.sh --all
./start.sh --apps frontend,admin
```

Or via npm:

```bash
npm start -- --all                 # forwards args to the launcher
npm run start:core
npm run start:dev -- --all
npm run start:combo -- combo:backend+mcp
npm run start:list
npm run start:stop
```

## Applications (the things you can combine)

| Key | What it is | Docker service | Local dev command |
| --- | --- | --- | --- |
| `frontend` | Web app (:5173) | `frontend` | `cd apps/frontend && npm run dev` |
| `backend` | API + websockets (:8090) | `backend` | `cd apps/backend && npm run dev-w` (`dev` on POSIX) |
| `admin` | Admin app (:5174) | — (no Dockerfile) | `cd apps/admin && npm run dev` |
| `mcp` | MCP server | `mcp-server` (profile `mcp`) | `cd apps/mcp-server && node index.js` |
| `listener` | Listener / webhook proxy | `listener-proxy` | `cd apps/listener-proxy && npm run dev` |
| `worker` | Temporal workflow worker | `temporal-worker` | `cd apps/backend && npm run temporal:worker` |

Infrastructure started from `docker-compose.yml`: `postgres`, `redis`,
`temporal-postgres`, `temporal`, `temporal-ui`, plus optional profiles `storage`
(RustFS) and `tools` (Temporal admin tools).

## Modes

- `docker` (default): selected apps run as Docker Compose services. `admin` has no
  image, so it always runs locally.
- `dev`: infrastructure runs in Docker, selected apps run locally with hot reload.

## Named presets

| Preset | Starts |
| --- | --- |
| `core` | `frontend` + `backend` + core infra (default) |
| `full` | **all 6 apps** + `storage` + `tools` profiles |
| `api` | `backend` + `mcp` + `listener` + `worker` |
| `ui` | `frontend` + `admin` |
| `frontend`, `backend`, `admin`, `mcp`, `listener`, `worker` | that app (dependencies added automatically) |
| `infra` | infrastructure only, no apps |

Dependencies are added automatically (e.g. `frontend` pulls in `backend`, which
pulls in Postgres/Redis/Temporal). Pass `--no-deps` to disable that.

## All combinations

Every non-empty subset of the 6 apps is available as a preset — 63 variants:

```powershell
.\start.ps1 --preset combo:frontend+backend
.\start.ps1 --preset combo:backend+mcp+listener
.\start.ps1 --preset combo:7            # by bitmask (1..63)
.\start.ps1 --apps frontend,admin       # equivalent explicit form
```

Bit order is `frontend, backend, admin, mcp, listener, worker` (frontend = bit 1).
Run `.\start.ps1 --list` to print the complete table of all 63 combinations with
their equivalent `--apps` commands.

## Options

```
-p, --preset <name>       named preset or combo:<keys|number>
-a, --apps <a,b,c>        explicit app combination
-m, --mode docker|dev     docker (default) or local hot reload
    --all                 alias for --preset full
    --no-deps             don't auto-start dependencies
    --no-build            don't rebuild Docker images
    --skip-docker-start   don't try to launch Docker Desktop
    --attach              run local apps in the foreground
    --dry-run             print commands without executing
    --stop                stop Docker services + local apps
    --ps                  show container status
    --logs [service]      follow logs
-l, --list                list presets and all combinations
```

## Ports

`80` (Docker frontend) · `5173` (Vite web app) · `5174` (Vite admin) ·
`8090` (API) · `8088` (Temporal UI) · `7233` (Temporal gRPC) ·
`5433` (Postgres debug) · `9000` (RustFS, profile `storage`).

## Notes

- Startup checks container ownership before making changes. If a fixed name such
  as `jet-admin-redis` is occupied by a standalone container or another Compose
  project, stop and rename that container (for example,
  `docker rename jet-admin-redis jet-admin-redis-backup`), then retry. Renaming
  preserves the container and its volumes; do not use `down -v` to resolve this.

- Docker Desktop is started automatically when the daemon is not running
  (Windows/macOS). On Linux, start the daemon yourself.
- Local app logs are written to `logs/launcher/` (gitignored).
- Runtime state (PIDs, selected profiles) goes to the OS temp directory and is
  used by `--stop`, `--ps` and `--logs`.
