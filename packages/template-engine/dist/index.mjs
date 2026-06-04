// src/parsers.js
var TEMPLATE_BLOCK_REGEX = /\{\{([\s\S]+?)\}\}/g;
var WHOLE_TEMPLATE_REGEX = /^\{\{([\s\S]+?)\}\}$/;
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function extractTemplateBlocks(template) {
  if (template === null || template === void 0 || template === "") return [];
  if (Array.isArray(template)) {
    return template.flatMap(extractTemplateBlocks);
  }
  if (isPlainObject(template)) {
    return Object.values(template).flatMap(extractTemplateBlocks);
  }
  if (typeof template !== "string") {
    return [];
  }
  const regex = new RegExp(TEMPLATE_BLOCK_REGEX);
  let match;
  const matches = [];
  while ((match = regex.exec(template)) !== null) {
    matches.push({
      fullMatch: match[0],
      expression: match[1].trim(),
      index: match.index
    });
  }
  return matches;
}
function extractWholeTemplateExpression(template) {
  if (typeof template !== "string") return null;
  const match = template.match(WHOLE_TEMPLATE_REGEX);
  if (!match) return null;
  return {
    fullMatch: match[0],
    expression: match[1].trim(),
    index: 0
  };
}

// src/tokenizer.js
var BLOCKED_PATH_SEGMENTS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function normalizePath(path, allowedRoots = []) {
  if (typeof path !== "string") return "";
  let cleanPath = path.trim().replace(/\?\./g, ".");
  while (cleanPath.startsWith(".")) {
    cleanPath = cleanPath.slice(1);
  }
  if (allowedRoots.length > 0) {
    for (const root of allowedRoots) {
      if (cleanPath === root) return "";
      if (cleanPath.startsWith(`${root}.`)) return cleanPath.slice(root.length + 1);
      if (cleanPath.startsWith(`${root}[`)) return cleanPath.slice(root.length);
    }
    return null;
  }
  return cleanPath;
}
function readBracketToken(path, startIndex) {
  let cursor = startIndex + 1;
  while (cursor < path.length && path[cursor] === " ") cursor += 1;
  if (cursor >= path.length) return null;
  const quote = path[cursor];
  if (quote === '"' || quote === "'") {
    cursor += 1;
    const valueStart = cursor;
    while (cursor < path.length) {
      if (path[cursor] === quote && path[cursor - 1] !== "\\") break;
      cursor += 1;
    }
    if (cursor >= path.length) return null;
    const token2 = path.slice(valueStart, cursor);
    cursor += 1;
    while (cursor < path.length && path[cursor] === " ") cursor += 1;
    if (path[cursor] !== "]") return null;
    return { token: token2, nextIndex: cursor + 1 };
  }
  const endIndex = path.indexOf("]", cursor);
  if (endIndex === -1) return null;
  const token = path.slice(cursor, endIndex).trim();
  if (!/^(0|[1-9][0-9]*)$/.test(token)) return null;
  return {
    token: Number(token),
    nextIndex: endIndex + 1
  };
}
function tokenizeObjectPath(path, { allowedRoots = [] } = {}) {
  const cleanPath = normalizePath(path, allowedRoots);
  if (cleanPath === null) return null;
  if (!cleanPath) return [];
  const tokens = [];
  let cursor = 0;
  while (cursor < cleanPath.length) {
    const char = cleanPath[cursor];
    if (char === ".") {
      cursor += 1;
      continue;
    }
    if (char === "[") {
      const bracketToken = readBracketToken(cleanPath, cursor);
      if (!bracketToken) return null;
      tokens.push(bracketToken.token);
      cursor = bracketToken.nextIndex;
      continue;
    }
    const remainingPath = cleanPath.slice(cursor);
    const identifierMatch = remainingPath.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (!identifierMatch) return null;
    tokens.push(identifierMatch[0]);
    cursor += identifierMatch[0].length;
  }
  return tokens;
}
function getValueByPath(target, path, options = {}) {
  const tokens = tokenizeObjectPath(path, options);
  if (tokens === null) return void 0;
  let current = target;
  for (const token of tokens) {
    if (current === void 0 || current === null) return void 0;
    if (typeof token === "string" && BLOCKED_PATH_SEGMENTS.has(token)) {
      return void 0;
    }
    current = current[token];
  }
  return current;
}

