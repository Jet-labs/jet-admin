/**
 * @jet-admin/expression-engine
 *
 * Unified template expression engine for Jet Admin.
 * Replaces both `@jet-admin/template-engine` (frontend) and
 * `apps/backend/utils/templateEngine` (backend) with a single,
 * mode-aware package.
 *
 * Quick start:
 *
 *   // Backend Query Engine — safe path-only traversal
 *   import { evaluate } from "@jet-admin/expression-engine";
 *   evaluate("{{ctx.input.id}}", { input: { id: 42 } }, {
 *     mode: "safe-path",
 *     allowedRoots: ["ctx"],
 *   });
 *   // → 42
 *
 *   // Frontend Widget UI — JS expression evaluation
 *   import { evaluate } from "@jet-admin/expression-engine";
 *   evaluate("{{state.queries.users.data.length > 0 ? 'Yes' : 'No'}}", {
 *     state: { queries: { users: { data: [1, 2, 3] } } }
 *   }, {
 *     mode: "js-template",
 *     allowedRoots: ["state"],
 *   });
 *   // → "Yes"
 */

// ─── Evaluator (primary API) ─────────────────────────────────────────────────

export { evaluate, MODES } from "./evaluator.js";

// ─── Parsers (shared grammar) ────────────────────────────────────────────────

export {
  TEMPLATE_BLOCK_REGEX,
  WHOLE_TEMPLATE_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} from "./parsers.js";

// ─── Tokenizer (path parsing) ────────────────────────────────────────────────

export {
  BLOCKED_PATH_SEGMENTS,
  normalizePath,
  tokenizeObjectPath,
  getValueByPath,
} from "./tokenizer.js";

// ─── Path Resolver (safe-path mode) ──────────────────────────────────────────

export { resolvePathTemplate } from "./path-resolver.js";

// ─── JS Template Resolver (js-template mode) ────────────────────────────────

export {
  resolveJsTemplate,
  evalJsExpression,
  looksLikeJsExpression,
} from "./js-template-resolver.js";

// ─── Validator ───────────────────────────────────────────────────────────────

export {
  validateTemplate,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
  hasMissingTemplateBraces,
  collectTemplateViolations,
} from "./validator.js";

// ─── Dependency Extractor ────────────────────────────────────────────────────

export { extractDependencies } from "./dependency-extractor.js";

// ─── Intellisense ────────────────────────────────────────────────────────────

export {
  // Catalogs
  JS_BUILTINS,
  JS_ARRAY_METHODS,
  JS_STRING_METHODS,
  // Utilities
  inferValueType,
  resolvePathInTree,
  // APIs
  getObjectSuggestions,
  getMemberSuggestions,
  getJsSuggestions,
  getCompletions,
} from "./intellisense.js";

// ─── Error types ─────────────────────────────────────────────────────────────

export {
  ExpressionEngineError,
  TemplateSyntaxError,
  SecurityViolationError,
  SandboxTimeoutError,
  JsTemplateError,
} from "./errors.js";

// ─── Backward compatibility aliases ──────────────────────────────────────────
// These re-exports match the old @jet-admin/template-engine API so consumers
// can migrate incrementally by changing only the import path.

export { resolvePathTemplate as resolveTemplate } from "./path-resolver.js";
