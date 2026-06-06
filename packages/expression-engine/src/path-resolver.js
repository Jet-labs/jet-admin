/**
 * path-resolver.js — `safe-path` mode implementation.
 *
 * Strict, path-only object traversal. NO JavaScript execution is allowed.
 * Used for:
 *   • Backend Query mapping   (root: ctx, args)
 *   • Workflow standard nodes  (root: ctx)
 *   • Listener event mapping   (root: event)
 *
 * Behaviour:
 *   "{{ctx.input.id}}"                → resolves to the value at ctx.input.id
 *   "Hello {{ctx.input.name}}!"       → "Hello Alice!"
 *   "{{ctx.input.items[0].name}}"     → resolves to items[0].name
 *   "{{ctx.input.id > 0 ? 'y' : 'n'}}" → returns undefined (JS not allowed)
 *
 * This module delegates to the shared tokenizer for path parsing and to
 * the shared parsers for {{ }} extraction — ensuring grammar consistency.
 *
 * Ported from packages/template-engine/src/resolver.js with mode-awareness.
 */

import { getValueByPath } from "./tokenizer.js";
import {
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} from "./parsers.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Resolve a single path expression against the target context.
 *
 * @param {object}   target
 * @param {string}   expression   Trimmed content of {{ }}
 * @param {object}   [options]
 * @param {string[]} [options.allowedRoots]
 * @returns {*}
 */
function resolveTemplatePath(target, expression, { allowedRoots = [] } = {}) {
  if (!expression) return undefined;
  return getValueByPath(target, expression, { allowedRoots });
}

// ─── Value formatting ─────────────────────────────────────────────────────────

function defaultInlineValueFormatter(value) {
  return value !== undefined && value !== null ? String(value) : "";
}

function formatInlineTemplateValue(value, options = {}) {
  const formatter = options.inlineValueFormatter || defaultInlineValueFormatter;
  return formatter(value);
}

// ─── String resolution ────────────────────────────────────────────────────────

/**
 * Resolve a single template string using path-only traversal.
 *
 * @param {string} template
 * @param {object} target
 * @param {object} options
 * @returns {*}
 */
function resolveStringTemplate(template, target, options = {}) {
  if (typeof template !== "string") return template;

  // Fast path: entire string is a single {{ expression }}
  const wholeExpression = extractWholeTemplateExpression(template);
  if (wholeExpression) {
    const value = resolveTemplatePath(target, wholeExpression.expression, options);
    return options.preserveSingleExpressionType
      ? value
      : formatInlineTemplateValue(value, options);
  }

  // Multi-block interpolation: "Hello {{ctx.name}}, you have {{ctx.count}} items"
  const blocks = extractTemplateBlocks(template);
  if (blocks.length === 0) return template;

  let result = template;
  for (const block of blocks) {
    const value = resolveTemplatePath(target, block.expression, options);
    result = result.replace(block.fullMatch, formatInlineTemplateValue(value, options));
  }

  return result;
}

// ─── Recursive resolution ─────────────────────────────────────────────────────

/**
 * Resolve templates in strings, arrays, and plain objects recursively.
 * Non-string/non-container values pass through unchanged.
 *
 * @param {*}      template   String / Array / plain Object / primitive
 * @param {object} target     Context to resolve against
 * @param {object} [options]
 * @param {string[]} [options.allowedRoots]
 * @param {boolean}  [options.preserveSingleExpressionType]
 * @param {Function} [options.inlineValueFormatter]
 * @returns {*}  Resolved value matching the shape of `template`
 */
export function resolvePathTemplate(template, target, options = {}) {
  if (typeof template === "string") {
    return resolveStringTemplate(template, target, options);
  }

  if (Array.isArray(template)) {
    return template.map((value) => resolvePathTemplate(value, target, options));
  }

  if (isPlainObject(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [
        key,
        resolvePathTemplate(value, target, options),
      ])
    );
  }

  // Number, boolean, null, undefined — pass through
  return template;
}
