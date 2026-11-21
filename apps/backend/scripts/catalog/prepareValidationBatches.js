/**
 * Prepare LEGACY STATIC-REVIEW batches, not manual or runtime validation.
 *
 * Splits the deterministic catalog into JSON batch files that are handed to
 * DeepSeek V4.1 Flash subagents for individual item review.
 */
const fs = require("fs");
const path = require("path");
const { buildCatalog } = require("./marketplaceCatalog");

const BATCH_SIZE = 25;
const REPORT_DIR = path.join(__dirname, "..", "..", "..", "..", "reports", "marketplace-validation");
const BATCH_DIR = path.join(REPORT_DIR, "batches");

function prepare() {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  const catalog = buildCatalog();
  const batches = [];
  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    batches.push(catalog.slice(i, i + BATCH_SIZE));
  }

  // Clear stale batch files so the run is reproducible.
  for (const file of fs.readdirSync(BATCH_DIR)) {
    if (file.endsWith(".json")) fs.unlinkSync(path.join(BATCH_DIR, file));
  }

  const manifest = {
    catalogVersion: "marketplace-v1",
    reviewKind: "static-definition-review",
    provesRuntimeOrManualTesting: false,
    model: "opencode-go/deepseek-v4.1-flash",
    batchSize: BATCH_SIZE,
    totalItems: catalog.length,
    batchCount: batches.length,
    batches: [],
  };

  batches.forEach((batch, index) => {
    const id = String(index + 1).padStart(2, "0");
    const inputPath = path.join(BATCH_DIR, `batch-${id}-items.json`);
    const outputPath = path.join(BATCH_DIR, `batch-${id}-results.json`);
    fs.writeFileSync(inputPath, JSON.stringify(batch, null, 2));
    manifest.batches.push({
      id,
      inputPath: path.relative(path.join(__dirname, "..", "..", "..", ".."), inputPath).replace(/\\/g, "/"),
      outputPath: path.relative(path.join(__dirname, "..", "..", "..", ".."), outputPath).replace(/\\/g, "/"),
      slugs: batch.map((i) => i.slug),
    });
  });

  fs.writeFileSync(path.join(REPORT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

if (require.main === module) {
  const manifest = prepare();
  console.log(
    `Prepared ${manifest.batchCount} batches for ${manifest.totalItems} items in reports/marketplace-validation/`
  );
}

module.exports = { prepare, BATCH_SIZE };
