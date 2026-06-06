/**
 * validator.js — Pre-flight template validation.
 *
 * Provides two levels of validation:
 *
 * 1. `validateTemplate(template, mode)` — Mode-aware validation.
 *    In `safe-path` mode, detects and rejects JS syntax inside {{ }}.
 *    In `js-template` mode, only checks for malformed braces.
 *
 * 2. `hasMissingTemplateBraces(value, options)` — Detects values that look
 *    like object paths but are missing {{ }} wrapping.
 *
 * 3. `collectTemplateViolations(value, path, issues, options)` — Recursively
 *    walk a config object and collect all brace-missing violations.
 *
 * Ported from packages/template-engine/src/validator.js with mode-aware additions.
 */

import { tokenizeObjectPath } from "./tokenizer.js";
import {
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} from "./parsers.js";
import { TemplateSyntaxError, SecurityViolationError } from "./errors.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MUSTACHE_ONLY_TEMPLATE_MESSAGE =
  "Use mustache syntax like {{ctx.input.customerID}} instead of a raw value path";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Regex that detects JS operators/syntax that should NOT appear in safe-path mode.
 * Checks for: ternary (?:), function calls (()), arithmetic/comparison/logical
 * operators, template literals, and common global prefixes like Math./JSON.
 */
const JS_SYNTAX_PATTERN = /[+\-*/%<>=!&|^~`?:()]|Math\.|JSON\.|Object\.|Array\.|String\.|Number\.|Boolean\.|Date\./;

/**
 * Check if an expression contains JS syntax (as opposed to a plain object path).
 *
 * @param {string} expression  Trimmed content from inside {{ }}
 * @returns {boolean}
 */
function containsJsSyntax(expression) {
  if (!expression) return false;
  return JS_SYNTAX_PATTERN.test(expression);
}

// ─── Mode-aware validation ────────────────────────────────────────────────────

/**
 * Validate a template string for correctness in the given mode.
 *
 * @param {string} template  The template string to validate
 * @param {string} mode      "safe-path" | "js-template" | "isolated-js"
 * @param {object} [options]
 * @param {string[]} [options.allowedRoots]  Required roots (e.g. ["ctx", "args"])
 * @returns {{ valid: boolean, errors: Array<TemplateSyntaxError|SecurityViolationError> }}
 */
export function validateTemplate(template, mode = "safe-path", options = {}) {
  const errors = [];

  if (typeof template !== "string") {
    return { valid: true, errors };
  }

  // ── Check for malformed braces ────────────────────────────────────────────
  const openCount = (template.match(/\{\{/g) || []).length;
  const closeCount = (template.match(/\}\}/g) || []).length;

  if (openCount !== closeCount) {
    errors.push(
      new TemplateSyntaxError(
        `Mismatched template braces: ${openCount} opening '{{' vs ${closeCount} closing '}}'`,
        template
      )
    );
    return { valid: false, errors };
  }

  // ── Extract blocks ────────────────────────────────────────────────────────
  const blocks = extractTemplateBlocks(template);

  // ── safe-path mode: reject JS syntax ──────────────────────────────────────
  if (mode === "safe-path") {
    for (const block of blocks) {
      if (containsJsSyntax(block.expression)) {
        errors.push(
          new SecurityViolationError(
            `JavaScript syntax is not allowed in safe-path mode: "${block.expression}"`,
            block.expression
          )
        );
      }
    }
  }

  // ── Validate allowed roots (all modes) ────────────────────────────────────
  if (options.allowedRoots && options.allowedRoots.length > 0) {
    for (const block of blocks) {
      // Extract the root identifier from the expression
      const rootMatch = block.expression.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/);
      if (rootMatch) {
        const root = rootMatch[1];
        if (!options.allowedRoots.includes(root)) {
          errors.push(
            new SecurityViolationError(
              `Expression root "${root}" is not in allowedRoots [${options.allowedRoots.join(", ")}]`,
              block.expression
            )
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Legacy APIs (backward compatible) ────────────────────────────────────────

/**
 * Detect a string that looks like an object path (e.g. `ctx.input.id`)
 * but is missing {{ }} wrapping.
 *
 * @param {string} value
 * @param {object} [options]
 * @param {string[]} [options.allowedRoots]
 * @returns {boolean}
 */
export function hasMissingTemplateBraces(value, options = { allowedRoots: ["ctx"] }) {
  if (typeof value !== "string") return false;

  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  // If it's literally just the root allowed string (like "ctx"), ignore.
  if (options.allowedRoots?.includes(trimmedValue)) return false;

  // If it matches exactly a template expression `{{something}}`, it's not missing braces.
  if (extractWholeTemplateExpression(trimmedValue)) return false;

  // If it has *any* template block `{{something}}`, it's not missing braces.
  if (extractTemplateBlocks(trimmedValue).length > 0) return false;

  // Otherwise, see if it is a valid object path starting with one of the allowed roots.
  return tokenizeObjectPath(trimmedValue, options) !== null;
}

/**
 * Recursively walk a config value and collect all "missing braces" violations.
 *
 * @param {*}        value
 * @param {Array}    path      Current path for error reporting
 * @param {Array}    [issues]  Accumulator
 * @param {object}   [options]
 * @param {string[]} [options.allowedRoots]
 * @returns {Array<{ path: Array, message: string }>}
 */
export function collectTemplateViolations(value, path, issues = [], options = { allowedRoots: ["ctx"] }) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTemplateViolations(item, [...path, index], issues, options));
    return issues;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      collectTemplateViolations(nestedValue, [...path, key], issues, options);
    });
    return issues;
  }

  // Check strings
  if (hasMissingTemplateBraces(value, options)) {
    issues.push({
      path,
      message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
    });
  }

  return issues;
}
