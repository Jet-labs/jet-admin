/**
 * Tests for intellisense.js — autocomplete suggestions
 */
import {
  getObjectSuggestions,
  getMemberSuggestions,
  getJsSuggestions,
  getCompletions,
  inferValueType,
  JS_BUILTINS,
  JS_ARRAY_METHODS,
  JS_STRING_METHODS,
} from "../src/intellisense.js";

describe("intellisense", () => {
  const stateTree = {
    state: {
      queries: {
        users: {
          data: [{ id: 1, name: "Alice" }],
          isLoading: false,
        },
      },
      variables: {
        count: 42,
        label: "hello",
      },
    },
  };

  // ─── inferValueType ────────────────────────────────────────────────────

  describe("inferValueType", () => {
    it("identifies arrays with shape", () => {
      expect(inferValueType([{ id: 1, name: "A" }])).toMatch(/Array\[1\]/);
    });

    it("identifies empty arrays", () => {
      expect(inferValueType([])).toBe("Array[0]");
    });

    it("identifies booleans", () => {
      expect(inferValueType(true)).toBe("Boolean = true");
    });

    it("identifies numbers", () => {
      expect(inferValueType(42)).toBe("Number = 42");
    });

    it("identifies strings (truncated)", () => {
      expect(inferValueType("hello")).toMatch(/"hello"/);
    });

    it("identifies null", () => {
      expect(inferValueType(null)).toBe("null");
    });

    it("identifies objects", () => {
      expect(inferValueType({ a: 1 })).toMatch(/Object.*\{ a/);
    });
  });

  // ─── getObjectSuggestions ──────────────────────────────────────────────

  describe("getObjectSuggestions", () => {
    it("returns path-based suggestions from state tree", () => {
      const suggestions = getObjectSuggestions(stateTree);
      const paths = suggestions.map((s) => s.value);
      expect(paths).toContain("state");
      expect(paths.some((p) => p.startsWith("state.queries"))).toBe(true);
    });

    it("returns empty for non-object input", () => {
      expect(getObjectSuggestions(null)).toEqual([]);
      expect(getObjectSuggestions("string")).toEqual([]);
    });

    it("handles circular references gracefully", () => {
      const circular = { a: {} };
      circular.a.self = circular;
      // Should not throw or infinite loop
      const suggestions = getObjectSuggestions(circular);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("skips __-prefixed keys", () => {
      const data = { __internal: "hidden", public: "visible" };
      const suggestions = getObjectSuggestions(data);
      expect(suggestions.some((s) => s.value.includes("__internal"))).toBe(false);
      expect(suggestions.some((s) => s.value === "public")).toBe(true);
    });
  });

  // ─── getMemberSuggestions ──────────────────────────────────────────────

  describe("getMemberSuggestions", () => {
    it("returns array methods for array paths", () => {
      const members = getMemberSuggestions(
        "state.queries.users.data",
        stateTree
      );
      expect(members.some((m) => m.label.includes(".length"))).toBe(true);
      expect(members.some((m) => m.label.includes(".filter()"))).toBe(true);
    });

    it("returns string methods for string paths", () => {
      const members = getMemberSuggestions(
        "state.variables.label",
        stateTree
      );
      expect(members.some((m) => m.label.includes(".toUpperCase()"))).toBe(true);
    });

    it("returns property keys for object paths", () => {
      const members = getMemberSuggestions(
        "state.variables",
        stateTree
      );
      expect(members.some((m) => m.value.includes("count"))).toBe(true);
      expect(members.some((m) => m.value.includes("label"))).toBe(true);
    });

    it("returns empty for unresolvable paths", () => {
      expect(getMemberSuggestions("state.nonexistent", stateTree)).toEqual([]);
    });

    it("filters by memberPrefix", () => {
      const members = getMemberSuggestions(
        "state.queries.users.data",
        stateTree,
        "fi"
      );
      expect(members.some((m) => m.label.includes(".filter()"))).toBe(true);
      expect(members.some((m) => m.label.includes(".find()"))).toBe(true);
      expect(members.some((m) => m.label.includes(".map()"))).toBe(false);
    });
  });

  // ─── getJsSuggestions ──────────────────────────────────────────────────

  describe("getJsSuggestions", () => {
    it("returns object suggestions + JS builtins", () => {
      const suggestions = getJsSuggestions({ stateTree });
      expect(suggestions.some((s) => s.category === "live-state")).toBe(true);
      expect(suggestions.some((s) => s.category === "json")).toBe(true);
    });

    it("filters by text", () => {
      const suggestions = getJsSuggestions({
        filter: "Math",
        stateTree,
      });
      expect(suggestions.some((s) => s.value.startsWith("Math."))).toBe(true);
    });

    it("returns member completions for dot-terminated filter", () => {
      const suggestions = getJsSuggestions({
        filter: "state.queries.users.data.",
        stateTree,
      });
      // Should return array member completions
      expect(suggestions.some((s) => s.label.includes(".filter()"))).toBe(true);
    });

    it("respects includeBuiltins: false", () => {
      const suggestions = getJsSuggestions({
        stateTree,
        includeBuiltins: false,
      });
      expect(suggestions.every((s) => s.category === "live-state")).toBe(true);
    });
  });

  // ─── getCompletions (mode-aware) ───────────────────────────────────────

  describe("getCompletions", () => {
    it("returns only object keys in safe-path mode", () => {
      const completions = getCompletions({
        stateTree,
        mode: "safe-path",
      });
      // Should NOT include JS builtins
      expect(completions.some((c) => c.category === "json")).toBe(false);
      expect(completions.some((c) => c.category === "math")).toBe(false);
      // Should include live-state suggestions
      expect(completions.some((c) => c.category === "live-state")).toBe(true);
    });

    it("returns object keys + builtins in js-template mode", () => {
      const completions = getCompletions({
        stateTree,
        mode: "js-template",
      });
      expect(completions.some((c) => c.category === "live-state")).toBe(true);
      expect(completions.some((c) => c.category === "json")).toBe(true);
    });

    it("filters in safe-path mode", () => {
      const completions = getCompletions({
        stateTree,
        mode: "safe-path",
        filter: "state.queries",
      });
      expect(completions.every((c) => c.value.includes("queries"))).toBe(true);
    });

    it("merges baseSuggestions first", () => {
      const custom = [
        { value: "custom.item", label: "custom.item", detail: "Custom", type: "property", category: "schema" },
      ];
      const completions = getCompletions({
        stateTree,
        mode: "safe-path",
        baseSuggestions: custom,
      });
      expect(completions[0].value).toBe("custom.item");
    });
  });
});
