/**
 * dependency-extractor.js — Reactive dependency tracking.
 *
 * Extracts state paths referenced inside {{ }} template expressions so
 * the UI can re-render only when relevant data changes.
 *
 * Granularity: extracts 2-level deep paths relative to the root.
 *   "{{state.queries.get_users.data.length}}"  →  "queries.get_users"
 *   "{{state.variables.selectedId}}"           →  "variables.selectedId"
 *   "{{String(state.queries.q1.isLoading)}}"   →  "queries.q1"
 *
 * This matches the reactivity granularity needed: we track dependencies at
 * the namespace.key level (e.g. queries.get_users, variables.count), not at
 * the leaf level (data[0].name). Leaf-level tracking would cause excessive
 * re-renders.
 *
 * Uses the shared parsers for {{ }} extraction to stay in sync with the
 * evaluator's grammar.
 */

import { extractTemplateBlocks } from "./parsers.js";

// ─── Path extraction regex ────────────────────────────────────────────────────

/**
 * Matches `<root>.<namespace>.<key>` patterns inside expression text.
 * The root is configurable (default: "state") so the same extractor works
 * for backend templates with "ctx" root.
 *
 * Group 1: namespace (e.g. "queries")
 * Group 2: key       (e.g. "get_users")
 *
 * @param {string} root  The root identifier to match against
 * @returns {RegExp}
 */
function buildDependencyRegex(root) {
  // Escape the root for regex safety (in case it contains special chars)
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}\\.([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]+)`, "g");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract all dependency paths from a config value (string, array, or object).
 *
 * Walks recursively through the config, finds all {{ }} blocks, and extracts
 * every `<root>.<namespace>.<key>` reference to 2-level depth (root stripped).
 *
 * @param {*}      config       The configuration to scan (string / array / object)
 * @param {object} [options]
 * @param {string[]} [options.roots]  Root identifiers to track (default: ["state"])
 * @returns {string[]}  Deduplicated array of dependency paths (e.g. ["queries.get_users", "variables.count"])
 *
 * @example
 *   extractDependencies("{{state.queries.users.data.length}}")
 *   // → ["queries.users"]
 *
 * @example
 *   extractDependencies({
 *     label: "{{state.variables.name}}",
 *     visible: "{{state.queries.q1.isLoading || state.queries.q2.isLoading}}"
 *   })
 *   // → ["variables.name", "queries.q1", "queries.q2"]
 *
 * @example
 *   // Backend usage with ctx root:
 *   extractDependencies("{{ctx.input.userId}}", { roots: ["ctx"] })
 *   // → ["input.userId"]
 */
export function extractDependencies(config, options = {}) {
  const { roots = ["state"] } = options;
  const deps = new Set();

  // Pre-build regex patterns for each root
  const regexes = roots.map((root) => ({ root, regex: buildDependencyRegex(root) }));

  const walk = (value) => {
    if (typeof value === "string") {
      const blocks = extractTemplateBlocks(value);
      for (const block of blocks) {
        for (const { regex } of regexes) {
          // Reset lastIndex for global regex
          regex.lastIndex = 0;
          let match;
          while ((match = regex.exec(block.expression)) !== null) {
            deps.add(`${match[1]}.${match[2]}`);
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };

  walk(config);
  return [...deps];
}
