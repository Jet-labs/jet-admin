/**
 * suggestion-engine.js
 *
 * Centralised suggestion logic for {{ }} template expression inputs.
 *
 * Responsibility: given a runtime state tree and/or the text currently typed
 * inside a {{ }} block, produce a ranked list of completion items that editors
 * can display in a dropdown.
 *
 * Three exported APIs cover every known use-case in the project:
 *
 *   getObjectSuggestions(stateTree)
 *     ── Path-only completions derived by walking the live state tree.
 *     ── Use when you only want to expose what is in the data (no JS).
 *
 *   getJsSuggestions(filter?, stateTree?)
 *     ── Full JS-aware completions: object paths + JS built-ins + member
 *        completions (e.g. .filter(), .length) resolved against the tree.
 *     ── Use for generic template inputs that accept any expression.
 *
 *   getMemberSuggestions(basePath, stateTree)
 *     ── Completions for a specific resolved path (arrays → methods,
 *        objects → property keys, strings → string methods).
 *     ── Use when you already know what the prefix path resolves to.
 *
 * Every function returns the same Suggestion shape:
 *   { value, label, detail, type, category }
 *
 *   value     – the string inserted into the field (may or may not include {{ }})
 *   label     – human-readable display text (defaults to value)
 *   detail    – secondary line (type hint, description)
 *   type      – "property" | "method" | "snippet" | "variable" | "event" | "global" | "any" | …
 *   category  – grouping key: "state" | "live-state" | "json" | "math" | "object" |
 *               "type" | "operator" | "array-member" | "string-member" | "object-member"
 */

// ─── JS Built-in catalog ──────────────────────────────────────────────────────
// Mirrors the safe globals allowed by js-resolver.js's SAFE_GLOBALS.

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
 * Resolve a dotted path like "state.queries.users.data" against an object.
 * Supports bracket notation like "state.queries.users.data[0]".
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
 * reachable leaf and intermediate node.
 *
 * This is the pure "data binding" mode — no JS built-ins are included.
 * Use this when you want to show what's in the data without encouraging
 * arbitrary expressions (e.g. a key selector dropdown).
 *
 * @param {object} stateTree  - The live state tree. If wrapped as
 *                              `{ state: … }` the paths will be prefixed
 *                              with "state." so `{{ state.queries.X }}` works.
 * @param {string} [prefix]   - Path prefix for recursive calls.
 * @param {number} [depth]    - Current recursion depth (internal).
 * @param {number} [maxDepth] - Maximum depth to traverse (default 6).
 * @returns {Array<Suggestion>}
 */
export function getObjectSuggestions(stateTree, _prefix = "", _depth = 0, maxDepth = 6) {
  // Fully iterative BFS — no recursion, immune to stack overflow and circular refs.
  const results = [];
  if (!stateTree || typeof stateTree !== "object") return results;

  const MAX_ITEMS = 150;
  const seen = new WeakSet(); // cycle guard

  // Queue entries: { obj, prefix, depth }
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
        // Only inspect first row to expose its field shape — never iterate the whole array.
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
 * Given a base path (e.g. "state.queries.users.data") and a state tree,
 * resolve the path and return method/property completions appropriate for
 * the resolved type (array → array methods, string → string methods,
 * object → property keys).
 *
 * @param {string} basePath   - The expression typed so far (before the trailing ".")
 * @param {object} stateTree  - The live state tree to resolve against
 * @param {string} [memberPrefix] - Characters typed after the last "." for pre-filtering
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
      // Match on the tail of the label after the last "."
      const tail = (m.label || "").split(".").pop() || "";
      return tail.toLowerCase().startsWith(lower);
    });
  }

  return members;
}

// ─── API 3: Full JS-aware suggestions ────────────────────────────────────────

/**
 * The primary autocomplete API. Returns a ranked merge of:
 *
 *   1. Member completions  – when `filter` ends with "." (highest priority)
 *   2. Object path suggestions – from the live state tree
 *   3. JS built-ins        – JSON, Math, Object, type coercions, snippets
 *
 * Pass `baseSuggestions` to prepend schema-derived items (e.g. from page
 * config metadata like dataSources and variableDefinitions) that are not in
 * the live tree yet.
 *
 * @param {object}  [options]
 * @param {string}  [options.filter]           - Text typed inside {{ }} right now
 * @param {object}  [options.stateTree]        - Live state tree (wrapped as { state: … })
 * @param {Array}   [options.baseSuggestions]  - Pre-built suggestions to merge in (schema-based)
 * @param {boolean} [options.includeBuiltins]  - Whether to include JS built-ins (default true)
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
    // Match: "state.queries.users.data." or "state.queries.users.data.fi"
    const dotMatch = trimmedFilter.match(/^([\w.[\]0-9"']+)\.(\w*)$/);
    if (dotMatch) {
      const basePath = dotMatch[1];     // path before the last dot
      const memberPrefix = dotMatch[2]; // chars typed after the last dot

      const members = getMemberSuggestions(basePath, stateTree, memberPrefix);
      if (members.length > 0) {
        // Return member completions first, followed by builtins as fallback
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

  // Merge: schema-based first (most context-relevant), then live tree, then builtins.
  // Cap at 200 — the component already slices to 100 for display, but this avoids
  // building a massive intermediate array when the state tree is very large.
  const merged = [];
  for (const s of baseSuggestions) { if (merged.length >= 200) break; merged.push(s); }
  for (const s of objectSuggestions) { if (merged.length >= 200) break; merged.push(s); }
  for (const s of builtins) { if (merged.length >= 200) break; merged.push(s); }
  return merged;
}
