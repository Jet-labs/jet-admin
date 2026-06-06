/**
 * intellisense.js — Context-aware autocomplete for {{ }} template inputs.
 *
 * Provides mode-aware completions:
 *
 *   safe-path:    ONLY object key suggestions (no JS built-ins)
 *   js-template:  Object keys + JS built-ins + member methods
 *   isolated-js:  Object keys + JS built-ins + member methods
 *
 * Three exported APIs cover every use-case:
 *
 *   getObjectSuggestions(stateTree)
 *     Path-only completions by walking the live state tree.
 *
 *   getMemberSuggestions(basePath, stateTree)
 *     Member completions for a resolved path (arrays → methods, etc.).
 *
 *   getJsSuggestions({ filter, stateTree, ... })
 *     Full JS-aware: object paths + built-ins + member completions.
 *
 *   getCompletions(cursorPosition, contextSchema, options)
 *     Mode-aware entry point that delegates to the correct API above.
 *
 * Every function returns the same Suggestion shape:
 *   { value, label, detail, type, category }
 *
 * Ported from packages/template-engine/src/suggestion-engine.js with
 * mode-aware routing added.
 */

import { MODES } from "./evaluator.js";

// ─── JS Built-in catalogs ────────────────────────────────────────────────────
// Mirrors the safe globals allowed by js-template-resolver.js's SAFE_GLOBALS.

export const JS_ARRAY_METHODS = [
  { label: ".length",      value: ".length",          detail: "Number of items",             type: "property", category: "array-member" },
  { label: ".filter()",    value: ".filter()",         detail: "Filter items by condition",   type: "method",   category: "array-member" },
  { label: ".map()",       value: ".map()",            detail: "Transform each item",         type: "method",   category: "array-member" },
  { label: ".find()",      value: ".find()",           detail: "Find first matching item",    type: "method",   category: "array-member" },
  { label: ".findIndex()", value: ".findIndex()",      detail: "Index of first match",        type: "method",   category: "array-member" },
  { label: ".some()",      value: ".some()",           detail: "True if any item matches",    type: "method",   category: "array-member" },
  { label: ".every()",     value: ".every()",          detail: "True if all items match",     type: "method",   category: "array-member" },
  { label: ".includes()",  value: ".includes()",       detail: "Check if value exists",       type: "method",   category: "array-member" },
  { label: ".reduce()",    value: ".reduce()",         detail: "Accumulate to single value",  type: "method",   category: "array-member" },
  { label: ".slice()",     value: ".slice()",          detail: "Sub-array by index range",    type: "method",   category: "array-member" },
  { label: ".flat()",      value: ".flat()",           detail: "Flatten nested arrays",       type: "method",   category: "array-member" },
  { label: ".join()",      value: '.join(", ")',       detail: "Join to string",              type: "method",   category: "array-member" },
  { label: ".sort()",      value: ".sort()",           detail: "Sort items",                  type: "method",   category: "array-member" },
  { label: ".reverse()",   value: ".reverse()",        detail: "Reverse items",               type: "method",   category: "array-member" },
  { label: "[0]",          value: "[0]",               detail: "First item",                  type: "property", category: "array-member" },
];

export const JS_STRING_METHODS = [
  { label: ".length",        value: ".length",           detail: "Character count",      type: "property", category: "string-member" },
  { label: ".toUpperCase()", value: ".toUpperCase()",    detail: "UPPERCASE",            type: "method",   category: "string-member" },
  { label: ".toLowerCase()", value: ".toLowerCase()",    detail: "lowercase",            type: "method",   category: "string-member" },
  { label: ".trim()",        value: ".trim()",            detail: "Remove whitespace",    type: "method",   category: "string-member" },
  { label: ".includes()",    value: ".includes()",        detail: "Check substring",      type: "method",   category: "string-member" },
  { label: ".replace()",     value: '.replace("", "")',   detail: "Replace substring",    type: "method",   category: "string-member" },
  { label: ".split()",       value: '.split(",")',         detail: "Split into array",     type: "method",   category: "string-member" },
  { label: ".slice()",       value: ".slice(0)",           detail: "Sub-string by index",  type: "method",   category: "string-member" },
  { label: ".padStart()",    value: ".padStart(2, '0')",  detail: "Left-pad string",      type: "method",   category: "string-member" },
  { label: ".startsWith()",  value: '.startsWith("")',   detail: "Check prefix",         type: "method",   category: "string-member" },
  { label: ".endsWith()",    value: '.endsWith("")',     detail: "Check suffix",         type: "method",   category: "string-member" },
];

