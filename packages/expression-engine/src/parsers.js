/**
 * parsers.js — Single source of truth for {{ }} template grammar.
 *
 * These regex patterns and extraction functions are shared by every module
 * in the engine (evaluator, dependency-extractor, validator) to prevent
 * grammar drift.
 *
 * Ported from packages/template-engine/src/parsers.js — the canonical
 * implementation that was previously duplicated in the backend.
 */

// ─── Grammar constants ───────────────────────────────────────────────────────

/** Matches every `{{ … }}` block in a string (global, multi-match). */
export const TEMPLATE_BLOCK_REGEX = /\{\{([\s\S]+?)\}\}/g;

/** Matches a string that is exactly ONE `{{ … }}` block with nothing outside. */
export const WHOLE_TEMPLATE_REGEX = /^\{\{([\s\S]+?)\}\}$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

// ─── Extraction APIs ──────────────────────────────────────────────────────────

/**
 * Extract all `{{ … }}` blocks from a template.
 * Accepts strings, arrays (flattened), and plain objects (values flattened).
 *
 * @param {string|Array|object} template
 * @returns {Array<{ fullMatch: string, expression: string, index: number }>}
 */
export function extractTemplateBlocks(template) {
  if (template === null || template === undefined || template === "") return [];

  if (Array.isArray(template)) {
    return template.flatMap(extractTemplateBlocks);
  }

  if (isPlainObject(template)) {
    return Object.values(template).flatMap(extractTemplateBlocks);
  }

  if (typeof template !== "string") {
    return [];
  }

  // Fresh regex instance — TEMPLATE_BLOCK_REGEX has the `g` flag so
  // .exec() is stateful; we must create a new instance per call.
  const regex = new RegExp(TEMPLATE_BLOCK_REGEX);
  let match;
  const matches = [];

  while ((match = regex.exec(template)) !== null) {
    matches.push({
      fullMatch: match[0],
      expression: match[1].trim(),
      index: match.index,
    });
  }

  return matches;
}

/**
 * If the entire string is exactly one `{{ … }}` expression (with optional
 * surrounding whitespace inside), return its content. Otherwise return null.
 *
 * Used for the type-preserving fast path: `"{{args.limit}}"` → Number,
 * not the string `"42"`.
 *
 * @param {string} template
 * @returns {{ fullMatch: string, expression: string, index: number } | null}
 */
export function extractWholeTemplateExpression(template) {
  if (typeof template !== "string") return null;

  const match = template.match(WHOLE_TEMPLATE_REGEX);
  if (!match) return null;

  return {
    fullMatch: match[0],
    expression: match[1].trim(),
    index: 0,
  };
}
