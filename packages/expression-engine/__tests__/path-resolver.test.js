/**
 * Tests for path-resolver.js — safe-path mode
 */
import { resolvePathTemplate } from "../src/path-resolver.js";

describe("path-resolver (safe-path mode)", () => {
  const ctx = {
    input: {
      id: 42,
      name: "Alice",
      items: [{ profile: { name: "Ada" } }, { profile: { name: "Grace" } }],
      total: 99,
    },
    "user-id": 7,
  };

  // ─── Basic resolution ──────────────────────────────────────────────────

  it("resolves a whole-template expression with allowedRoots", () => {
    expect(
      resolvePathTemplate("{{ctx.input.items[0].profile.name}}", ctx, { allowedRoots: ["ctx"] })
    ).toBe("Ada");
  });

  it("preserves native type for whole expression when enabled", () => {
    expect(
      resolvePathTemplate("{{ctx.input.total}}", ctx, {
        allowedRoots: ["ctx"],
        preserveSingleExpressionType: true,
      })
    ).toBe(99);
  });

  it("stringifies values for whole expression by default", () => {
    expect(
      resolvePathTemplate("{{ctx.input.total}}", ctx, { allowedRoots: ["ctx"] })
    ).toBe("99");
  });

  // ─── Multi-block interpolation ──────────────────────────────────────────

  it("resolves mixed text + expressions", () => {
    expect(
      resolvePathTemplate("User: {{ctx.input.name}}, ID: {{ctx.input.id}}", ctx, {
        allowedRoots: ["ctx"],
      })
    ).toBe("User: Alice, ID: 42");
  });

  it("uses empty-string fallback for missing values", () => {
    expect(
      resolvePathTemplate("SELECT {{args.missing}}", {}, { allowedRoots: ["args"] })
    ).toBe("SELECT ");
  });

  // ─── Recursive resolution ──────────────────────────────────────────────

  it("recursively resolves nested objects and arrays", () => {
    expect(
      resolvePathTemplate(
        {
          limit: "{{args.limit}}",
          filters: ["{{args.status}}", { ids: "{{args.ids}}" }],
        },
        { limit: 10, status: "active", ids: [1, 2] },
        { allowedRoots: ["args"], preserveSingleExpressionType: true }
      )
    ).toEqual({
      limit: 10,
      filters: ["active", { ids: [1, 2] }],
    });
  });

  // ─── Non-string pass-through ────────────────────────────────────────────

  it("passes through numbers unchanged", () => {
    expect(resolvePathTemplate(42, ctx)).toBe(42);
  });

  it("passes through booleans unchanged", () => {
    expect(resolvePathTemplate(true, ctx)).toBe(true);
  });

  it("passes through null unchanged", () => {
    expect(resolvePathTemplate(null, ctx)).toBe(null);
  });

  // ─── JS expressions should NOT evaluate ─────────────────────────────────

  it("returns undefined for JS expressions (path resolver does not execute JS)", () => {
    // The path tokenizer will fail on "?" and return null → getValueByPath returns undefined
    expect(
      resolvePathTemplate("{{ctx.input.id > 0 ? 'yes' : 'no'}}", ctx, {
        allowedRoots: ["ctx"],
        preserveSingleExpressionType: true,
      })
    ).toBeUndefined();
  });
});
