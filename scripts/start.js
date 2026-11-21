#!/usr/bin/env node
/**
 * Jet Admin - one-command launcher
 * --------------------------------
 * Starts Docker (if needed), brings up the Docker Compose infrastructure, and
 * starts any combination of the applications in this monorepo.
 *
 * Run `node scripts/start.js --help` for usage, or
 * `node scripts/start.js --list` for every available preset / combination.
 *
 * No third-party runtime dependencies: only Node built-ins + the tools that
 * are already part of this repo (docker compose, npm, concurrently).
 */
'use strict';

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const COMPOSE_FILE = 'docker-compose.yml';
const CONCURRENTLY = path.join(ROOT, 'node_modules', 'concurrently', 'dist', 'bin', 'concurrently.js');
const LOG_DIR = path.join(ROOT, 'logs', 'launcher');
const STATE_FILE = path.join(os.tmpdir(), 'jet-admin-launcher-state.json');
const IS_WIN = process.platform === 'win32';

/* ------------------------------------------------------------------ *
 * Catalogs - these are the "applications" that can be combined.
 * ------------------------------------------------------------------ */

const APPS = {
  frontend: {
    label: 'Web app (React / Vite, :5173)',
    compose: 'frontend',
    dev: 'cd apps/frontend && npm run dev',
    needs: ['backend'],
    color: 'cyan',
  },
  backend: {
    label: 'API server + websockets (:8090 in Docker)',
    compose: 'backend',
    dev: IS_WIN
      ? 'cd apps/backend && npm run dev-w'
      : 'cd apps/backend && npm run dev',
    needs: ['postgres', 'redis', 'temporal'],
    color: 'green',
  },
  admin: {
    label: 'Admin app (React / Vite, :5174)',
    compose: null, // no Dockerfile.admin exists - always runs locally
    dev: 'cd apps/admin && npm run dev',
    needs: ['backend'],
    color: 'magenta',
  },
  mcp: {
    label: 'MCP server (Docker profile: mcp)',
    compose: 'mcp-server',
    profile: 'mcp',
    dev: 'cd apps/mcp-server && node index.js',
    needs: ['backend'],
    color: 'blue',
  },
  listener: {
    label: 'Listener proxy (webhook ingress)',
    compose: 'listener-proxy',
    dev: 'cd apps/listener-proxy && npm run dev',
    needs: ['backend'],
    color: 'yellow',
  },
  worker: {
    label: 'Temporal workflow worker',
    compose: 'temporal-worker',
    dev: 'cd apps/backend && npm run temporal:worker',
    needs: ['temporal'],
    color: 'red',
  },
};

const APP_KEYS = Object.keys(APPS);

/** Infrastructure that can be required by apps or enabled explicitly. */
const INFRA = {
  postgres: { label: 'Application database', services: ['postgres'], core: true },
  redis: { label: 'Redis (queues / cache)', services: ['redis'], core: true },
  temporal: {
    label: 'Temporal server + DB + UI',
    services: ['temporal-postgres', 'temporal', 'temporal-ui'],
    core: true,
  },
  storage: {
    label: 'RustFS object storage',
    services: ['rustfs', 'storage-init'],
    profile: 'storage',
  },
  tools: {
    label: 'Temporal admin tools (debug)',
    services: ['temporal-admin-tools'],
    profile: 'tools',
  },
};

const INFRA_KEYS = Object.keys(INFRA);

