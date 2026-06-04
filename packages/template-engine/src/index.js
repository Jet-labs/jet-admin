// Parsers
export {
  TEMPLATE_BLOCK_REGEX,
  WHOLE_TEMPLATE_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} from "./parsers.js";

// Tokenizer
export {
  BLOCKED_PATH_SEGMENTS,
  normalizePath,
  tokenizeObjectPath,
  getValueByPath,
} from "./tokenizer.js";

// Resolver (path-only, safe for backend / security-sensitive paths)
export { resolveTemplate } from "./resolver.js";

// JS Resolver (expression-aware, for display-layer / widget configs)
export {
  resolveJsTemplate,
  evalJsExpression,
  looksLikeJsExpression,
  JsTemplateError,
} from "./js-resolver.js";

// Validator
export {
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
  hasMissingTemplateBraces,
  collectTemplateViolations,
} from "./validator.js";

// Suggestion Engine — single source of truth for all {{ }} autocomplete logic
export {
  // Catalogs (re-exported so consumers can extend or render their own UI)
  JS_BUILTINS,
  JS_ARRAY_METHODS,
  JS_STRING_METHODS,
  // Utilities
  inferValueType,
  resolvePathInTree,
  // APIs
  getObjectSuggestions,   // path-only, no JS built-ins
  getMemberSuggestions,   // member completions for a specific resolved path
  getJsSuggestions,       // full JS-aware: object paths + built-ins + member completions
} from "./suggestion-engine.js";
