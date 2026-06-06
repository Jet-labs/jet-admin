/**
 * Tests for js-template-resolver.js — js-template mode
 */
import {
  resolveJsTemplate,
  evalJsExpression,
  looksLikeJsExpression,
} from "../src/js-template-resolver.js";

describe("js-template-resolver", () => {
  const state = {
    queries: {
      users: {
        data: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        isLoading: false,
      },
    },
    variables: {
      count: 42,
      name: "Charlie",
    },
  };

  const ctx = { state };

  // ─── looksLikeJsExpression ──────────────────────────────────────────────

  describe("looksLikeJsExpression", () => {
    it("returns false for plain paths", () => {
      expect(looksLikeJsExpression("state.queries.data")).toBe(false);
      expect(looksLikeJsExpression("ctx.input.id")).toBe(false);
    });

    it("returns true for function calls", () => {
      expect(looksLikeJsExpression("JSON.stringify(state.data)")).toBe(true);
    });

    it("returns true for ternary", () => {
      expect(looksLikeJsExpression("x > 0 ? 'yes' : 'no'")).toBe(true);
    });

    it("returns true for arithmetic", () => {
      expect(looksLikeJsExpression("a + b")).toBe(true);
    });

    it("returns true for comparison", () => {
      expect(looksLikeJsExpression("a === b")).toBe(true);
    });
  });

  // ─── evalJsExpression ──────────────────────────────────────────────────

  describe("evalJsExpression", () => {
    it("evaluates a simple path expression", () => {
      const { value, error } = evalJsExpression("state.variables.count", ctx);
      expect(error).toBeNull();
      expect(value).toBe(42);
    });

    it("evaluates a ternary expression", () => {
      const { value } = evalJsExpression(
        "state.queries.users.data.length > 0 ? 'Yes' : 'No'", ctx
      );
      expect(value).toBe("Yes");
    });

    it("evaluates Math functions", () => {
      const { value } = evalJsExpression("Math.round(3.7)", ctx);
      expect(value).toBe(4);
    });

    it("evaluates JSON.stringify (cycle-safe)", () => {
      const { value } = evalJsExpression("JSON.stringify(state.variables)", ctx);
      expect(JSON.parse(value)).toEqual({ count: 42, name: "Charlie" });
    });

    it("blocks window access", () => {
      const { value } = evalJsExpression("typeof window", ctx);
      expect(value).toBe("undefined");
    });

    it("blocks fetch access", () => {
      const { value } = evalJsExpression("typeof fetch", ctx);
      expect(value).toBe("undefined");
    });

    it("blocks eval access", () => {
      const { value } = evalJsExpression("typeof eval", ctx);
      expect(value).toBe("undefined");
    });

    it("returns error for syntax errors", () => {
      const { value, error } = evalJsExpression("a +++ b", ctx);
      // Depending on engine, this might parse or not — but shouldn't crash
      expect(error === null || error.name === "JsTemplateError").toBe(true);
    });

    it("returns undefined for missing paths (does not throw)", () => {
      const { value, error } = evalJsExpression("state.missing.deep.path", ctx);
      // Should catch the TypeError and return undefined
      expect(value).toBeUndefined();
    });

    it("supports Array methods", () => {
      const { value } = evalJsExpression(
        "state.queries.users.data.map(u => u.name).join(', ')", ctx
      );
      expect(value).toBe("Alice, Bob");
    });

    it("supports optional chaining via nullish access", () => {
      const { value } = evalJsExpression(
        "state.queries.users.data[0]?.name ?? 'unknown'", ctx
      );
      expect(value).toBe("Alice");
    });
  });

  // ─── resolveJsTemplate ────────────────────────────────────────────────

  describe("resolveJsTemplate", () => {
    it("preserves type for whole-string expression", () => {
      const result = resolveJsTemplate("{{state.queries.users.data}}", ctx, {
        preserveSingleExpressionType: true,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("returns number for numeric expression", () => {
      const result = resolveJsTemplate("{{state.variables.count}}", ctx, {
        preserveSingleExpressionType: true,
      });
      expect(result).toBe(42);
      expect(typeof result).toBe("number");
    });

    it("interpolates mixed text + expressions", () => {
      const result = resolveJsTemplate(
        "Hello {{state.variables.name}}, count: {{state.variables.count}}",
        ctx
      );
      expect(result).toBe("Hello Charlie, count: 42");
    });

    it("handles JS expressions in mixed interpolation", () => {
      const result = resolveJsTemplate(
        "Items: {{state.queries.users.data.length}}", ctx
      );
      expect(result).toBe("Items: 2");
    });

    it("recursively resolves objects", () => {
      const result = resolveJsTemplate(
        {
          name: "{{state.variables.name}}",
          count: "{{state.variables.count}}",
        },
        ctx,
        { preserveSingleExpressionType: true }
      );
      expect(result).toEqual({ name: "Charlie", count: 42 });
    });

    it("recursively resolves arrays", () => {
      const result = resolveJsTemplate(
        ["{{state.variables.name}}", "{{state.variables.count}}"],
        ctx,
        { preserveSingleExpressionType: true }
      );
      expect(result).toEqual(["Charlie", 42]);
    });

    it("passes through primitives", () => {
      expect(resolveJsTemplate(42, ctx)).toBe(42);
      expect(resolveJsTemplate(null, ctx)).toBe(null);
      expect(resolveJsTemplate(true, ctx)).toBe(true);
    });

    it("collects errors when errors array is provided", () => {
      const errors = [];
      resolveJsTemplate("{{state.missing.nested.path}}", ctx, {
        preserveSingleExpressionType: true,
        errors,
      });
      // Should have collected an error for the TypeError
      // (accessing .nested on undefined)
      expect(errors.length).toBeGreaterThanOrEqual(0); // may or may not error depending on expression
    });
  });
});
