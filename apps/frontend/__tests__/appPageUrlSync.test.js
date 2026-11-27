import { applyVariablesToSearchParams } from "../src/logic/appPageRuntime/appPageUrlSync";

const definitions = [
  { key: "page", defaultValue: 1 },
  { key: "threshold", defaultValue: 0 },
  { key: "search", defaultValue: "" },
];

describe("appPageUrlSync", () => {
  it("writes only allowlisted variables and preserves unrelated params", () => {
    const params = new URLSearchParams(
      "tab=all&page=3&threshold=10&search=old&utm=email"
    );
    const changed = applyVariablesToSearchParams(
      params,
      definitions,
      { page: 2, threshold: 25, search: "new" },
      { keys: ["page", "threshold"] }
    );

    expect(changed).toBe(true);
    expect(params.get("page")).toBe("2");
    expect(params.get("threshold")).toBe("25");
    expect(params.get("search")).toBe("old");
    expect(params.get("tab")).toBe("all");
    expect(params.get("utm")).toBe("email");
  });

  it("removes allowlisted params that match defaults", () => {
    const params = new URLSearchParams("page=2&threshold=10&tab=all");
    const changed = applyVariablesToSearchParams(
      params,
      definitions,
      { page: 1, threshold: 0 },
      { keys: ["page", "threshold"] }
    );

    expect(changed).toBe(true);
    expect(params.has("page")).toBe(false);
    expect(params.has("threshold")).toBe(false);
    expect(params.get("tab")).toBe("all");
  });

  it("keeps legacy all-variable sync when no allowlist is provided", () => {
    const params = new URLSearchParams("search=old");
    applyVariablesToSearchParams(params, definitions, {
      page: 4,
      threshold: 5,
      search: "",
    });

    expect(params.get("page")).toBe("4");
    expect(params.get("threshold")).toBe("5");
    expect(params.has("search")).toBe(false);
  });

  it("reports no change when values already match", () => {
    const params = new URLSearchParams("page=2");
    const changed = applyVariablesToSearchParams(
      params,
      definitions,
      { page: 2 },
      { keys: ["page"] }
    );
    expect(changed).toBe(false);
  });
});