export const JS_BUILTINS = [
  // JSON
  { label: "JSON.stringify()", value: "JSON.stringify()", detail: "Serialize to JSON string",    type: "method",   category: "json" },
  { label: "JSON.parse()",     value: "JSON.parse()",     detail: "Parse JSON string",           type: "method",   category: "json" },
  // Math
  { label: "Math.round()",     value: "Math.round()",     detail: "Round to nearest integer",    type: "method",   category: "math" },
  { label: "Math.floor()",     value: "Math.floor()",     detail: "Round down",                  type: "method",   category: "math" },
  { label: "Math.ceil()",      value: "Math.ceil()",      detail: "Round up",                    type: "method",   category: "math" },
  { label: "Math.abs()",       value: "Math.abs()",       detail: "Absolute value",              type: "method",   category: "math" },
  { label: "Math.max()",       value: "Math.max()",       detail: "Largest of values",           type: "method",   category: "math" },
  { label: "Math.min()",       value: "Math.min()",       detail: "Smallest of values",          type: "method",   category: "math" },
  { label: "Math.PI",          value: "Math.PI",          detail: "3.141592…",                   type: "property", category: "math" },
  // Object
  { label: "Object.keys()",    value: "Object.keys()",    detail: "Array of property names",     type: "method",   category: "object" },
  { label: "Object.values()",  value: "Object.values()",  detail: "Array of property values",    type: "method",   category: "object" },
  { label: "Object.entries()", value: "Object.entries()", detail: "Array of [key, value] pairs", type: "method",   category: "object" },
  // Type coercion
  { label: "parseInt()",       value: "parseInt()",       detail: "Parse string to integer",     type: "method",   category: "type" },
  { label: "parseFloat()",     value: "parseFloat()",     detail: "Parse string to float",       type: "method",   category: "type" },
  { label: "String()",         value: "String()",         detail: "Convert to string",           type: "method",   category: "type" },
  { label: "Number()",         value: "Number()",         detail: "Convert to number",           type: "method",   category: "type" },
  { label: "Boolean()",        value: "Boolean()",        detail: "Convert to boolean",          type: "method",   category: "type" },
  { label: "isNaN()",          value: "isNaN()",          detail: "Check if value is NaN",       type: "method",   category: "type" },
  // Operators / expression snippets
  { label: "? … : …",         value: " ? '' : ''",        detail: "Ternary expression",          type: "snippet",  category: "operator" },
  { label: "?? fallback",      value: " ?? ''",            detail: "Nullish coalescing",          type: "snippet",  category: "operator" },
  { label: "|| fallback",      value: " || ''",            detail: "Logical OR fallback",         type: "snippet",  category: "operator" },
];

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Infer a human-readable type label for a runtime value.
 *
 * @param {*} val
 * @returns {string}
 */
export function inferValueType(val) {
  if (val === null || val === undefined) return "null";
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      const keys = Object.keys(val[0]).slice(0, 3);
      return `Array[${val.length}] · { ${keys.join(", ")}${Object.keys(val[0]).length > 3 ? ", …" : ""} }`;
    }
    return `Array[${val.length}]`;
  }
  if (typeof val === "boolean") return `Boolean = ${val}`;
  if (typeof val === "number") return `Number = ${val}`;
  if (typeof val === "string") return `"${val.slice(0, 24)}${val.length > 24 ? "…" : ""}"`;
  if (typeof val === "object") {
    const keys = Object.keys(val);
    return `Object { ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", …" : ""} }`;
  }
  return typeof val;
}