/** Named ready-made combinations. */
const PRESETS = {
  core: {
    apps: ['frontend', 'backend'],
    desc: 'Web app + API + core infrastructure (Postgres, Redis, Temporal)',
  },
  full: {
    apps: [...APP_KEYS],
    infra: ['storage', 'tools'],
    desc: 'EVERYTHING: all apps + all Docker profiles',
  },
  api: {
    apps: ['backend', 'mcp', 'listener', 'worker'],
    desc: 'All backend-side services (no UIs)',
  },
  ui: {
    apps: ['frontend', 'admin'],
    desc: 'Both UIs (API started automatically as a dependency)',
  },
  mcp: { apps: ['mcp'], desc: 'MCP server (API + infra started automatically)' },
  frontend: { apps: ['frontend'], desc: 'Web app only' },
  backend: { apps: ['backend'], desc: 'API only' },
  admin: { apps: ['admin'], desc: 'Admin app only' },
  listener: { apps: ['listener'], desc: 'Listener proxy only' },
  worker: { apps: ['worker'], desc: 'Temporal worker only' },
  infra: {
    apps: [],
    infra: ['postgres', 'redis', 'temporal'],
    desc: 'Docker infrastructure only - no applications',
  },
};

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function run(cmd, args, opts) {
  const options = Object.assign({ stdio: 'inherit', cwd: ROOT }, opts || {});
  const result = spawnSync(cmd, args, options);
  if (result.error) throw result.error;
  return result;
}

function commandExists(cmd) {
  return run(cmd, ['--version'], { stdio: 'ignore' }).status === 0;
}

function composeArgs(extra) {
  return ['compose', '-f', COMPOSE_FILE].concat(extra || []);
}

