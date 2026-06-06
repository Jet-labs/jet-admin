/**
 * evaluator.js — Master mode router for the expression engine.
 *
 * This is the primary entry point for template evaluation. It inspects the
 * `mode` option and delegates to the correct resolver:
 *
 *   "safe-path"    → path-resolver.js   (strict path-only traversal)
 *   "js-template"  → js-template-resolver.js  (new Function sandbox)
 *   "isolated-js"  → NOT handled here   (backend consumers use isolated-vm directly)
 *
 * Default mode: "safe-path" — the most restrictive, safest option.
 *
 * Usage map:
 *   ┌─────────────────────────────────┬────────────┬──────────────────┐
 *   │ Consumer                        │ Mode       │ Root             │
 *   ├─────────────────────────────────┼────────────┼──────────────────┤
 *   │ Backend Query Engine            │ safe-path  │ ctx, args        │
 *   │ Workflow standard nodes         │ safe-path  │ ctx              │
 *   │ Listener event mapping          │ safe-path  │ event            │
 *   │ App Page / Widget UI configs    │ js-template│ state, event     │
 *   │ Workflow JS Nodes (backend)     │ isolated-js│ (handled by ivm) │
 *   │ Listener Transformer (backend)  │ isolated-js│ (handled by ivm) │
 *   └─────────────────────────────────┴────────────┴──────────────────┘
 */

import { resolvePathTemplate } from "./path-resolver.js";
import { resolveJsTemplate } from "./js-template-resolver.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MODES = /** @type {const} */ ({
  SAFE_PATH: "safe-path",
  JS_TEMPLATE: "js-template",
  ISOLATED_JS: "isolated-js",
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Evaluate a template (string, array, or object) against a context.
 *
 * This is the unified entry point — it routes to the correct resolver based
 * on the `mode` option.
 *
 * @param {*}      template   String / Array / plain Object / primitive
 * @param {object} context    The data context to resolve against
 * @param {object} [options]
 * @param {string}   [options.mode="safe-path"]  Execution mode
 * @param {string[]} [options.allowedRoots]      Required root prefixes
 * @param {boolean}  [options.preserveSingleExpressionType=true]
 *   When the entire template is a single {{ }} block, return the raw value
 *   (number, array, object) instead of stringifying. Default true.
 * @param {Function} [options.inlineValueFormatter]
 *   Custom formatter for interpolated values in mixed text+expression strings.
 * @param {boolean}  [options.throwOnError=false]
 *   Propagate evaluation errors instead of substituting empty string.
 * @param {object}   [options.extraGlobals]
 *   Additional identifiers available inside JS expressions (js-template only).
 * @param {Array}    [options.errors]
 *   If provided, evaluation errors are collected here.
 *
 * @returns {*}  Resolved value matching the shape of `template`
 *
 * @example
 *   // Backend Query Engine — safe-path mode
 *   evaluate("{{ctx.input.id}}", { input: { id: 42 } }, {
 *     mode: "safe-path",
 *     allowedRoots: ["ctx"],
 *   });
 *   // → 42
 *
 * @example
 *   // Frontend Widget UI — js-template mode
 *   evaluate("{{state.queries.users.data.length > 0 ? 'Yes' : 'No'}}", {
 *     state: { queries: { users: { data: [1, 2, 3] } } }
 *   }, {
 *     mode: "js-template",
 *     allowedRoots: ["state"],
 *   });
 *   // → "Yes"
 */
export function evaluate(template, context, options = {}) {
  const {
    mode = MODES.SAFE_PATH,
    preserveSingleExpressionType = true,
    ...restOptions
  } = options;

  const resolveOptions = {
    ...restOptions,
    preserveSingleExpressionType,
  };

  switch (mode) {
    case MODES.SAFE_PATH:
      return resolvePathTemplate(template, context, resolveOptions);

    case MODES.JS_TEMPLATE:
      return resolveJsTemplate(template, context, resolveOptions);

    case MODES.ISOLATED_JS:
      // isolated-js is not handled by this package — it requires
      // `isolated-vm` (a native C++ addon) which is only available
      // on the backend. Backend consumers should use their own
      // workflowVm.js / listenerTransformerVm.js wrappers.
      //
      // This mode entry exists for API completeness and to provide
      // a clear error message when misused.
      throw new Error(
        `Mode "${MODES.ISOLATED_JS}" is not handled by the expression engine. ` +
        `Use the backend's workflowVm or listenerTransformerVm for isolated JS execution.`
      );

    default:
      throw new Error(
        `Unknown expression engine mode: "${mode}". ` +
        `Valid modes are: ${Object.values(MODES).join(", ")}`
      );
  }
}
