var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  BLOCKED_PATH_SEGMENTS: () => BLOCKED_PATH_SEGMENTS,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE: () => MUSTACHE_ONLY_TEMPLATE_MESSAGE,
  TEMPLATE_BLOCK_REGEX: () => TEMPLATE_BLOCK_REGEX,
  WHOLE_TEMPLATE_REGEX: () => WHOLE_TEMPLATE_REGEX,
  collectTemplateViolations: () => collectTemplateViolations,
  extractTemplateBlocks: () => extractTemplateBlocks,
  extractWholeTemplateExpression: () => extractWholeTemplateExpression,
  getValueByPath: () => getValueByPath,
  hasMissingTemplateBraces: () => hasMissingTemplateBraces,
  normalizePath: () => normalizePath,
  resolveTemplate: () => resolveTemplate,
  tokenizeObjectPath: () => tokenizeObjectPath
});
module.exports = __toCommonJS(index_exports);

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
//# sourceMappingURL=index.cjs.map