function ensureDocker(opts) {
  const probe = () => run('docker', ['info'], { stdio: 'ignore' }).status === 0;
  if (probe()) return;

  if (opts.skipDockerStart) {
    throw new Error('Docker daemon is not running (--skip-docker-start was set).');
  }

  log('Docker is not running. Attempting to start it...');
  if (IS_WIN) {
    const candidates = [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Docker', 'Docker', 'Docker Desktop.exe'),
    ];
    const exe = candidates.find((p) => p && fs.existsSync(p));
    if (!exe) throw new Error('Could not find Docker Desktop.exe. Start Docker manually and re-run.');
    spawn(exe, [], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  } else if (process.platform === 'darwin') {
    run('open', ['-a', 'Docker'], { stdio: 'ignore' });
  } else {
    throw new Error('Docker daemon is not running. Start it (e.g. `sudo systemctl start docker`) and re-run.');
  }

  const deadline = Date.now() + 120000;
  process.stdout.write('Waiting for Docker ');
  while (Date.now() < deadline) {
    if (probe()) {
      process.stdout.write(' ready\n');
      return;
    }
    process.stdout.write('.');
    run(IS_WIN ? 'cmd' : 'sleep', IS_WIN ? ['/c', 'timeout /t 2 /nobreak >nul'] : ['2'], {
      stdio: 'ignore',
    });
  }
  throw new Error('Timed out waiting for Docker to become ready.');
}

function log(msg) {
  process.stdout.write(`\n[jet-admin] ${msg}\n`);
}

/* ------------------------------------------------------------------ *
 * Combination generation - every non-empty subset of the app catalog.
 * ------------------------------------------------------------------ */

function allCombinations() {
  const result = [];
  for (let mask = 1; mask < 1 << APP_KEYS.length; mask += 1) {
    const apps = APP_KEYS.filter((_, i) => mask & (1 << i));
    result.push({ mask, key: apps.join('+'), apps });
  }
  return result;
}

function applyPreset(name) {
  if (PRESETS[name]) return PRESETS[name];
  if (name.startsWith('combo:')) {
    const key = name.slice(6);
    const byKey = allCombinations().find((c) => c.key === key || String(c.mask) === key);
    if (byKey) return { apps: byKey.apps, desc: `Combination #${byKey.mask}: ${byKey.apps.join(' + ')}` };
  }
  throw new Error(`Unknown preset "${name}". Run --list to see all presets and combinations.`);
}

/* ------------------------------------------------------------------ *
 * Selection + dependency resolution
 * ------------------------------------------------------------------ */

function resolveSelection(opts) {
  let selectedApps;
  let extraInfra = [];
  let mode = opts.mode || 'docker';

  if (opts.apps) {
    selectedApps = opts.apps.split(',').map((s) => s.trim()).filter(Boolean);
    selectedApps.forEach((a) => {
      if (!APPS[a]) throw new Error(`Unknown app "${a}". Valid apps: ${APP_KEYS.join(', ')}`);
    });
  } else {
    const preset = applyPreset(opts.preset || (opts.all ? 'full' : 'core'));
    selectedApps = [...preset.apps];
    extraInfra = [...(preset.infra || [])];
    if (preset.mode) mode = preset.mode;
  }

  const apps = new Set(selectedApps);
  const infra = new Set();

  if (!opts.noDeps) {
    // Expand app -> app and app -> infra dependencies until stable.
    let changed = true;
    while (changed) {
      changed = false;
      apps.forEach((a) => {
        (APPS[a].needs || []).forEach((dep) => {
          const target = APPS[dep] ? apps : infra;
          if (!target.has(dep)) {
            target.add(dep);
            changed = true;
          }
        });
      });
    }
  }

  extraInfra.forEach((i) => {
    if (!INFRA[i]) throw new Error(`Unknown infrastructure "${i}". Valid: ${INFRA_KEYS.join(', ')}`);
    infra.add(i);
  });

  const profiles = new Set();
  const services = new Set();
  const localApps = [];

  infra.forEach((i) => {
    const def = INFRA[i];
    if (def.profile) profiles.add(def.profile);
    def.services.forEach((s) => services.add(s));
  });

  apps.forEach((a) => {
    const def = APPS[a];
    if (mode === 'docker' && def.compose) {
      services.add(def.compose);
      if (def.profile) profiles.add(def.profile);
    } else {
      // Dev mode, or an app without a Docker image (admin): run locally.
      localApps.push(a);
    }
  });

  return {
    apps: [...apps],
    infra: [...infra],
    profiles: [...profiles],
    services: [...services],
    localApps,
    mode,
  };
}

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

function buildComposeCommand(selection, action, opts) {
  const base = composeArgs(selection.profiles.map((p) => ['--profile', p]).flat());
  if (action === 'up') {
    return ['docker', base.concat(['up', '-d'], opts.noBuild ? [] : ['--build'], selection.services)];
  }
  if (action === 'down') return ['docker', base.concat(['down'])];
  if (action === 'ps') return ['docker', base.concat(['ps'])];
  if (action === 'logs') return ['docker', base.concat(['logs', '-f'], opts.logService ? [opts.logService] : [])];
  return null;
}

// Fixed container names cannot be shared with standalone containers or another
// Compose project. Check before `up` so a conflict cannot leave a partial start.
function checkContainerOwnership(selection, execute = run) {
  const configResult = execute('docker', composeArgs(
    selection.profiles.flatMap((p) => ['--profile', p])
  ).concat(['config', '--format', 'json']), { encoding: 'utf8', stdio: 'pipe' });
  if (configResult.status !== 0) throw new Error('Could not read Docker Compose configuration.');
  const config = JSON.parse(configResult.stdout);
  const services = new Set();
  function visit(name) {
    if (services.has(name) || !config.services[name]) return;
    services.add(name);
    Object.keys(config.services[name].depends_on || {}).forEach(visit);
  }
  selection.services.forEach(visit);

  const conflicts = [];
  for (const service of services) {
    const name = config.services[service].container_name;
    if (!name) continue;
    const result = execute('docker', ['container', 'inspect', name], {
      encoding: 'utf8', stdio: 'pipe',
    });
    if (result.status !== 0) {
      if (/no such (object|container)/i.test(result.stderr || '')) continue;
      throw new Error(`Could not inspect container ${name}; check Docker connectivity.`);
    }
    const [container] = JSON.parse(result.stdout);
    const labels = container.Config.Labels || {};
    if (labels['com.docker.compose.project'] === config.name &&
        labels['com.docker.compose.service'] === service) continue;
    const owner = labels['com.docker.compose.project'] || 'standalone (not managed by Compose)';
    conflicts.push(`${name}: ${owner}, status ${container.State.Status}`);
  }
  if (conflicts.length) {
    throw new Error(
      `Container names are already occupied outside this Compose service/project (${config.name}):\n` +
      conflicts.map((c) => `  ${c}`).join('\n') +
      '\nRename the conflicting containers before retrying (stop them first if running). ' +
      'Example: docker rename <name> <name>-backup\n' +
      'No containers or volumes have been changed by this preflight check.'
    );
  }
}

function show(selection, opts) {
  const actions = [];
  if (selection.services.length) {
    const [cmd, args] = buildComposeCommand(selection, 'up', opts);
    actions.push([cmd].concat(args).join(' '));
  }
  if (selection.localApps.length) {
    const names = selection.localApps.join(',');
    const colors = selection.localApps.map((a) => APPS[a].color).join(',');
    const commands = selection.localApps.map((a) => `"${APPS[a].dev}"`);
    actions.push(
      `node ${path.relative(ROOT, CONCURRENTLY)} -k -n ${names} -c ${colors} ${commands.join(' ')}`
    );
  }
  log(`Mode: ${selection.mode}`);
  log(`Apps:     ${selection.apps.join(', ') || '(none)'}`);
  log(`Infra:    ${selection.infra.join(', ') || '(none)'}`);
  log(`Profiles: ${selection.profiles.join(', ') || '(none)'}`);
  log(`Services: ${selection.services.join(', ') || '(none)'}`);
  log(`Local:    ${selection.localApps.join(', ') || '(none)'}`);
  process.stdout.write('\nCommands:\n');
  actions.forEach((a) => process.stdout.write(`  ${a}\n`));
  process.stdout.write('\n');
}

function writeState(selection, pids) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ selection, pids, composeFile: COMPOSE_FILE, savedAt: new Date().toISOString() }, null, 2)
  );
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (_) {
    return null;
  }
}

