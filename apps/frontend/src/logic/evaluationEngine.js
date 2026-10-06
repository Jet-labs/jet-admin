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
  evaluate,
  MODES,
  getValueByPath,
  extractTemplateBlocks,
  extractDependencies as engineExtractDependencies,
} from "@jet-admin/expression-engine";

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
export const resolveValue = (value, stateTree, opts = {}) => {
  if (typeof value !== "string") return value;
  return evaluate(value, wrapStateContext(stateTree), {
    mode: MODES.JS_TEMPLATE,
    preserveSingleExpressionType: true,
    ...(opts.errors ? { errors: opts.errors } : {}),
    ...(opts.throwOnError !== undefined ? { throwOnError: opts.throwOnError } : {}),
    ...(opts.extraGlobals ? { extraGlobals: opts.extraGlobals } : {}),
  });
};

/**
 * Evaluate a layout-node visibility condition.
 *
 * Contract (industry standard):
 *   - empty/missing condition => visible (no gating)
 *   - valid expression => visible = !!rawValue
 *   - evaluation error (syntax, TypeError, sandbox) => hidden (fail-closed) + logged
 *   - truthy non-boolean (e.g. "false", [], {}) => visible but flagged for lint
 *   - missing {{ }} wrapper => flagged (bare JS is not evaluated as template)
 *
 * @param {string|null} condition - e.g. "{{ state.variables.dnsType === 'Domain' }}"
 * @param {object} stateTree - live state tree (unwrapped, without `state` key)
 * @param {object} [opts] - { nodeId?: string, silent?: boolean }
 * @returns {{ visible: boolean, rawValue: *, hasError: boolean, isEmpty: boolean, isNonBoolean: boolean, missingMustaches: boolean, errors: Array }}
 */
export const evaluateVisibilityCondition = (condition, stateTree, opts = {}) => {
  const empty = (v) => ({ visible: true, rawValue: undefined, hasError: false, isEmpty: true, isNonBoolean: false, missingMustaches: false, errors: [] });
  if (typeof condition !== "string" || !condition.trim()) return empty();
  if (!stateTree) return empty();

  const trimmed = condition.trim();
  const missingMustaches = !containsExpression(trimmed);

  const errors = [];
  let rawValue;
  try {
    rawValue = resolveValue(trimmed, stateTree, { errors });
  } catch (err) {
    errors.push(err);
  }

  if (errors.length > 0) {
    if (!opts.silent) {
      console.warn(
        `[visibility] condition error on node ${opts.nodeId || "<unknown>"}: ${trimmed}`,
        errors
      );
    }
    return { visible: false, rawValue: undefined, hasError: true, isEmpty: false, isNonBoolean: false, missingMustaches, errors };
  }

  const visible = !!rawValue;
  // Only flag truthy non-booleans — falsy non-booleans (0, '', null, undefined)
  // are expected hide cases, not authoring mistakes.
  const isNonBoolean = visible && typeof rawValue !== "boolean";

  if ((isNonBoolean || missingMustaches) && !opts.silent && visible) {
    console.warn(
      `[visibility] non-boolean truthy condition on node ${opts.nodeId || "<unknown>"}: ${trimmed} =>`,
      rawValue,
      missingMustaches ? "(missing {{ }}?)" : "(expected boolean)"
    );
  }

  return { visible, rawValue, hasError: false, isEmpty: false, isNonBoolean, missingMustaches, errors };
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
  return evaluate(config, wrapStateContext(stateTree), {
    mode: MODES.JS_TEMPLATE,
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
  return engineExtractDependencies(config, { roots: ALLOWED_ROOTS });
};
