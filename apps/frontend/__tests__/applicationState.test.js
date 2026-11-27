import {
  formatApplicationStateDefault,
  parseApplicationStateDefault,
} from "../src/logic/applicationRuntime/applicationState";

describe("Application state defaults", () => {
  it("round-trips each supported scalar type", () => {
    expect(parseApplicationStateDefault("string", "42")).toEqual({
      ok: true,
      value: "42",
    });
    expect(parseApplicationStateDefault("number", "42.5")).toEqual({
      ok: true,
      value: 42.5,
    });
    expect(parseApplicationStateDefault("boolean", "true")).toEqual({
      ok: true,
      value: true,
    });
    expect(parseApplicationStateDefault("null", "ignored")).toEqual({
      ok: true,
      value: null,
    });
    expect(formatApplicationStateDefault("42")).toBe("42");
    expect(formatApplicationStateDefault(false)).toBe("false");
    expect(formatApplicationStateDefault(null)).toBe("null");
  });

  it("parses and formats object and array defaults", () => {
    expect(
      parseApplicationStateDefault("object", '{"compact":true}')
    ).toEqual({ ok: true, value: { compact: true } });
    expect(parseApplicationStateDefault("array", "[1,2]")).toEqual({
      ok: true,
      value: [1, 2],
    });
    expect(formatApplicationStateDefault({ compact: true })).toContain(
      '"compact": true'
    );
  });

  it("rejects invalid defaults instead of silently coercing", () => {
    expect(parseApplicationStateDefault("number", "abc").ok).toBe(false);
    expect(parseApplicationStateDefault("boolean", "yes").ok).toBe(false);
    expect(parseApplicationStateDefault("object", "[]").ok).toBe(false);
    expect(parseApplicationStateDefault("array", "{}").ok).toBe(false);
    expect(parseApplicationStateDefault("unknown", "x").ok).toBe(false);
  });
});
