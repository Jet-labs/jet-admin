/**
 * Tests for errors.js — custom error types
 */
import {
  ExpressionEngineError,
  TemplateSyntaxError,
  SecurityViolationError,
  SandboxTimeoutError,
  JsTemplateError,
} from "../src/errors.js";

describe("errors", () => {
  it("ExpressionEngineError is instanceof Error", () => {
    const err = new ExpressionEngineError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ExpressionEngineError);
    expect(err.name).toBe("ExpressionEngineError");
  });

  it("TemplateSyntaxError carries template string", () => {
    const err = new TemplateSyntaxError("bad braces", "{{broken");
    expect(err).toBeInstanceOf(ExpressionEngineError);
    expect(err.name).toBe("TemplateSyntaxError");
    expect(err.template).toBe("{{broken");
  });

  it("SecurityViolationError carries expression", () => {
    const err = new SecurityViolationError("JS detected", "Math.round(x)");
    expect(err).toBeInstanceOf(ExpressionEngineError);
    expect(err.name).toBe("SecurityViolationError");
    expect(err.expression).toBe("Math.round(x)");
  });

  it("SandboxTimeoutError carries timeout", () => {
    const err = new SandboxTimeoutError("timed out", 5000);
    expect(err).toBeInstanceOf(ExpressionEngineError);
    expect(err.name).toBe("SandboxTimeoutError");
    expect(err.timeoutMs).toBe(5000);
  });

  it("JsTemplateError carries expression and cause", () => {
    const cause = new TypeError("Cannot read property");
    const err = new JsTemplateError("eval failed", "state.x.y", cause);
    expect(err).toBeInstanceOf(ExpressionEngineError);
    expect(err.name).toBe("JsTemplateError");
    expect(err.expression).toBe("state.x.y");
    expect(err.cause).toBe(cause);
  });

  it("all errors have proper prototype chain", () => {
    const errors = [
      new TemplateSyntaxError("a", "t"),
      new SecurityViolationError("b", "e"),
      new SandboxTimeoutError("c", 100),
      new JsTemplateError("d", "x"),
    ];

    for (const err of errors) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(ExpressionEngineError);
    }
  });
});
