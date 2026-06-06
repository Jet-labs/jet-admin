/**
 * errors.js — Custom error types for the expression engine.
 *
 * Hierarchy:
 *   ExpressionEngineError (base)
 *   ├── TemplateSyntaxError   — malformed {{ }} or unparseable expression
 *   ├── SecurityViolationError — JS detected in safe-path mode, or blocked global access
 *   ├── SandboxTimeoutError   — isolated-js execution exceeded time limit
 *   └── JsTemplateError       — runtime JS evaluation failure inside {{ }}
 */

/**
 * Base error for all expression-engine failures.
 * Consumers can `catch (e) { if (e instanceof ExpressionEngineError) … }`
 * to distinguish engine errors from generic JS errors.
 */
export class ExpressionEngineError extends Error {
  /**
   * @param {string} message
   * @param {Error}  [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = "ExpressionEngineError";
    if (cause) this.cause = cause;
  }
}

/**
 * Thrown (or returned by `validateTemplate`) when the template string has
 * structural problems — unmatched `{{` / `}}`, nested braces, etc.
 */
export class TemplateSyntaxError extends ExpressionEngineError {
  /**
   * @param {string} message
   * @param {string} template  The raw template string that failed
   * @param {Error}  [cause]
   */
  constructor(message, template, cause) {
    super(message, cause);
    this.name = "TemplateSyntaxError";
    this.template = template;
  }
}

/**
 * Thrown by the validator (or evaluator) when JavaScript syntax is detected
 * in a context that only allows safe object-path traversal (`safe-path` mode).
 *
 * Examples of violations:
 *   - `{{ctx.input.id > 0 ? 'yes' : 'no'}}`  — ternary
 *   - `{{Math.round(ctx.input.score)}}`        — function call
 *   - `{{ctx.input.name + ' suffix'}}`         — string concatenation
 */
export class SecurityViolationError extends ExpressionEngineError {
  /**
   * @param {string} message
   * @param {string} expression  The offending expression content
   * @param {Error}  [cause]
   */
  constructor(message, expression, cause) {
    super(message, cause);
    this.name = "SecurityViolationError";
    this.expression = expression;
  }
}

/**
 * Thrown when a sandboxed JS execution exceeds its time or memory budget.
 * Primarily relevant for `isolated-js` mode (backend VM execution),
 * but can also be used for `js-template` if a watchdog is added.
 */
export class SandboxTimeoutError extends ExpressionEngineError {
  /**
   * @param {string} message
   * @param {number} [timeoutMs]  The configured timeout that was exceeded
   * @param {Error}  [cause]
   */
  constructor(message, timeoutMs, cause) {
    super(message, cause);
    this.name = "SandboxTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Thrown when a JS expression inside {{ }} fails at runtime.
 * Carries the original expression string for debugging.
 *
 * This is the same error previously exported from `js-resolver.js` in the
 * old `@jet-admin/template-engine` package — kept API-compatible.
 */
export class JsTemplateError extends ExpressionEngineError {
  /**
   * @param {string} message
   * @param {string} expression  The {{ }} content that failed
   * @param {Error}  [cause]
   */
  constructor(message, expression, cause) {
    super(message, cause);
    this.name = "JsTemplateError";
    this.expression = expression;
  }
}