// src/resolver.js
function isPlainObject2(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function resolveTemplatePath(target, expression, { allowedRoots = [] } = {}) {
  if (!expression) return void 0;
  return getValueByPath(target, expression, { allowedRoots });
}
function defaultInlineValueFormatter(value) {
  return value !== void 0 && value !== null ? String(value) : "";
}
function formatInlineTemplateValue(value, options = {}) {
  const formatter = options.inlineValueFormatter || defaultInlineValueFormatter;
  return formatter(value);
}
function resolveStringTemplateInternal(template, target, options = {}) {
  if (typeof template !== "string") return template;
  const wholeExpression = extractWholeTemplateExpression(template);
  if (wholeExpression) {
    const value = resolveTemplatePath(target, wholeExpression.expression, options);
    return options.preserveSingleExpressionType ? value : formatInlineTemplateValue(value, options);
  }
  const blocks = extractTemplateBlocks(template);
  if (blocks.length === 0) return template;
  let result = template;
  for (const block of blocks) {
    const value = resolveTemplatePath(target, block.expression, options);
    result = result.replace(block.fullMatch, formatInlineTemplateValue(value, options));
  }
  return result;
}
function resolveArrayTemplateInternal(template, target, options = {}, meta = {}) {
  return template.map((value) => resolveTemplate(value, target, options, meta));
}
function resolveObjectTemplateInternal(template, target, options = {}, meta = {}) {
  return Object.fromEntries(
    Object.entries(template).map(([key, value]) => [
      key,
      resolveTemplate(value, target, options, meta)
    ])
  );
}
function resolveTemplate(template, target, options = {}, meta = {}) {
  if (typeof template === "string") {
    return resolveStringTemplateInternal(template, target, options);
  }
  if (Array.isArray(template)) {
    return resolveArrayTemplateInternal(template, target, options, meta);
  }
  if (isPlainObject2(template)) {
    return resolveObjectTemplateInternal(template, target, options, meta);
  }
  return template;
}

// src/js-resolver.js
var safeStringify = (obj, replacer, space) => {
  const cache = /* @__PURE__ */ new Set();
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
var SAFE_JSON = {
  parse: JSON.parse,
  stringify: safeStringify
};
var SAFE_GLOBALS = {
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
  undefined: void 0,
  NaN: NaN,
  Infinity: Infinity
};
var BLOCKED_GLOBALS = [
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
  "Buffer"
];
function looksLikeJsExpression(expression) {
  if (!expression) return false;
  if (expression.includes("(")) return true;
  if (expression.includes("?")) return true;
  if (/[+\-*/%<>=!&|^~`]/.test(expression)) return true;
  if (/\[[^\]]*[^0-9\][\s][^\]]*\]/.test(expression)) return true;
  return false;
}
var _exprCache = /* @__PURE__ */ new Map();
var _MAX_CACHE = 512;
function buildSandboxedEvaluator(expression) {
  if (_exprCache.has(expression)) return _exprCache.get(expression);
  const blockedParams = BLOCKED_GLOBALS.join(",");
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
    fn = new Function(code)();
  } catch (syntaxError) {
    throw new JsTemplateError(
      `Syntax error in template expression: ${expression}`,
      expression,
      syntaxError
    );
  }
  if (_exprCache.size >= _MAX_CACHE) {
    const oldest = _exprCache.keys().next().value;
    _exprCache.delete(oldest);
  }
  _exprCache.set(expression, fn);
  return fn;
}
var JsTemplateError = class extends Error {
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
};
function evalJsExpression(expression, ctx, options = {}) {
  const { throwOnError = false, extraGlobals = {} } = options;
  const safeCtx = typeof ctx === "object" && ctx !== null ? ctx : {};
  const scope = {
    __safeGlobals: { ...SAFE_GLOBALS, ...extraGlobals },
    __ctx: safeCtx,
    // Also spread context at the top level so identifiers resolve
    // even without `with` in environments that strip it (e.g. bundlers with
    // strict mode transforms). Belt-and-suspenders.
    ...safeCtx
  };
  const blockedArgs = new Array(BLOCKED_GLOBALS.length).fill(void 0);
  try {
    const evaluator = buildSandboxedEvaluator(expression);
    const value = evaluator(scope, ...blockedArgs);
    return { value, error: null };
  } catch (err) {
    const jsErr = err instanceof JsTemplateError ? err : new JsTemplateError(
      `Error evaluating {{${expression}}}: ${err.message}`,
      expression,
      err
    );
    if (throwOnError) throw jsErr;
    return { value: void 0, error: jsErr };
  }
}
function formatValue(value, options = {}) {
  if (options.inlineValueFormatter) return options.inlineValueFormatter(value);
  if (value === void 0 || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function resolveJsTemplate(template, ctx, options = {}) {
  if (typeof template === "string") {
    return resolveJsString(template, ctx, options);
  }
  if (Array.isArray(template)) {
    return template.map((item) => resolveJsTemplate(item, ctx, options));
  }
  if (template !== null && typeof template === "object" && Object.prototype.toString.call(template) === "[object Object]") {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, resolveJsTemplate(v, ctx, options)])
    );
  }
  return template;
}
function resolveJsString(template, ctx, options) {
  const wholeMatch = extractWholeTemplateExpression(template);
  if (wholeMatch) {
    const { value, error } = evalJsExpression(wholeMatch.expression, ctx, options);
    collectError(error, options);
    if (options.preserveSingleExpressionType) return value;
    return formatValue(value, options);
  }
  const blocks = extractTemplateBlocks(template);
  if (blocks.length === 0) return template;
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

// src/validator.js
var MUSTACHE_ONLY_TEMPLATE_MESSAGE = "Use mustache syntax like {{ctx.input.customerID}} instead of a raw value path";
function isPlainObject3(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function hasMissingTemplateBraces(value, options = { allowedRoots: ["ctx"] }) {
  if (typeof value !== "string") return false;
  const trimmedValue = value.trim();
  if (!trimmedValue) return false;
  if (options.allowedRoots?.includes(trimmedValue)) return false;
  if (extractWholeTemplateExpression(trimmedValue)) return false;
  if (extractTemplateBlocks(trimmedValue).length > 0) return false;
  return tokenizeObjectPath(trimmedValue, options) !== null;
}
function collectTemplateViolations(value, path, issues = [], options = { allowedRoots: ["ctx"] }) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTemplateViolations(item, [...path, index], issues, options));
    return issues;
  }
  if (isPlainObject3(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      collectTemplateViolations(nestedValue, [...path, key], issues, options);
    });
    return issues;
  }
  if (hasMissingTemplateBraces(value, options)) {
    issues.push({
      path,
      message: MUSTACHE_ONLY_TEMPLATE_MESSAGE
    });
  }
  return issues;
}

// src/suggestion-engine.js
var JS_ARRAY_METHODS = [
  { label: ".length", value: ".length", detail: "Number of items", type: "property", category: "array-member" },
  { label: ".filter()", value: ".filter()", detail: "Filter items by condition", type: "method", category: "array-member" },
  { label: ".map()", value: ".map()", detail: "Transform each item", type: "method", category: "array-member" },
  { label: ".find()", value: ".find()", detail: "Find first matching item", type: "method", category: "array-member" },
  { label: ".findIndex()", value: ".findIndex()", detail: "Index of first match", type: "method", category: "array-member" },
  { label: ".some()", value: ".some()", detail: "True if any item matches", type: "method", category: "array-member" },
  { label: ".every()", value: ".every()", detail: "True if all items match", type: "method", category: "array-member" },
  { label: ".includes()", value: ".includes()", detail: "Check if value exists", type: "method", category: "array-member" },
  { label: ".reduce()", value: ".reduce()", detail: "Accumulate to single value", type: "method", category: "array-member" },
  { label: ".slice()", value: ".slice()", detail: "Sub-array by index range", type: "method", category: "array-member" },
  { label: ".flat()", value: ".flat()", detail: "Flatten nested arrays", type: "method", category: "array-member" },
  { label: ".join()", value: '.join(", ")', detail: "Join to string", type: "method", category: "array-member" },
  { label: ".sort()", value: ".sort()", detail: "Sort items", type: "method", category: "array-member" },
  { label: ".reverse()", value: ".reverse()", detail: "Reverse items", type: "method", category: "array-member" },
  { label: "[0]", value: "[0]", detail: "First item", type: "property", category: "array-member" }
];
var JS_STRING_METHODS = [
  { label: ".length", value: ".length", detail: "Character count", type: "property", category: "string-member" },
  { label: ".toUpperCase()", value: ".toUpperCase()", detail: "UPPERCASE", type: "method", category: "string-member" },
  { label: ".toLowerCase()", value: ".toLowerCase()", detail: "lowercase", type: "method", category: "string-member" },
  { label: ".trim()", value: ".trim()", detail: "Remove whitespace", type: "method", category: "string-member" },
  { label: ".includes()", value: ".includes()", detail: "Check substring", type: "method", category: "string-member" },
  { label: ".replace()", value: '.replace("", "")', detail: "Replace substring", type: "method", category: "string-member" },
  { label: ".split()", value: '.split(",")', detail: "Split into array", type: "method", category: "string-member" },
  { label: ".slice()", value: ".slice(0)", detail: "Sub-string by index", type: "method", category: "string-member" },
  { label: ".padStart()", value: ".padStart(2, '0')", detail: "Left-pad string", type: "method", category: "string-member" },
  { label: ".startsWith()", value: '.startsWith("")', detail: "Check prefix", type: "method", category: "string-member" },
  { label: ".endsWith()", value: '.endsWith("")', detail: "Check suffix", type: "method", category: "string-member" }
];
var JS_BUILTINS = [
  // JSON
  { label: "JSON.stringify()", value: "JSON.stringify()", detail: "Serialize to JSON string", type: "method", category: "json" },
  { label: "JSON.parse()", value: "JSON.parse()", detail: "Parse JSON string", type: "method", category: "json" },
  // Math
  { label: "Math.round()", value: "Math.round()", detail: "Round to nearest integer", type: "method", category: "math" },
  { label: "Math.floor()", value: "Math.floor()", detail: "Round down", type: "method", category: "math" },
  { label: "Math.ceil()", value: "Math.ceil()", detail: "Round up", type: "method", category: "math" },
  { label: "Math.abs()", value: "Math.abs()", detail: "Absolute value", type: "method", category: "math" },
  { label: "Math.max()", value: "Math.max()", detail: "Largest of values", type: "method", category: "math" },
  { label: "Math.min()", value: "Math.min()", detail: "Smallest of values", type: "method", category: "math" },
  { label: "Math.PI", value: "Math.PI", detail: "3.141592\u2026", type: "property", category: "math" },
  // Object
  { label: "Object.keys()", value: "Object.keys()", detail: "Array of property names", type: "method", category: "object" },
  { label: "Object.values()", value: "Object.values()", detail: "Array of property values", type: "method", category: "object" },
  { label: "Object.entries()", value: "Object.entries()", detail: "Array of [key, value] pairs", type: "method", category: "object" },
  // Type coercion
  { label: "parseInt()", value: "parseInt()", detail: "Parse string to integer", type: "method", category: "type" },
  { label: "parseFloat()", value: "parseFloat()", detail: "Parse string to float", type: "method", category: "type" },
  { label: "String()", value: "String()", detail: "Convert to string", type: "method", category: "type" },
  { label: "Number()", value: "Number()", detail: "Convert to number", type: "method", category: "type" },
  { label: "Boolean()", value: "Boolean()", detail: "Convert to boolean", type: "method", category: "type" },
  { label: "isNaN()", value: "isNaN()", detail: "Check if value is NaN", type: "method", category: "type" },
  // Operators / expression snippets
  { label: "? \u2026 : \u2026", value: " ? '' : ''", detail: "Ternary expression", type: "snippet", category: "operator" },
  { label: "?? fallback", value: " ?? ''", detail: "Nullish coalescing", type: "snippet", category: "operator" },
  { label: "|| fallback", value: " || ''", detail: "Logical OR fallback", type: "snippet", category: "operator" }
];
function inferValueType(val) {
  if (val === null || val === void 0) return "null";
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      const keys = Object.keys(val[0]).slice(0, 3);
      return `Array[${val.length}] \xB7 { ${keys.join(", ")}${Object.keys(val[0]).length > 3 ? ", \u2026" : ""} }`;
    }
    return `Array[${val.length}]`;
  }
  if (typeof val === "boolean") return `Boolean = ${val}`;
  if (typeof val === "number") return `Number = ${val}`;
  if (typeof val === "string") return `"${val.slice(0, 24)}${val.length > 24 ? "\u2026" : ""}"`;
  if (typeof val === "object") {
    const keys = Object.keys(val);
    return `Object { ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", \u2026" : ""} }`;
  }
  return typeof val;
}
function resolvePathInTree(obj, path) {
  if (!obj || !path) return void 0;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === void 0 || typeof cur !== "object") return void 0;
    cur = cur[p];
  }
  return cur;
}
function getObjectSuggestions(stateTree, _prefix = "", _depth = 0, maxDepth = 6) {
  const results = [];
  if (!stateTree || typeof stateTree !== "object") return results;
  const MAX_ITEMS = 150;
  const seen = /* @__PURE__ */ new WeakSet();
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
      if (val === null || val === void 0) {
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
function getMemberSuggestions(basePath, stateTree, memberPrefix = "") {
  const resolved = resolvePathInTree(stateTree, basePath);
  if (resolved === void 0 || resolved === null) return [];
  let members = [];
  if (Array.isArray(resolved)) {
    members = JS_ARRAY_METHODS.map((m) => ({
      ...m,
      value: `${basePath}${m.value}`,
      label: `${basePath}${m.label}`
    }));
  } else if (typeof resolved === "string") {
    members = JS_STRING_METHODS.map((m) => ({
      ...m,
      value: `${basePath}${m.value}`,
      label: `${basePath}${m.label}`
    }));
  } else if (typeof resolved === "object") {
    members = Object.keys(resolved).map((k) => ({
      label: `${basePath}.${k}`,
      value: `${basePath}.${k}`,
      detail: inferValueType(resolved[k]),
      type: "property",
      category: "object-member"
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
function getJsSuggestions({
  filter = "",
  stateTree = null,
  baseSuggestions = [],
  includeBuiltins = true
} = {}) {
  const trimmedFilter = filter.trim();
  if (trimmedFilter.includes(".") && stateTree) {
    const dotMatch = trimmedFilter.match(/^([\w.[\]0-9"']+)\.(\w*)$/);
    if (dotMatch) {
      const basePath = dotMatch[1];
      const memberPrefix = dotMatch[2];
      const members = getMemberSuggestions(basePath, stateTree, memberPrefix);
      if (members.length > 0) {
        const builtins2 = includeBuiltins ? JS_BUILTINS.filter(
          (b) => !trimmedFilter || b.value.toLowerCase().includes(trimmedFilter.toLowerCase())
        ) : [];
        return [...members, ...builtins2];
      }
    }
  }
  const objectSuggestions = stateTree ? getObjectSuggestions(stateTree) : [];
  const builtins = includeBuiltins ? trimmedFilter ? JS_BUILTINS.filter(
    (b) => b.value.toLowerCase().includes(trimmedFilter.toLowerCase()) || b.label.toLowerCase().includes(trimmedFilter.toLowerCase())
  ) : JS_BUILTINS : [];
  const merged = [];
  for (const s of baseSuggestions) {
    if (merged.length >= 200) break;
    merged.push(s);
  }
  for (const s of objectSuggestions) {
    if (merged.length >= 200) break;
    merged.push(s);
  }
  for (const s of builtins) {
    if (merged.length >= 200) break;
    merged.push(s);
  }
  return merged;
}
export {
  BLOCKED_PATH_SEGMENTS,
  JS_ARRAY_METHODS,
  JS_BUILTINS,
  JS_STRING_METHODS,
  JsTemplateError,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
  TEMPLATE_BLOCK_REGEX,
  WHOLE_TEMPLATE_REGEX,
  collectTemplateViolations,
  evalJsExpression,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
  getJsSuggestions,
  getMemberSuggestions,
  getObjectSuggestions,
  getValueByPath,
  hasMissingTemplateBraces,
  inferValueType,
  looksLikeJsExpression,
  normalizePath,
  resolveJsTemplate,
  resolvePathInTree,
  resolveTemplate,
  tokenizeObjectPath
};
//# sourceMappingURL=index.mjs.map
