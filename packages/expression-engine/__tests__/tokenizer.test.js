/**
 * Tests for tokenizer.js — path tokenization and safe traversal
 */
import {
  BLOCKED_PATH_SEGMENTS,
  normalizePath,
  tokenizeObjectPath,
  getValueByPath,
} from "../src/tokenizer.js";

describe("tokenizer", () => {
  // ─── normalizePath ──────────────────────────────────────────────────────

  describe("normalizePath", () => {
    it("strips optional chaining", () => {
      expect(normalizePath("ctx?.input?.id")).toBe("ctx.input.id");
    });

    it("strips leading dots", () => {
      expect(normalizePath("..foo.bar")).toBe("foo.bar");
    });

    it("strips root prefix when allowedRoots is set", () => {
      expect(normalizePath("ctx.input.id", ["ctx"])).toBe("input.id");
    });

    it("strips root with bracket access", () => {
      expect(normalizePath("ctx[0].name", ["ctx"])).toBe("[0].name");
    });

    it("returns null for unauthorized root", () => {
      expect(normalizePath("window.location", ["ctx"])).toBeNull();
    });

    it("returns empty string for bare root", () => {
      expect(normalizePath("ctx", ["ctx"])).toBe("");
    });
  });

  // ─── tokenizeObjectPath ─────────────────────────────────────────────────

  describe("tokenizeObjectPath", () => {
    it("tokenizes dot-separated path", () => {
      expect(tokenizeObjectPath("a.b.c")).toEqual(["a", "b", "c"]);
    });

    it("tokenizes numeric bracket access", () => {
      expect(tokenizeObjectPath("items[0].name")).toEqual(["items", 0, "name"]);
    });

    it("tokenizes quoted bracket access", () => {
      expect(tokenizeObjectPath('obj["user-name"]')).toEqual(["obj", "user-name"]);
    });

    it("tokenizes single-quoted bracket access", () => {
      expect(tokenizeObjectPath("obj['key']")).toEqual(["obj", "key"]);
    });

    it("handles allowedRoots — strips prefix", () => {
      expect(tokenizeObjectPath("ctx.input.id", { allowedRoots: ["ctx"] }))
        .toEqual(["input", "id"]);
    });

    it("returns null for unauthorized root", () => {
      expect(tokenizeObjectPath("window.location", { allowedRoots: ["ctx"] }))
        .toBeNull();
    });

    it("returns empty array for bare root", () => {
      expect(tokenizeObjectPath("ctx", { allowedRoots: ["ctx"] }))
        .toEqual([]);
    });

    it("returns null for malformed paths", () => {
      expect(tokenizeObjectPath("a..b")).toEqual(["a", "b"]);  // skips multiple dots
      expect(tokenizeObjectPath("a[")).toBeNull();    // unclosed bracket
    });
  });

  // ─── getValueByPath ─────────────────────────────────────────────────────

  describe("getValueByPath", () => {
    const data = {
      input: {
        id: 42,
        items: [{ name: "Alice" }, { name: "Bob" }],
        "special-key": "value",
      },
    };

    it("resolves dot paths", () => {
      expect(getValueByPath(data, "input.id")).toBe(42);
    });

    it("resolves bracket index paths", () => {
      expect(getValueByPath(data, "input.items[0].name")).toBe("Alice");
    });

    it("resolves quoted bracket keys", () => {
      expect(getValueByPath(data, 'input["special-key"]')).toBe("value");
    });

    it("returns undefined for missing paths", () => {
      expect(getValueByPath(data, "input.missing.deep")).toBeUndefined();
    });

    it("blocks __proto__ traversal", () => {
      expect(getValueByPath(data, "input.__proto__")).toBeUndefined();
    });

    it("blocks prototype traversal", () => {
      expect(getValueByPath(data, "input.prototype")).toBeUndefined();
    });

    it("blocks constructor traversal", () => {
      expect(getValueByPath(data, "input.constructor")).toBeUndefined();
    });

    it("enforces allowedRoots", () => {
      expect(getValueByPath({ somethingElse: 42 }, "ctx.input.id", { allowedRoots: ["ctx"] }))
        .toBeUndefined(); // obj doesn't have "input.id" after stripping "ctx."
    });

    it("resolves with allowedRoots when data matches", () => {
      const ctx = { input: { id: 42 } };
      expect(getValueByPath(ctx, "ctx.input.id", { allowedRoots: ["ctx"] }))
        .toBe(42);
    });

    it("handles optional chaining gracefully", () => {
      expect(getValueByPath(data, "input?.id")).toBe(42);
      expect(getValueByPath(data, "input?.missing?.deep")).toBeUndefined();
    });
  });
});
