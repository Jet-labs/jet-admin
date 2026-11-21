/**
 * Regenerate one or all marketplace template packages.
 *
 * Usage:
 *   node marketplace/scripts/generate-templates.js               # all specs
 *   node marketplace/scripts/generate-templates.js crm-sales-pipeline
 */
const fs = require("fs");
const path = require("path");
const { buildPackage, writePackage } = require("./lib/compiler");

const ROOT = path.resolve(__dirname, "..", "..");
const SPECS_DIR = path.join(__dirname, "..", "specs");
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

function listSpecs() {
  return fs
    .readdirSync(SPECS_DIR)
    .filter((file) => file.endsWith(".js"))
    .sort();
}

function main() {
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const files = requested.length
    ? requested.map((slug) => (slug.endsWith(".js") ? slug : `${slug}.js`))
    : listSpecs();
  let failed = 0;
  for (const file of files) {
    const full = path.join(SPECS_DIR, file);
    if (!fs.existsSync(full)) {
      console.error(`x ${file}: spec not found`);
      failed += 1;
      continue;
    }
    try {
      delete require.cache[require.resolve(full)];
      const spec = require(full);
      const pkg = buildPackage(spec);
      const target = path.join(TEMPLATES_DIR, spec.slug);
      writePackage(target, pkg);
      console.log(
        `+ ${spec.slug}: ${pkg.manifest.counts.tables} tables, ${pkg.manifest.counts.queries} queries, ` +
          `${pkg.manifest.counts.pages} pages, ${pkg.manifest.counts.workflows} workflows, ` +
          `${pkg.manifest.counts.listeners} listeners, ${pkg.manifest.counts.cronJobs} cron, ` +
          `${pkg.manifest.counts.roles} roles, ${pkg.files.length} files`
      );
    } catch (error) {
      console.error(`x ${file}: ${error.stack || error.message}`);
      failed += 1;
    }
  }
  if (failed) process.exitCode = 1;
}

main();
