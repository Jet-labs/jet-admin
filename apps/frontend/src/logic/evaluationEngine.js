/**
 * Expression Evaluation Engine
 *
 * Resolves mustache-style expressions like `{{ state.queries.get_users.data }}`
 * against a runtime state tree. This is the core of the reactive data
 * binding system, following the Retool/Appsmith pattern.
 *
 * Expressions support full JavaScript inside {{ }}:
 *   {{ state.queries.get_users.data }}                          ✅ path
 *   {{ state.variables.selectedUserID }}                        ✅ path
 *   {{ state.queries.users.data.length > 0 ? "yes" : "no" }}   ✅ JS expression
 *   {{ JSON.stringify(state.queries.users.data) }}              ✅ JS helper
 *   {{ Math.round(state.widgets.mySlider.value * 100) / 100 }} ✅ JS arithmetic
 *   {{ queries.get_users.data }}                                ❌ missing state. prefix
 *
 * The `state` namespace is exposed as a top-level identifier inside every
 * expression so the `{{ state.X }}` convention works naturally in both
 * plain-path and JS-expression contexts.
 *
 * State tree shape:
 * {
 *   queries:   { alias: { data, isLoading, error } },
 *   workflows: { alias: { data, isLoading, error } },
 *   widgets:   { widgetID: { selectedRow, ... } },
 *   variables: { key: value },
 *   globals:   { currentUser, tenantID, ... },
 * }
 */

import {
  resolveJsTemplate,
  getValueByPath,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
  tokenizeObjectPath,
} from "@jet-admin/template-engine";

/**
 * The namespace root for all appPage expressions.
 * Used by the legacy path resolver (resolvePath / evaluateExpression) and
 * by extractDependencies for reactive dep tracking.
 */
const ALLOWED_ROOTS = ["state"];

/**
 * Wrap a stateTree so that {{ state.X }} expressions resolve correctly
 * inside the JS sandbox (which uses bare identifier lookup via `with`).
 *
 * @param {object} stateTree
 * @returns {{ state: object }}
 */
const wrapStateContext = (stateTree) => {
  if (!stateTree) return { state: {} };
  const { event, ...restState } = stateTree;
  return {
    state: restState,
    ...(event !== undefined ? { event } : {})
  };
};

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
 * Uses the legacy path resolver (no JS evaluation).
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
 * Supports full JavaScript expressions inside {{ }} in addition to plain paths.
 *
 * If the entire string is a single expression, returns the raw value (preserving type).
 * If the string contains mixed text + expressions, returns a string with substitutions.
 *
 * @param {string} value - The string to evaluate
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved value
 *
 * @example
 *   resolveValue("{{ state.queries.users.data }}", stateTree)           // → array
 *   resolveValue("{{ state.queries.users.data.length }}", stateTree)    // → number
 *   resolveValue("Hello {{ state.variables.name }}!", stateTree)        // → "Hello Alice!"
 *   resolveValue("{{ state.queries.users.data.length > 0 ? state.queries.users.data[0].name : 'none' }}", stateTree)
 */
export const resolveValue = (value, stateTree) => {
  if (typeof value !== "string") return value;
  return resolveJsTemplate(value, wrapStateContext(stateTree), {
    preserveSingleExpressionType: true,
  });
};

/**
 * Deep-resolve all expressions in an object or array recursively.
 * Walks through all string values and resolves any mustache expressions,
 * including full JavaScript expressions.
 *
 * @param {*} config - The configuration object/array/value to resolve
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved configuration with all expressions substituted
 */
export const resolveConfig = (config, stateTree) => {
  if (config === null || config === undefined) return config;
  return resolveJsTemplate(config, wrapStateContext(stateTree), {
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
        // Find all occurrences of "state.namespace.key" anywhere in the JS expression
        // e.g. from "String(state.queries.query_5.isLoading)" we extract "queries.query_5"
        const matches = block.expression.matchAll(/state\.([A-Za-z0-9_$]+)\.([A-Za-z0-9_$]+)/g);
        for (const match of matches) {
          deps.add(`${match[1]}.${match[2]}`);
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
};
