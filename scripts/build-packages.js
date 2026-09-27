/**
 * build-packages.js
 *
 * Builds every workspace package that ships a `build` script
 * (esbuild → dist/). Required inside Docker images: package entry points
 * resolve to `dist/index.cjs|mjs`, and `dist/` is excluded from the build
 * context via .dockerignore — so images must build packages themselves
 * instead of relying on a locally-built `dist/`.
 *
 * Usage: `npm run build:packages` (from the repo root, incl. Dockerfiles).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(repoRoot, 'packages');

// npm does not always put the hoisted .bin on PATH for workspace scripts
// (observed: esbuild resolved for some packages, "not found" for others).
// Pin it explicitly so every package build sees the same binaries.
const rootBin = path.join(repoRoot, 'node_modules', '.bin');
const childEnv = {
  ...process.env,
  PATH: `${rootBin}${path.delimiter}${process.env.PATH || ''}`,
};

const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
let built = 0;

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const manifestPath = path.join(packagesDir, entry.name, 'package.json');
  if (!fs.existsSync(manifestPath)) continue;
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    console.error(`build-packages: skipping ${entry.name} (unreadable package.json: ${err.message})`);
    continue;
  }
  if (!manifest.scripts || !manifest.scripts.build) {
    console.log(`build-packages: skipping ${manifest.name || entry.name} (no build script)`);
    continue;
  }
  console.log(`build-packages: building ${manifest.name || entry.name}...`);
  execSync('npm run build', {
    cwd: path.join(packagesDir, entry.name),
    stdio: 'inherit',
    env: childEnv,
  });
  built += 1;
}

console.log(`build-packages: done (${built} package(s) built)`);
