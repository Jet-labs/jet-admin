/**
 * js-resolver.js
 *
 * A JS-expression-aware template resolver that extends the existing path-only
 * resolver. Expressions inside {{ }} are evaluated inside a locked-down sandbox
 * instead of being treated as plain object paths.
 *
 * Supported:  {{JSON.stringify(state.queries.data)}}
 *             {{items.length > 0 ? items[0].name : "none"}}
 *             {{Math.round(ctx.input.score * 100) / 100}}
 *             {{state.queries.data}}           ← still works (pure path)
 *
 * NOT supported (throws / returns undefined):
 *             {{fetch("/api")}}
 *             {{window.location}}
 *             {{eval("...")}}
 *
 * Security model
 * ──────────────
 * Evaluation happens inside `new Function(...)`. By default `new Function` has
 * access to the global scope, so we shadow every known dangerous global with
 * undefined and only expose an explicit allowlist.
 *
 * This is NOT a hard security boundary (a determined attacker with code
 * execution can escape any JS sandbox). The goal is defence-in-depth against
 * accidental or low-sophistication misuse — the same threat model that Lodash
 * template, Handlebars helpers, and similar tools target.
 *
 * For a truly sandboxed eval you would run expressions in a Worker or a
 * separate vm.runInNewContext (Node.js). That is left as an upgrade path.
 */

import { extractTemplateBlocks, extractWholeTemplateExpression } from "./parsers.js";

// ─── Sandbox allowlist ────────────────────────────────────────────────────────

// Cycle-safe JSON stringifier for the sandbox.
// Prevents "Converting circular structure to JSON" errors when users stringify
// live state objects (e.g., {{JSON.stringify(state.queries)}}).
const safeStringify = (obj, replacer, space) => {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) return "[Circular]";
        cache.add(value);
      }
      return replacer ? replacer(key, value) : value;
    },
    space
  );
};

const SAFE_JSON = {
  parse: JSON.parse,
  stringify: safeStringify,
};

/**
 * Safe globals injected into every expression scope.
 * Anything NOT listed here is shadowed with undefined.
 */
const SAFE_GLOBALS = {
  // JSON
  JSON: SAFE_JSON,

  // Math
  Math,

  // Constructors that are safe to call
  Array,
  Object,
  String,
  Number,
  Boolean,
  Date,
  RegExp,
  Map,
  Set,
  Error,

  // Utilities
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
  encodeURI,
  decodeURI,

  // Explicitly undefined — belt-and-suspenders
  undefined,
  NaN,
  Infinity,
};

/**
 * Globals we want to shadow (set to undefined) in every sandbox call.
 * Enumerated explicitly so additions to the host environment don't
 * silently become available.
 */
const BLOCKED_GLOBALS = [
  "window",
  "document",
  "globalThis",
  "global",
  "self",
  "top",
  "parent",
  "frames",
  "location",
  "history",
  "navigator",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "crypto",
  "eval",
  "Function",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "importScripts",
  "require",
  "module",
  "exports",
  "__dirname",
  "__filename",
  "process",
  "Buffer",
];

// ─── Expression classifier ────────────────────────────────────────────────────

/**
 * Heuristic: does this expression look like it contains JS beyond a plain
 * property path?
 *
 * Plain paths:    ctx.input.name      state[0].value
 * JS expressions: JSON.stringify(x)  x > 0 ? "yes" : "no"  items.length
 *
 * The heuristic checks for any of:
 *   • parentheses  (function call)
 *   • operators    (ternary, comparison, arithmetic, logical, nullish, template)
 *   • bracket with non-numeric content inside (computed access via variable)
 *   • array/object literal syntax
 *
 * Plain numeric bracket access like state[0] is already handled by
 * getValueByPath, so we only treat bracket content as JS if it is non-numeric.
 *
 * @param {string} expression  The trimmed content of {{ }}
 * @returns {boolean}
 */
