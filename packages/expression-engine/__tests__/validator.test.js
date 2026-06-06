/**
 * Tests for validator.js — template validation
 */
import {
  validateTemplate,
  hasMissingTemplateBraces,
  collectTemplateViolations,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
} from "../src/validator.js";

describe("validator", () => {
  // ─── validateTemplate ──────────────────────────────────────────────────

  describe("validateTemplate", () => {
    it("passes valid safe-path templates", () => {
      const result = validateTemplate("{{ctx.input.id}}", "safe-path");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("passes plain text (no expressions)", () => {
      const result = validateTemplate("just plain text", "safe-path");
      expect(result.valid).toBe(true);
    });

    it("rejects JS syntax in safe-path mode — ternary", () => {
      const result = validateTemplate(
        "{{ctx.input.id > 0 ? 'yes' : 'no'}}", "safe-path"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].name).toBe("SecurityViolationError");
    });

    it("rejects JS syntax in safe-path mode — function call", () => {
      const result = validateTemplate(
        "{{Math.round(ctx.input.score)}}", "safe-path"
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].name).toBe("SecurityViolationError");
    });

    it("rejects JS syntax in safe-path mode — concatenation", () => {
      const result = validateTemplate(
        "{{ctx.input.first + ' ' + ctx.input.last}}", "safe-path"
      );
      expect(result.valid).toBe(false);
    });

    it("allows JS syntax in js-template mode", () => {
      const result = validateTemplate(
        "{{ctx.input.id > 0 ? 'yes' : 'no'}}", "js-template"
      );
      expect(result.valid).toBe(true);
    });

    it("detects mismatched braces", () => {
      const result = validateTemplate("{{ctx.input.id}", "safe-path");
      expect(result.valid).toBe(false);
      expect(result.errors[0].name).toBe("TemplateSyntaxError");
    });

    it("validates allowedRoots", () => {
      const result = validateTemplate("{{window.location}}", "safe-path", {
        allowedRoots: ["ctx"],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.name === "SecurityViolationError")).toBe(true);
    });

    it("passes non-string values", () => {
      const result = validateTemplate(42, "safe-path");
      expect(result.valid).toBe(true);
    });
  });

  // ─── hasMissingTemplateBraces ──────────────────────────────────────────

  describe("hasMissingTemplateBraces", () => {
    it("returns true for bare path missing braces", () => {
      expect(hasMissingTemplateBraces("ctx.input.id")).toBe(true);
    });

    it("returns false for properly wrapped expression", () => {
      expect(hasMissingTemplateBraces("{{ctx.input.id}}")).toBe(false);
    });

    it("returns false for plain text", () => {
      expect(hasMissingTemplateBraces("hello world")).toBe(false);
    });

    it("returns false for bare root", () => {
      expect(hasMissingTemplateBraces("ctx")).toBe(false);
    });

    it("returns false for non-strings", () => {
      expect(hasMissingTemplateBraces(42)).toBe(false);
      expect(hasMissingTemplateBraces(null)).toBe(false);
    });
  });

  // ─── collectTemplateViolations ──────────────────────────────────────────

  describe("collectTemplateViolations", () => {
    it("collects violations in nested objects", () => {
      const issues = collectTemplateViolations(
        { query: "ctx.input.id", wrapped: "{{ctx.input.name}}" },
        []
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].path).toEqual(["query"]);
      expect(issues[0].message).toBe(MUSTACHE_ONLY_TEMPLATE_MESSAGE);
    });

    it("collects violations in arrays", () => {
      const issues = collectTemplateViolations(
        ["ctx.input.a", "{{ctx.input.b}}"],
        []
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].path).toEqual([0]);
    });

    it("returns empty for clean config", () => {
      const issues = collectTemplateViolations(
        { a: "{{ctx.input.id}}", b: "plain text" },
        []
      );
      expect(issues).toHaveLength(0);
    });
  });
});
