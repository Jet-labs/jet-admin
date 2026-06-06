/**
 * Tests for dependency-extractor.js — reactive dependency tracking
 */
import { extractDependencies } from "../src/dependency-extractor.js";

describe("dependency-extractor", () => {
  // ─── Basic extraction ──────────────────────────────────────────────────

  it("extracts state.namespace.key from a simple expression", () => {
    const deps = extractDependencies("{{state.queries.get_users.data}}");
    expect(deps).toEqual(["queries.get_users"]);
  });

  it("extracts multiple dependencies from a single expression", () => {
    const deps = extractDependencies(
      "{{state.queries.q1.isLoading || state.queries.q2.isLoading}}"
    );
    expect(deps).toContain("queries.q1");
    expect(deps).toContain("queries.q2");
    expect(deps).toHaveLength(2);
  });

  it("extracts dependencies from function calls", () => {
    const deps = extractDependencies(
      "{{String(state.queries.query_5.isLoading)}}"
    );
    expect(deps).toEqual(["queries.query_5"]);
  });

  it("deduplicates dependencies", () => {
    const deps = extractDependencies(
      "{{state.queries.q1.data.length > 0 ? state.queries.q1.data[0].name : 'none'}}"
    );
    expect(deps).toEqual(["queries.q1"]);
  });

  // ─── Recursive scanning ────────────────────────────────────────────────

  it("extracts from nested objects", () => {
    const deps = extractDependencies({
      label: "{{state.variables.name}}",
      visible: "{{state.queries.q1.isLoading}}",
    });
    expect(deps).toContain("variables.name");
    expect(deps).toContain("queries.q1");
  });

  it("extracts from arrays", () => {
    const deps = extractDependencies([
      "{{state.queries.q1.data}}",
      "{{state.queries.q2.data}}",
    ]);
    expect(deps).toContain("queries.q1");
    expect(deps).toContain("queries.q2");
  });

  it("extracts from deeply nested structures", () => {
    const deps = extractDependencies({
      config: {
        columns: [
          { value: "{{state.queries.users.data}}" },
          { visible: "{{state.variables.showCol}}" },
        ],
      },
    });
    expect(deps).toContain("queries.users");
    expect(deps).toContain("variables.showCol");
  });

  // ─── Edge cases ─────────────────────────────────────────────────────────

  it("returns empty array for plain text", () => {
    expect(extractDependencies("just text")).toEqual([]);
  });

  it("returns empty array for null/undefined", () => {
    expect(extractDependencies(null)).toEqual([]);
    expect(extractDependencies(undefined)).toEqual([]);
  });

  it("returns empty array for non-state roots", () => {
    expect(extractDependencies("{{ctx.input.id}}")).toEqual([]);
  });

  // ─── Custom roots ──────────────────────────────────────────────────────

  it("supports custom roots (e.g. ctx for backend)", () => {
    const deps = extractDependencies("{{ctx.input.userId}}", { roots: ["ctx"] });
    expect(deps).toEqual(["input.userId"]);
  });

  it("supports multiple roots simultaneously", () => {
    const deps = extractDependencies(
      "{{state.queries.q1.data}} {{ctx.input.id}}",
      { roots: ["state", "ctx"] }
    );
    expect(deps).toContain("queries.q1");
    expect(deps).toContain("input.id");
  });
});
