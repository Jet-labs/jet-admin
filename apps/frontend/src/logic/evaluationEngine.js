/**
 * Expression Evaluation Engine
 *
 * Resolves mustache-style expressions like `{{ state.queries.get_users.data }}`
 * against a runtime state tree. This is the core of the reactive data
 * binding system, following the Retool/Appsmith pattern.
 *
 * All expressions MUST use the "state." prefix:
 *   {{ state.queries.get_users.data }}      ✅
 *   {{ state.variables.selectedUserID }}     ✅
 *   {{ queries.get_users.data }}             ❌ rejected
 *
 * The "state." prefix is stripped by the template engine's allowedRoots
 * mechanism before resolving against the state tree, mirroring how the
 * backend strips "ctx." for its own context.
 *
 * State tree shape (what expressions resolve against after "state." is stripped):
 * {
 *   queries: {
 *     get_users: { data: [...], isLoading: false, error: null },
 *   },
 *   workflows: {
 *     my_workflow: { data: {...}, isLoading: false, error: null },
 *   },
 *   widgets: {
 *     my_table: { selectedRow: {...}, selectedIndex: 0 },
 *   },
 *   variables: {
 *     selectedUserID: "...",
 *   },
 *   globals: {
 *     currentUser: { ... },
 *     tenantID: "...",
 *   }
 * }
 */

import {
  resolveTemplate,
  getValueByPath,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
  tokenizeObjectPath,
} from "@jet-admin/template-engine";

/** The namespace root for all appPage expressions */
const ALLOWED_ROOTS = ["state"];

/**
 * Safely resolve a dot-notated path against an object, enforcing the
 * "state." prefix via the shared template engine tokenizer.
 *
 * @param {object} obj - The root state tree object
 * @param {string} path - Dot-notated path like "state.queries.get_users.data[0].name"
 * @returns {*} The resolved value, or undefined if not found or path is invalid
 */
export const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return getValueByPath(obj, path, { allowedRoots: ALLOWED_ROOTS });
};

/**
 * Check if a string contains mustache expressions.
 *
 * @param {string} str
 * @returns {boolean}
 */
export const containsExpression = (str) => {
  if (typeof str !== "string") return false;
  return extractTemplateBlocks(str).length > 0;
};

/**
 * Evaluate a single expression string against the state tree.
 * The expression MUST start with "state." — bare paths are rejected.
 *
 * @param {string} expression - e.g. "state.queries.get_users.data"
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved value, or undefined for invalid/unresolved paths
 */
export const evaluateExpression = (expression, stateTree) => {
  if (!expression || !stateTree) return undefined;
  return getValueByPath(stateTree, expression.trim(), { allowedRoots: ALLOWED_ROOTS });
};

/**
 * Resolve a string value that may contain mustache expressions.
 * If the entire string is a single expression, returns the raw value (preserving type).
 * If the string contains mixed text + expressions, returns a string with substitutions.
 *
 * Delegates to the shared template engine's resolveTemplate with
 * allowedRoots: ["state"] and preserveSingleExpressionType: true.
 *
 * @param {string} value - The string to evaluate
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved value
 */
export const resolveValue = (value, stateTree) => {
  if (typeof value !== "string") return value;
  return resolveTemplate(value, stateTree, {
    allowedRoots: ALLOWED_ROOTS,
    preserveSingleExpressionType: true,
  });
};

/**
 * Deep-resolve all expressions in an object or array recursively.
 * Walks through all string values and resolves any mustache expressions.
 *
 * Delegates to the shared template engine's resolveTemplate which handles
 * recursive object/array traversal natively.
 *
 * @param {*} config - The configuration object/array/value to resolve
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved configuration with all expressions substituted
 */
export const resolveConfig = (config, stateTree) => {
  if (config === null || config === undefined) return config;
  return resolveTemplate(config, stateTree, {
    allowedRoots: ALLOWED_ROOTS,
    preserveSingleExpressionType: true,
  });
};

/**
 * Extract all expression paths from a config object.
 * Useful for dependency tracking — knowing which state paths
 * a widget depends on so we can re-render when they change.
 *
 * Only extracts dependencies from expressions using the "state." prefix.
 * Returns paths relative to the state tree (without the "state." prefix),
 * e.g. "queries.get_users" from "{{ state.queries.get_users.data }}".
 *
 * @param {*} config - The configuration to scan
 * @returns {string[]} Array of unique state paths referenced
 */
export const extractDependencies = (config) => {
  const deps = new Set();

  const walk = (value) => {
    if (typeof value === "string") {
      const blocks = extractTemplateBlocks(value);
      for (const block of blocks) {
        // Tokenize with no allowedRoots so we get all segments including "state"
        const tokens = tokenizeObjectPath(block.expression);
        if (!tokens || tokens.length < 3) continue;

        // Only process expressions that start with "state"
        if (tokens[0] !== "state") continue;

        // Extract the top-level dependency: namespace.key
        // e.g. tokens = ["state", "queries", "get_users", "data"]
        //   → dependency = "queries.get_users"
        deps.add(`${tokens[1]}.${tokens[2]}`);
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };

  walk(config);
  return [...deps];
};
