/**
 * Tests for evaluator.js — mode router
 */
import { evaluate, MODES } from "../src/evaluator.js";

describe("evaluator (mode router)", () => {
  const backendCtx = {
    input: { id: 42, name: "Alice" },
    items: [{ status: "active" }, { status: "pending" }],
  };

  const frontendCtx = {
    state: {
      queries: { users: { data: [{ name: "Alice" }], isLoading: false } },
      variables: { count: 5 },
    },
  };

  // ─── safe-path mode ────────────────────────────────────────────────────

  describe("mode: safe-path", () => {
    it("resolves a simple path", () => {
      expect(
        evaluate("{{ctx.input.id}}", backendCtx, {
          mode: MODES.SAFE_PATH,
          allowedRoots: ["ctx"],
        })
      ).toBe(42);
    });

    it("resolves nested object paths", () => {
      expect(
        evaluate("{{ctx.input.name}}", backendCtx, {
          mode: MODES.SAFE_PATH,
          allowedRoots: ["ctx"],
        })
      ).toBe("Alice");
    });

    it("resolves array index paths", () => {
      expect(
        evaluate("{{ctx.items[0].status}}", backendCtx, {
          mode: MODES.SAFE_PATH,
          allowedRoots: ["ctx"],
        })
      ).toBe("active");
    });

    it("returns undefined for JS expressions", () => {
      expect(
        evaluate("{{ctx.input.id > 0 ? 'yes' : 'no'}}", backendCtx, {
          mode: MODES.SAFE_PATH,
          allowedRoots: ["ctx"],
        })
      ).toBeUndefined();
    });

    it("recursively resolves objects", () => {
      const result = evaluate(
        { id: "{{args.id}}", name: "{{args.name}}" },
        { id: 1, name: "Test" },
        { mode: MODES.SAFE_PATH, allowedRoots: ["args"] }
      );
      expect(result).toEqual({ id: 1, name: "Test" });
    });
  });

  // ─── js-template mode ─────────────────────────────────────────────────

  describe("mode: js-template", () => {
    it("evaluates JS expressions", () => {
      expect(
        evaluate(
          "{{state.queries.users.data.length > 0 ? 'Yes' : 'No'}}",
          frontendCtx,
          { mode: MODES.JS_TEMPLATE }
        )
      ).toBe("Yes");
    });

    it("evaluates Math expressions", () => {
      expect(
        evaluate("{{Math.round(3.7)}}", frontendCtx, { mode: MODES.JS_TEMPLATE })
      ).toBe(4);
    });

    it("preserves type by default", () => {
      expect(
        evaluate("{{state.variables.count}}", frontendCtx, {
          mode: MODES.JS_TEMPLATE,
        })
      ).toBe(5);
    });

    it("handles mixed interpolation", () => {
      expect(
        evaluate("Count: {{state.variables.count}}", frontendCtx, {
          mode: MODES.JS_TEMPLATE,
        })
      ).toBe("Count: 5");
    });
  });

  // ─── isolated-js mode ─────────────────────────────────────────────────

  describe("mode: isolated-js", () => {
    it("throws a clear error explaining this mode is backend-only", () => {
      expect(() =>
        evaluate("return 1 + 1;", {}, { mode: MODES.ISOLATED_JS })
      ).toThrow(/not handled by the expression engine/);
    });
  });

  // ─── unknown mode ─────────────────────────────────────────────────────

  describe("unknown mode", () => {
    it("throws for invalid mode", () => {
      expect(() =>
        evaluate("{{x}}", {}, { mode: "invalid-mode" })
      ).toThrow(/Unknown expression engine mode/);
    });
  });

  // ─── preserveSingleExpressionType ────────────────────────────────────

  describe("preserveSingleExpressionType", () => {
    it("defaults to true — preserves native types", () => {
      const result = evaluate("{{ctx.input.id}}", backendCtx, {
        mode: MODES.SAFE_PATH,
        allowedRoots: ["ctx"],
      });
      expect(result).toBe(42);
      expect(typeof result).toBe("number");
    });

    it("when false, stringifies whole-expression values", () => {
      const result = evaluate("{{ctx.input.id}}", backendCtx, {
        mode: MODES.SAFE_PATH,
        allowedRoots: ["ctx"],
        preserveSingleExpressionType: false,
      });
      expect(result).toBe("42");
    });
  });
});