function waitForServices(selection, execute = run,
  pause = () => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000),
  now = Date.now) {
  const deadline = now() + 300000;
  let pending = [...selection.services];
  let previous = '';
  while (now() < deadline) {
    const args = composeArgs(selection.profiles.flatMap((p) => ['--profile', p]))
      .concat(['ps', '--all', '--format', 'json'], selection.services);
    const result = execute('docker', args, { encoding: 'utf8', stdio: 'pipe' });
    if (result.status !== 0) throw new Error('Could not check Docker service readiness.');
    const output = result.stdout.trim();
    const rows = !output ? [] : output.startsWith('[') ? JSON.parse(output)
      : output.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    for (const row of rows) {
      const completed = row.Service === 'storage-init' && row.State === 'exited' && Number(row.ExitCode) === 0;
      if (!completed && ['restarting', 'exited', 'dead', 'removing'].includes(row.State)) {
        throw new Error(`Docker service ${row.Service} is ${row.State}. Check: docker compose -f ${COMPOSE_FILE} logs --tail 100 ${row.Service}`);
      }
    }
    pending = selection.services.filter((service) => {
      const containers = rows.filter((row) => row.Service === service);
      return !containers.length || containers.some((row) => {
        if (service === 'storage-init' && row.State === 'exited' && Number(row.ExitCode) === 0) return false;
        return row.State !== 'running' || (row.Health && row.Health !== 'healthy');
      });
    });
    if (!pending.length) return;
    if (pending.join(', ') !== previous) {
      previous = pending.join(', ');
      log(`Waiting for readiness: ${previous}`);
    }
    pause();
  }
  throw new Error(`Docker services did not become ready within 5 minutes: ${pending.join(', ')}. Check their logs with --logs.`);
}

