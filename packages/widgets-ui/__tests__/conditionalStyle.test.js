import { resolveConditionalStyle } from "../src/config/conditionalStyle";

describe("resolveConditionalStyle", () => {
  test("returns null without rules", () => {
    expect(resolveConditionalStyle(null, {})).toBeNull();
    expect(resolveConditionalStyle({ logic: "and", rules: [] }, {})).toBeNull();
  });

  test("applies the matching tone and emphasis", () => {
    const result = resolveConditionalStyle(
      {
        logic: "and",
        rules: [{ field: "value", operator: "gte", value: 100 }],
        style: { tone: "danger", emphasis: "bold" },
      },
      { value: 120 }
    );
    expect(result).toBeTruthy();
    expect(result.tone).toBe("danger");
    expect(result.textClass).toBe("text-destructive");
    expect(result.className).toContain("font-semibold");
  });

  test("respects OR logic and non-matches", () => {
    const config = {
      logic: "or",
      rules: [
        { field: "value", operator: "equals", value: "failed" },
        { field: "value", operator: "equals", value: "blocked" },
      ],
      style: { tone: "warning" },
    };
    expect(resolveConditionalStyle(config, { value: "blocked" })?.tone).toBe("warning");
    expect(resolveConditionalStyle(config, { value: "active" })).toBeNull();
  });
});