/**
 * Resolve a dotted path against an object for suggestion resolution.
 *
 * @param {object} obj
 * @param {string} path
 * @returns {*}
 */
export function resolvePathInTree(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

// ─── API 1: Object-only suggestions (path traversal) ─────────────────────────

/**
 * Walk a live state tree and return path-based suggestions for every
 * reachable leaf and intermediate node. BFS, cycle-safe.
 *
 * @param {object} stateTree
 * @param {string} [prefix]
 * @param {number} [depth]
 * @param {number} [maxDepth]
 * @returns {Array<Suggestion>}
 */
export function getObjectSuggestions(stateTree, _prefix = "", _depth = 0, maxDepth = 6) {
  const results = [];
  if (!stateTree || typeof stateTree !== "object") return results;

  const MAX_ITEMS = 150;
  const seen = new WeakSet();

  const queue = [{ obj: stateTree, prefix: _prefix, depth: _depth }];

  while (queue.length > 0 && results.length < MAX_ITEMS) {
    const { obj, prefix, depth } = queue.shift();

    if (!obj || typeof obj !== "object" || depth > maxDepth) continue;
    if (seen.has(obj)) continue;
    seen.add(obj);

    for (const key of Object.keys(obj)) {
      if (results.length >= MAX_ITEMS) break;
      if (key.startsWith("__")) continue;

      const val = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const detail = inferValueType(val);

      if (val === null || val === undefined) {
        results.push({ value: fullPath, label: fullPath, detail: "null", type: "null", category: "live-state" });
      } else if (Array.isArray(val)) {
        results.push({ value: fullPath, label: fullPath, detail, type: "array", category: "live-state" });
        if (val.length > 0 && val[0] !== null && typeof val[0] === "object") {
          queue.push({ obj: val[0], prefix: `${fullPath}[0]`, depth: depth + 1 });
        }
      } else if (typeof val === "object") {
        results.push({ value: fullPath, label: fullPath, detail, type: "object", category: "live-state" });
        queue.push({ obj: val, prefix: fullPath, depth: depth + 1 });
      } else {
        results.push({ value: fullPath, label: fullPath, detail, type: typeof val, category: "live-state" });
      }
    }
  }
  return results;
}

// ─── API 2: Member suggestions for a specific resolved path ──────────────────

/**
 * Given a base path and a state tree, resolve the path and return
 * method/property completions appropriate for the resolved type.
 *
 * @param {string} basePath
 * @param {object} stateTree
 * @param {string} [memberPrefix]
 * @returns {Array<Suggestion>}
 */
export function getMemberSuggestions(basePath, stateTree, memberPrefix = "") {
  const resolved = resolvePathInTree(stateTree, basePath);
  if (resolved === undefined || resolved === null) return [];

  let members = [];

  if (Array.isArray(resolved)) {
    members = JS_ARRAY_METHODS.map((m) => ({
      ...m,
      value: `${basePath}${m.value}`,
      label: `${basePath}${m.label}`,
    }));
  } else if (typeof resolved === "string") {
    members = JS_STRING_METHODS.map((m) => ({
      ...m,
      value: `${basePath}${m.value}`,
      label: `${basePath}${m.label}`,
    }));
  } else if (typeof resolved === "object") {
    members = Object.keys(resolved).map((k) => ({
      label: `${basePath}.${k}`,
      value: `${basePath}.${k}`,
      detail: inferValueType(resolved[k]),
      type: "property",
      category: "object-member",
    }));
  }

  if (memberPrefix) {
    const lower = memberPrefix.toLowerCase();
    members = members.filter((m) => {
      const tail = (m.label || "").split(".").pop() || "";
      return tail.toLowerCase().startsWith(lower);
    });
  }

  return members;
}

// ─── API 3: Full JS-aware suggestions ────────────────────────────────────────

/**
 * The primary autocomplete API. Returns a ranked merge of:
 *   1. Member completions  (when filter ends with ".")
 *   2. Object path suggestions from the live tree
 *   3. JS built-ins (JSON, Math, Object, type coercions, snippets)
 *
 * @param {object}  [options]
 * @param {string}  [options.filter]
 * @param {object}  [options.stateTree]
 * @param {Array}   [options.baseSuggestions]
 * @param {boolean} [options.includeBuiltins]
 * @returns {Array<Suggestion>}
 */
export function getJsSuggestions({
  filter = "",
  stateTree = null,
  baseSuggestions = [],
  includeBuiltins = true,
} = {}) {
  const trimmedFilter = filter.trim();

  // ── Tier 1: Member completions triggered by a trailing "." ────────────────
  if (trimmedFilter.includes(".") && stateTree) {
    const dotMatch = trimmedFilter.match(/^([\w.[\]0-9"']+)\.(\w*)$/);
    if (dotMatch) {
      const basePath = dotMatch[1];
      const memberPrefix = dotMatch[2];

      const members = getMemberSuggestions(basePath, stateTree, memberPrefix);
      if (members.length > 0) {
        const builtins = includeBuiltins
          ? JS_BUILTINS.filter((b) =>
              !trimmedFilter || b.value.toLowerCase().includes(trimmedFilter.toLowerCase())
            )
          : [];
        return [...members, ...builtins];
      }
    }
  }

  // ── Tier 2: Object path suggestions from the live tree ───────────────────
  const objectSuggestions = stateTree ? getObjectSuggestions(stateTree) : [];

  // ── Tier 3: JS built-ins ─────────────────────────────────────────────────
  const builtins = includeBuiltins
    ? (trimmedFilter
        ? JS_BUILTINS.filter(
            (b) =>
              b.value.toLowerCase().includes(trimmedFilter.toLowerCase()) ||
              b.label.toLowerCase().includes(trimmedFilter.toLowerCase())
          )
        : JS_BUILTINS)
    : [];

  // Merge: schema-based first, then live tree, then builtins. Cap at 200.
  const merged = [];
  for (const s of baseSuggestions) { if (merged.length >= 200) break; merged.push(s); }
  for (const s of objectSuggestions) { if (merged.length >= 200) break; merged.push(s); }
  for (const s of builtins) { if (merged.length >= 200) break; merged.push(s); }
  return merged;
}

// ─── API 4: Mode-aware entry point ───────────────────────────────────────────

/**
 * Get completions based on the current mode and cursor context.
 *
 * In `safe-path` mode, ONLY object key suggestions are returned.
 * In `js-template` or `isolated-js` mode, object keys + JS built-ins +
 * member completions are returned.
 *
 * @param {object}  [options]
 * @param {string}  [options.filter]           Text typed inside {{ }}
 * @param {object}  [options.stateTree]        Live state tree
 * @param {string}  [options.mode]             Execution mode
 * @param {Array}   [options.baseSuggestions]   Pre-built schema-derived items
 * @returns {Array<Suggestion>}
 */
export function getCompletions({
  filter = "",
  stateTree = null,
  mode = MODES.SAFE_PATH,
  baseSuggestions = [],
} = {}) {
  if (mode === MODES.SAFE_PATH) {
    // Safe-path: only object keys, no JS built-ins or methods
    const objectSuggestions = stateTree ? getObjectSuggestions(stateTree) : [];
    const trimmedFilter = filter.trim().toLowerCase();

    const filtered = trimmedFilter
      ? [...baseSuggestions, ...objectSuggestions].filter(
          (s) => s.value.toLowerCase().includes(trimmedFilter)
        )
      : [...baseSuggestions, ...objectSuggestions];

    return filtered.slice(0, 200);
  }

  // js-template / isolated-js: full JS-aware suggestions
  return getJsSuggestions({
    filter,
    stateTree,
    baseSuggestions,
    includeBuiltins: true,
  });
}
