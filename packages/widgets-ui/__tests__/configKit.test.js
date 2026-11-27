import { deletePath, fieldMatchesQuery, getPath, setPath } from "../src/config/configEditorContext";
import { evaluateCondition, evaluateConditions } from "../src/config/ConditionBuilder";
import { hasBinding } from "../src/config/BindableInput";
import { isNormalizedConfig, normalizeWidgetConfig } from "@jet-admin/widget-types";

describe("config editor path helpers", () => {
  test("getPath reads dot and bracket paths", () => {
    const source = { a: { b: [{ c: 42 }] } };
    expect(getPath(source, "a.b[0].c")).toBe(42);
    expect(getPath(source, "a.b[1].c")).toBeUndefined();
  });

  test("setPath writes without mutating the source", () => {
    const source = { a: { b: 1 } };
    const next = setPath(source, "a.b", 2);
    expect(next.a.b).toBe(2);
    expect(source.a.b).toBe(1);
    expect(setPath(source, "a.c", 3).a.c).toBe(3);
  });

  test("deletePath removes only the requested value", () => {
    const source = { a: { b: 1, c: 2 } };
    const next = deletePath(source, "a.b");
    expect(next.a).toEqual({ c: 2 });
    expect(source.a).toEqual({ b: 1, c: 2 });
  });
});

describe("config search", () => {
  test("matches label, path and keywords with all tokens", () => {
    const field = { label: "Empty text", path: "emptyText", keywords: "no data placeholder" };
    expect(fieldMatchesQuery(field, "empty")).toBe(true);
    expect(fieldMatchesQuery(field, "placeholder empty")).toBe(true);
    expect(fieldMatchesQuery(field, "empty missing")).toBe(false);
    expect(fieldMatchesQuery(field, "")).toBe(true);
  });
});

describe("bindable input detection", () => {
  test("detects complete bindings but not plain literals", () => {
    expect(hasBinding("{{ state.queries.orders.data }}")).toBe(true);
    expect(hasBinding("literal text")).toBe(false);
    expect(hasBinding("")).toBe(false);
  });
});

describe("condition builder evaluation", () => {
  const context = { row: { status: "failed", amount: 12 }, state: { variables: { role: "admin" } } };

  test("equality, comparison and list operators", () => {
    expect(evaluateCondition({ field: "row.status", operator: "equals", value: "failed" }, context)).toBe(true);
    expect(evaluateCondition({ field: "row.amount", operator: "gt", value: "10" }, context)).toBe(true);
    expect(evaluateCondition({ field: "row.status", operator: "in", value: "failed, pending" }, context)).toBe(true);
    expect(evaluateCondition({ field: "row.status", operator: "not_equals", value: "failed" }, context)).toBe(false);
  });

  test("AND/OR logic and empty rules", () => {
    const rules = [
      { field: "row.status", operator: "equals", value: "failed" },
      { field: "row.amount", operator: "gt", value: "100" },
    ];
    expect(evaluateConditions({ logic: "and", rules }, context)).toBe(false);
    expect(evaluateConditions({ logic: "or", rules }, context)).toBe(true);
    expect(evaluateConditions({ logic: "and", rules: [] }, context)).toBe(true);
  });

  test("bad regex is a non-match, not a crash", () => {
    expect(evaluateCondition({ field: "row.status", operator: "matches", value: "[" }, context)).toBe(false);
  });
});

describe("new defaults stay backward compatible", () => {
  test("normalizing an old select config is idempotent and keeps saved values", () => {
    const oldConfig = { label: "Status", options: [{ label: "A", value: "a" }] };
    const first = normalizeWidgetConfig("select", oldConfig);
    const second = normalizeWidgetConfig("select", first.config);
    expect(second.migrations).toHaveLength(0);
    expect(second.config.label).toBe("Status");
    expect(second.config.options).toEqual([{ label: "A", value: "a" }]);
    expect(isNormalizedConfig("select", first.config)).toBe(true);
  });

  test("old table configs keep pagination and search settings", () => {
    const oldConfig = { columns: [{ key: "id" }], pagination: { pageSize: 25 }, searchable: true, striped: false };
    const { config } = normalizeWidgetConfig("table", oldConfig);
    expect(config.pagination.pageSize).toBe(25);
    expect(config.search.enabled).toBe(true);
    expect(config.striped).toBe(false);
  });
});
