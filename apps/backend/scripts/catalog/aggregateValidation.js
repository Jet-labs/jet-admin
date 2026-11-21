/**
 * Aggregate DeepSeek V4.1 Flash per-item validation results into a single
 * report and fail (non-zero exit) if coverage is incomplete or any item fails.
 */
const fs = require("fs");
const path = require("path");
const { buildCatalog } = require("./marketplaceCatalog");

const ROOT = path.join(__dirname, "..", "..", "..", "..");
const REPORT_DIR = path.join(ROOT, "reports", "marketplace-validation");

function aggregate() {
  const catalog = buildCatalog();
  const expectedSlugs = new Set(catalog.map((i) => i.slug));
  const manifest = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, "manifest.json"), "utf8"));

  const results = [];
  const missingBatches = [];
  for (const batch of manifest.batches) {
    const resultPath = path.join(ROOT, batch.outputPath);
    if (!fs.existsSync(resultPath)) {
      missingBatches.push(batch.id);
      continue;
    }
    const parsed = JSON.parse(fs.readFileSync(resultPath, "utf8"));
    const rows = Array.isArray(parsed) ? parsed : parsed.results || [];
    for (const row of rows) results.push(row);
  }

  const bySlug = new Map(results.map((r) => [r.slug, r]));
  const unvalidated = [...expectedSlugs].filter((slug) => !bySlug.has(slug));
  const failed = results.filter((r) => r.pass !== true);
  const unexpected = results.filter((r) => !expectedSlugs.has(r.slug)).map((r) => r.slug);

  const report = {
    model: manifest.model,
    reviewKind: "static-definition-review",
    provesRuntimeOrManualTesting: false,
    generatedAt: new Date().toISOString(),
    expectedItems: expectedSlugs.size,
    validatedItems: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    missingBatches,
    unvalidated,
    unexpected,
    failures: failed,
  };

  fs.writeFileSync(path.join(REPORT_DIR, "aggregate.json"), JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) {
  const report = aggregate();
  console.log(
    `Validated ${report.validatedItems}/${report.expectedItems}; passed=${report.passed} failed=${report.failed}`
  );
  if (report.missingBatches.length || report.unvalidated.length || report.failed) {
    process.exitCode = 1;
  }
}

module.exports = { aggregate };
