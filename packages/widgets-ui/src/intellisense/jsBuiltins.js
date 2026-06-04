/**
 * jsBuiltins.js  (widgets-ui/intellisense)
 *
 * @deprecated  All builtin catalogs have moved to @jet-admin/template-engine.
 *              This file is a compatibility shim — import from there directly.
 *
 *   import { JS_BUILTINS, JS_ARRAY_METHODS, JS_STRING_METHODS } from "@jet-admin/template-engine";
 */

export {
  JS_BUILTINS       as ALL_TOP_LEVEL_BUILTINS,
  JS_ARRAY_METHODS  as ARRAY_METHODS,
  JS_ARRAY_METHODS  as ARRAY_MEMBER_COMPLETIONS,
  JS_STRING_METHODS as STRING_METHODS,
  JS_STRING_METHODS as STRING_MEMBER_COMPLETIONS,
} from "@jet-admin/template-engine";