function getStartupUrls(selection) {
  const urls = [];
  if (selection.apps.includes('frontend')) urls.push(`Web app: ${selection.mode === 'docker' ? 'http://localhost' : 'http://localhost:5173'}`);
  if (selection.apps.includes('admin')) urls.push('Admin: http://localhost:5174');
  if (selection.apps.includes('backend')) urls.push('API: http://localhost:8090');
  if (selection.apps.includes('mcp')) urls.push('MCP: http://localhost:5001');
  if (selection.apps.includes('listener')) urls.push('Listener: http://localhost:8095');
  if (selection.services.includes('temporal-ui')) urls.push('Temporal UI: http://localhost:8088');
  if (selection.services.includes('temporal-postgres')) urls.push('Temporal Postgres (debug): localhost:5433');
  return urls;
}

function start(selection, opts) {
  if (opts.dryRun) {
    show(selection, opts);
    return;
  }

  if (!commandExists('docker')) throw new Error('docker command not found on PATH.');
  ensureDocker(opts);

  if (selection.services.length) {
    checkContainerOwnership(selection);
    const [cmd, args] = buildComposeCommand(selection, 'up', opts);
    log(`Starting Docker services: ${selection.services.join(', ')}`);
    const r = run(cmd, args);
    if (r.status !== 0) throw new Error(`docker compose up failed (exit ${r.status}).`);
    waitForServices(selection);
  }

  const pids = [];
  if (selection.localApps.length) {
    const names = selection.localApps.join(',');
    const colors = selection.localApps.map((a) => APPS[a].color).join(',');
    const commands = selection.localApps.map((a) => APPS[a].dev);
    const concArgs = ['-k', '-n', names, '-c', colors].concat(commands);

    if (opts.attach) {
      log('Starting local apps in the foreground (Ctrl+C to stop)...');
      const child = spawn(process.execPath, [CONCURRENTLY].concat(concArgs), {
        cwd: ROOT,
        stdio: 'inherit',
      });
      const forward = () => child.kill('SIGINT');
      process.on('SIGINT', forward);
      child.on('exit', (code) => {
        process.removeListener('SIGINT', forward);
        process.exit(code || 0);
      });
      writeState(selection, pids);
      return;
    }

    fs.mkdirSync(LOG_DIR, { recursive: true });
    const logFile = path.join(LOG_DIR, `apps-${Date.now()}.log`);
    const out = fs.openSync(logFile, 'a');
    const child = spawn(process.execPath, [CONCURRENTLY].concat(concArgs), {
      cwd: ROOT,
      detached: true,
      stdio: ['ignore', out, out],
    });
    child.unref();
    fs.closeSync(out);
    pids.push(child.pid);
    log(`Local apps running in background (log: ${path.relative(ROOT, logFile)})`);
  }

  writeState(selection, pids);
  log('Done.');
  getStartupUrls(selection).forEach(log);
  process.stdout.write('\nUse --ps to check status, --logs to follow logs, --stop to shut everything down.\n');
}