function looksLikeJsExpression(expression) {
  if (!expression) return false;

  // Parentheses → function call or grouping
  if (expression.includes("(")) return true;

  // Ternary
  if (expression.includes("?")) return true;

  // Arithmetic / comparison / logical / nullish / spread / template literal
  if (/[+\-*/%<>=!&|^~`]/.test(expression)) return true;

  // Non-numeric bracket content  e.g. state[key]  or  items[idx]
  // Numeric bracket like state[0] is fine either way; path handles it
  if (/\[[^\]]*[^0-9\][\s][^\]]*\]/.test(expression)) return true;

  return false;
}

// ─── Sandbox builder ──────────────────────────────────────────────────────────

/**
 * Compile and return a cached evaluator function for an expression.
 * We cache by expression string to avoid re-parsing identical templates on
 * every render cycle.
 *
 * The generated function signature is:
 *   function(__scope, <blocked globals...>) { return <expression>; }
 *
 * We destructure __scope in the function body so that all context keys are
 * available as plain identifiers, matching what users expect.
 *
 * @param {string} expression
 * @returns {Function}
 */
const _exprCache = new Map();
const _MAX_CACHE = 512; // prevent unbounded growth in long-running servers

function buildSandboxedEvaluator(expression) {
  if (_exprCache.has(expression)) return _exprCache.get(expression);

  // Shadow blocked globals by including them as parameter names (= undefined)
  const blockedParams = BLOCKED_GLOBALS.join(",");

  // Allowlist keys destructured from __scope
  const allowlistParams = Object.keys(SAFE_GLOBALS).join(",");

  const code = `
    return function __jetEval(__scope, ${blockedParams}) {
      var {${allowlistParams}} = __scope.__safeGlobals;
      with (__scope.__ctx) {
        return (${expression});
      }
    };
  `;

  let fn;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function(code)();
  } catch (syntaxError) {
    // Surface parse errors immediately so they're caught at call site
    throw new JsTemplateError(
      `Syntax error in template expression: ${expression}`,
      expression,
      syntaxError
    );
  }

  if (_exprCache.size >= _MAX_CACHE) {
    // Evict oldest entry (Map preserves insertion order)
    const oldest = _exprCache.keys().next().value;
    _exprCache.delete(oldest);
  }
  _exprCache.set(expression, fn);
  return fn;
}

// ─── Error type ──────────────────────────────────────────────────────────────

export class JsTemplateError extends Error {
  /**
   * @param {string} message
   * @param {string} expression  The {{ }} content that failed
   * @param {Error}  [cause]     Underlying JS error
   */
  constructor(message, expression, cause) {
    super(message);
    this.name = "JsTemplateError";
    this.expression = expression;
    if (cause) this.cause = cause;
  }
}

// ─── Core evaluator ──────────────────────────────────────────────────────────

/**
 * Evaluate a single expression string against a context object.
 *
 * @param {string} expression  Trimmed content of {{ }}
 * @param {object} ctx         The template context (state, variables, etc.)
 * @param {object} [options]
 * @param {boolean} [options.throwOnError=false]
 *   If true, rethrow evaluation errors.
 *   If false (default), return undefined on error (matches getValueByPath behaviour).
 * @param {object} [options.extraGlobals]
 *   Additional safe values to inject into the expression scope.
 *   Merged on top of SAFE_GLOBALS. Useful for per-datasource helpers.
 *
 * @returns {{ value: *, error: JsTemplateError|null }}
 */
export function evalJsExpression(expression, ctx, options = {}) {
  const { throwOnError = false, extraGlobals = {} } = options;

  // Build scope proxy: context keys available as bare identifiers
  // We use a Proxy so that bracket-access on undefined sub-paths
  // returns undefined instead of throwing, matching getValueByPath semantics.
  const safeCtx = typeof ctx === "object" && ctx !== null ? ctx : {};

  // We DO NOT use strict mode in the generated function because the `with`
  // statement is strictly forbidden in strict mode, and strict mode cascades
  // to all inner scopes. Furthermore, we use `eval` as a blocked parameter
  // name, which is also a SyntaxError in strict mode.

  const scope = {
    __safeGlobals: { ...SAFE_GLOBALS, ...extraGlobals },
    __ctx: safeCtx,
    // Also spread context at the top level so identifiers resolve
    // even without `with` in environments that strip it (e.g. bundlers with
    // strict mode transforms). Belt-and-suspenders.
    ...safeCtx,
  };

  // Call with one undefined per blocked global to shadow them
  const blockedArgs = new Array(BLOCKED_GLOBALS.length).fill(undefined);

  try {
    const evaluator = buildSandboxedEvaluator(expression);
    const value = evaluator(scope, ...blockedArgs);
    return { value, error: null };
  } catch (err) {
    const jsErr = err instanceof JsTemplateError
      ? err
      : new JsTemplateError(
          `Error evaluating {{${expression}}}: ${err.message}`,
          expression,
          err
        );

    if (throwOnError) throw jsErr;
    return { value: undefined, error: jsErr };
  }
}

// ─── String resolver ──────────────────────────────────────────────────────────

/**
 * Format a resolved value for inline string interpolation.
 * Mirrors the behaviour of the existing path resolver's formatter.
 *
 * @param {*} value
 * @param {object} options
 * @param {Function} [options.inlineValueFormatter]
 * @returns {string}
 */
function formatValue(value, options = {}) {
  if (options.inlineValueFormatter) return options.inlineValueFormatter(value);
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolve a template string (or nested object/array) containing {{ }}
 * expressions that may include arbitrary JS.
 *
 * Drop-in companion to `resolveTemplate`. You can use both in the same
 * codebase: use `resolveTemplate` for high-frequency, security-sensitive paths
 * (e.g. datasource query params) and `resolveJsTemplate` for display-layer
 * templates where power-user expressions are expected.
 *
 * Behaviour
 * ─────────
 * • {{state.queries.data}}             → path traversal (fast path)
 * • {{JSON.stringify(state.queries.data)}} → JS evaluation
 * • {{items.length}}                   → JS evaluation (. followed by identifier
 *                                         that looks like a property but `.length`
 *                                         is safe and returns a number)
 * • Non-string values (numbers, booleans, null) pass through unchanged.
 * • Arrays and plain objects are recursed into (same as resolveTemplate).
 *
 * @param {*}      template  String / array / plain-object / primitive
 * @param {object} ctx       Context data (state, vars, input, etc.)
 * @param {object} [options]
 * @param {boolean} [options.preserveSingleExpressionType=false]
 *   When the entire template is a single {{ }} block, return the raw value
 *   instead of stringifying it. Mirrors resolveTemplate's behaviour.
 * @param {boolean} [options.throwOnError=false]
 *   Propagate evaluation errors instead of substituting empty string.
 * @param {Function} [options.inlineValueFormatter]
 *   Custom formatter for interpolated values.
 * @param {object}  [options.extraGlobals]
 *   Additional identifiers available inside expressions.
 * @param {Array<JsTemplateError>} [options.errors]
 *   If provided, errors are collected here instead of being silently dropped
 *   (even when throwOnError is false).
 *
 * @returns {*}  Resolved value matching the shape of `template`
 */
export function resolveJsTemplate(template, ctx, options = {}) {
  if (typeof template === "string") {
    return resolveJsString(template, ctx, options);
  }

  if (Array.isArray(template)) {
    return template.map((item) => resolveJsTemplate(item, ctx, options));
  }

  // Plain object — recurse into values, preserve keys
  if (template !== null && typeof template === "object" &&
      Object.prototype.toString.call(template) === "[object Object]") {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, resolveJsTemplate(v, ctx, options)])
    );
  }

  // Number, boolean, null, undefined, class instances — pass through
  return template;
}

/**
 * Internal: resolve a single template string.
 */
function resolveJsString(template, ctx, options) {
  // ── Whole-expression fast path ────────────────────────────────────────────
  // If the entire string is a single {{ … }}, we can preserve the type
  // (e.g. return an array, not "[object Array]").
  const wholeMatch = extractWholeTemplateExpression(template);
  if (wholeMatch) {
    const { value, error } = evalJsExpression(wholeMatch.expression, ctx, options);
    collectError(error, options);
    if (options.preserveSingleExpressionType) return value;
    return formatValue(value, options);
  }

  // ── Multi-block interpolation ─────────────────────────────────────────────
  const blocks = extractTemplateBlocks(template);
  if (blocks.length === 0) return template;

  // Replace each {{ }} in order. We walk from the end to preserve offsets,
  // which also fixes the duplicate-expression bug present in the original
  // resolver (replace() only hits the first occurrence).
  let result = template;
  // Process right-to-left using offsets so replacement doesn't shift later indices
  const sortedBlocks = [...blocks].sort((a, b) => b.index - a.index);

  for (const block of sortedBlocks) {
    const { value, error } = evalJsExpression(block.expression, ctx, options);
    collectError(error, options);
    const str = formatValue(value, options);
    result = result.slice(0, block.index) + str + result.slice(block.index + block.fullMatch.length);
  }

  return result;
}

function collectError(error, options) {
  if (!error) return;
  if (options.errors && Array.isArray(options.errors)) {
    options.errors.push(error);
  }
}

// ─── Convenience re-export ────────────────────────────────────────────────────

export { looksLikeJsExpression };
