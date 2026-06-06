/**
 * js-template-resolver.js — `js-template` mode implementation.
 *
 * Frontend Mustache-JS hybrid: expressions inside {{ }} are evaluated as
 * JavaScript in a strictly scoped `new Function()` sandbox.
 *
 * Used for:
 *   • App Pages / Widget UI configs
 *   • Any template input where power-user expressions are expected
 *
 * Supported:
 *   {{JSON.stringify(state.queries.data)}}
 *   {{items.length > 0 ? items[0].name : "none"}}
 *   {{Math.round(ctx.input.score * 100) / 100}}
 *   {{state.queries.data}}  ← still works (plain path resolved via JS)
 *
 * Blocked:
 *   {{fetch("/api")}}       — fetch is shadowed
 *   {{window.location}}     — window is shadowed
 *   {{eval("…")}}           — eval is shadowed
 *
 * Security model:
 *   Evaluation happens inside `new Function(...)`. Dangerous globals are
 *   shadowed by passing them as undefined parameters. Only an explicit
 *   allowlist (Math, JSON, Array, etc.) is exposed.
 *
 *   This is defence-in-depth against accidental misuse — NOT a hard
 *   security boundary. For true isolation, use `isolated-js` mode
 *   (backed by `isolated-vm` on the backend).
 *
 * Ported from packages/template-engine/src/js-resolver.js — canonical implementation.
 */

import { extractTemplateBlocks, extractWholeTemplateExpression } from "./parsers.js";
import { JsTemplateError } from "./errors.js";

// ─── Sandbox allowlist ────────────────────────────────────────────────────────

/**
 * Cycle-safe JSON stringifier for the sandbox.
 * Prevents "Converting circular structure to JSON" errors when users stringify
 * live state objects (e.g., {{JSON.stringify(state.queries)}}).
 */
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
 * @param {string} expression  The trimmed content of {{ }}
 * @returns {boolean}
 */
export function looksLikeJsExpression(expression) {
  if (!expression) return false;

  // Parentheses → function call or grouping
  if (expression.includes("(")) return true;

  // Ternary
  if (expression.includes("?")) return true;

  // Arithmetic / comparison / logical / nullish / spread / template literal
  if (/[+\-*/%<>=!&|^~`]/.test(expression)) return true;

  // Non-numeric bracket content  e.g. state[key]  or  items[idx]
  if (/\[[^\]]*[^0-9\][\s][^\]]*\]/.test(expression)) return true;

  return false;
}

// ─── LRU cache for compiled evaluators ────────────────────────────────────────

/** @type {Map<string, Function>} */
const _exprCache = new Map();
const _MAX_CACHE = 512;

/**
 * Compile and return a cached evaluator function for an expression.
 *
 * The generated function signature is:
 *   function(__scope, <blocked globals...>) { return <expression>; }
 *
 * We use `with (__scope.__ctx)` so that all context keys are available as
 * plain identifiers, matching what users expect.
 *
 * @param {string} expression
 * @returns {Function}
 */
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
    throw new JsTemplateError(
      `Syntax error in template expression: ${expression}`,
      expression,
      syntaxError
    );
  }

  // LRU eviction: drop oldest entry when cache is full
  if (_exprCache.size >= _MAX_CACHE) {
    const oldest = _exprCache.keys().next().value;
    _exprCache.delete(oldest);
  }
  _exprCache.set(expression, fn);
  return fn;
}

// ─── Core evaluator ──────────────────────────────────────────────────────────

/**
 * Evaluate a single JS expression string against a context object.
 *
 * @param {string} expression  Trimmed content of {{ }}
 * @param {object} ctx         The template context (state, variables, etc.)
 * @param {object} [options]
 * @param {boolean} [options.throwOnError=false]
 * @param {object}  [options.extraGlobals]  Additional safe values to inject
 * @returns {{ value: *, error: JsTemplateError|null }}
 */
export function evalJsExpression(expression, ctx, options = {}) {
  const { throwOnError = false, extraGlobals = {} } = options;

  const safeCtx = typeof ctx === "object" && ctx !== null ? ctx : {};

  const scope = {
    __safeGlobals: { ...SAFE_GLOBALS, ...extraGlobals },
    __ctx: safeCtx,
    // Also spread context at the top level so identifiers resolve
    // even without `with` in environments that strip it.
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

// ─── Value formatter ──────────────────────────────────────────────────────────

/**
 * Format a resolved value for inline string interpolation.
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
 * Behaviour:
 *   {{state.queries.data}}                    → path traversal via JS eval
 *   {{JSON.stringify(state.queries.data)}}    → JS evaluation
 *   Non-string values pass through unchanged
 *   Arrays and plain objects are recursed into
 *
 * @param {*}      template  String / array / plain-object / primitive
 * @param {object} ctx       Context data (state, vars, input, etc.)
 * @param {object} [options]
 * @param {boolean}  [options.preserveSingleExpressionType=false]
 * @param {boolean}  [options.throwOnError=false]
 * @param {Function} [options.inlineValueFormatter]
 * @param {object}   [options.extraGlobals]
 * @param {Array<JsTemplateError>} [options.errors]  Collect errors here
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

  // Process right-to-left using offsets so replacement doesn't shift later indices
  let result = template;
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