function stop(opts) {
  const state = readState();
  if (state && state.pids && state.pids.length) {
    state.pids.forEach((pid) => {
      try {
        if (IS_WIN) {
          run('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
        } else {
          process.kill(-pid, 'SIGTERM');
        }
      } catch (_) {
        /* already gone */
      }
    });
    log('Stopped local app processes.');
  }

  const base = composeArgs((state && state.selection.profiles || []).map((p) => ['--profile', p]).flat());
  const r = run('docker', base.concat(['down']), { stdio: 'inherit' });
  if (r.status === 0) log('Docker services stopped.');
  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
}

function status(opts) {
  const state = readState();
  const profiles = state ? state.selection.profiles : [];
  const r = run('docker', composeArgs(profiles.map((p) => ['--profile', p]).flat()).concat(['ps']), {
    stdio: 'inherit',
  });
  if (state && state.pids && state.pids.length) {
    log(`Tracked local app PIDs: ${state.pids.join(', ')}`);
  }
  return r.status || 0;
}

function logs(opts) {
  const state = readState();
  const profiles = state ? state.selection.profiles : [];
  const cmd = buildComposeCommand(
    { profiles, services: [], localApps: [] },
    'logs',
    opts
  );
  run(cmd[0], cmd[1], { stdio: 'inherit' });
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const HELP = `
Jet Admin launcher - start the app from Docker upward.

USAGE
  node scripts/start.js [options]
  .\\start.ps1 [options]          (PowerShell wrapper)
  ./start.sh [options]           (Bash / WSL / macOS wrapper)

OPTIONS
  -p, --preset <name>   Start a named preset (see PRESETS below)
  -a, --apps <a,b,c>    Start an explicit app combination
  -m, --mode <name>     docker (default) = all services in Docker
                        dev = infrastructure in Docker, apps locally with hot reload
      --all             Same as --preset full
      --no-deps         Do not auto-start dependencies (backend, infra, ...)
      --no-build        Do not rebuild Docker images
      --skip-docker-start   Do not try to launch Docker Desktop when it is stopped
      --attach          Run local dev apps in the foreground instead of background
      --dry-run         Print the commands only, do not execute
      --stop            Stop everything (Docker services + local apps)
      --ps              Show container status
      --logs [service]  Follow logs (optionally for one compose service)
  -l, --list            List apps, presets and EVERY app combination
  -h, --help            Show this help

APPLICATIONS (comma-separated with --apps)
  ${APP_KEYS.join(', ')}

PRESETS
${Object.entries(PRESETS).map(([k, v]) => `  ${k.padEnd(10)} ${v.desc}`).join('\n')}
  combo:<a+b>        Any combination, e.g. combo:frontend+backend+mcp
  combo:<number>      Combination by bitmask (1..63), e.g. combo:7

EXAMPLES
  .\\start.ps1                              # core: web app + API + infra
  .\\start.ps1 --all                        # the complete application
  .\\start.ps1 --preset full --mode dev      # everything, hot reload
  .\\start.ps1 --apps frontend,admin         # both UIs
  .\\start.ps1 --preset combo:backend+mcp    # a specific combination
  .\\start.ps1 --stop
`;

function list() {
  process.stdout.write(HELP);
  process.stdout.write('\nALL COMBINATIONS (63 non-empty subsets of the app catalog)\n');
  allCombinations().forEach((c) => {
    process.stdout.write(`  ${String(c.mask).padStart(2)}  combo:${c.key.padEnd(56)} -> --apps ${c.apps.join(',')}\n`);
  });
}

function parse(argv) {
  const opts = {};
  const flags = {
    '--all': 'all',
    '--no-deps': 'noDeps',
    '--no-build': 'noBuild',
    '--skip-docker-start': 'skipDockerStart',
    '--attach': 'attach',
    '--dry-run': 'dryRun',
    '--stop': 'stop',
    '--ps': 'ps',
    '--list': 'list',
    '--help': 'help',
    '-h': 'help',
    '-l': 'list',
  };
  const valued = {
    '--preset': 'preset',
    '-p': 'preset',
    '--apps': 'apps',
    '-a': 'apps',
    '--mode': 'mode',
    '-m': 'mode',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (flags[arg]) {
      opts[flags[arg]] = true;
    } else if (valued[arg]) {
      if (i + 1 >= argv.length) throw new Error(`Missing value for ${arg}`);
      opts[valued[arg]] = argv[++i];
    } else if (arg === '--logs') {
      opts.logs = true;
      if (argv[i + 1] && !argv[i + 1].startsWith('-')) opts.logService = argv[++i];
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return opts;
}

function main() {
  const opts = parse(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(HELP);
    return;
  }
  if (opts.list) {
    list();
    return;
  }
  if (opts.mode && !['docker', 'dev'].includes(opts.mode)) {
    throw new Error('--mode must be "docker" or "dev"');
  }

  if (opts.stop) return stop(opts);
  if (opts.ps) return status(opts);
  if (opts.logs) return logs(opts);

  const selection = resolveSelection(opts);
  start(selection, opts);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`\n[jet-admin] ERROR: ${err.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { checkContainerOwnership, buildComposeCommand, waitForServices, getStartupUrls };
