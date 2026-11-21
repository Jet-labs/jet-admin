/**
 * Semantic signature for an app-page config.
 *
 * The editor normalizes a saved page at load time (V1 -> V2 layout migration,
 * fresh layout node IDs, balancing). Dirty tracking must ignore those
 * bookkeeping-only changes while still detecting real user edits: added or
 * removed widgets, changed spans, reordered layout nodes, data sources,
 * variables, or settings.
 */
import { migrateV1ToV2 } from "./layoutMigration.js";

const DEFAULT_NODE_SIZING = {
  row: "auto",
  container: "auto",
  widget: "fill",
  "z-stack": "fill",
};

function normalizeForComparison(value) {
  if (Array.isArray(value)) return value.map(normalizeForComparison);
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value).sort()) {
      // Editor bookkeeping, not user content.
      if (key === "id" || key === "_legacyLayouts" || key === "layouts") continue;
      result[key] = normalizeForComparison(value[key]);
    }
    // The Craft canvas materializes default sizing on mount. Treat the
    // default and an absent value as equivalent; an explicit non-default
    // sizing is a real edit and stays in the signature.
    if (
      result.type &&
      result.sizing !== undefined &&
      DEFAULT_NODE_SIZING[result.type] === result.sizing
    ) {
      delete result.sizing;
    }
    return result;
  }
  return value;
}

export function appPageConfigSignature(value) {
  const migrated = migrateV1ToV2(value || {});
  return JSON.stringify(normalizeForComparison(migrated));
}
