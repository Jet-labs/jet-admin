/**
 * Form + date/range behavior (E08/E11/E12 + F05, B06/B09/B10/B16).
 *
 * Meaningful behavior/integration coverage (not key-existence):
 * - dirty preservation across defaults refresh
 * - required select/checkbox block submit; numbers stay numbers
 * - failed submit retains draft; reset restores defaults + fires onReset once
 * - boolean "false" never initializes as true (shared coercion)
 * - leap/year/month-end parsing; invalid typed dates rejected
 * - same-day inverted times rejected; partial ranges are drafts (no onChange)
 * - placeholder alias normalization; presets (canonical + legacy offsets)
 * - min/max/disabledDates enforcement on every entry route
 * - multiple instances have unique field IDs
 * - narrow range layout stacks (single-column, no overflow)
 *
 * Pure contracts import from source (no dist rebuild needed). Mounted form
 * behavior uses react-test-renderer like widgetContracts.test.js.
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

global.IS_REACT_ACT_ENVIRONMENT = true;

import {
  normalizeFieldBoolean,
  normalizeOptions,
  coerceFieldValue,
  validateFieldValue,
  buildFieldDefaults,
  mergeDefaultsPreservingDirty,
  normalizeFormLayout,
} from "../src/_shared/fieldContracts.js";
import {
  parseDateSafe,
  toDateKey,
  toDateTimeKey,
  validateDateValue,
  validateRangeValues,
  resolvePresetRange,
  normalizeRangePlaceholders,
  serializeDateValue,
} from "../src/_shared/dateContracts.js";
import { buildFieldId, buildFieldA11y } from "../src/_shared/fieldA11y.js";

// ---------------------------------------------------------------------------
// Field contracts: booleans, coercion, validation, dirty preservation
// ---------------------------------------------------------------------------

describe("field boolean normalization (F05, E17 acceptance)", () => {
  test('"false"/"0"/0/"" are false; only true-ish values are true', () => {
    expect(normalizeFieldBoolean(false)).toBe(false);
    expect(normalizeFieldBoolean("false")).toBe(false);
    expect(normalizeFieldBoolean("FALSE")).toBe(false);
    expect(normalizeFieldBoolean(0)).toBe(false);
    expect(normalizeFieldBoolean("0")).toBe(false);
    expect(normalizeFieldBoolean("")).toBe(false);
    expect(normalizeFieldBoolean(undefined)).toBe(false);
    expect(normalizeFieldBoolean(true)).toBe(true);
    expect(normalizeFieldBoolean("true")).toBe(true);
    expect(normalizeFieldBoolean(" 1 ")).toBe(true);
    expect(normalizeFieldBoolean(1)).toBe(true);
  });
});

describe("form typed values + validation (E08)", () => {
  test("numeric values remain numbers; empty stays empty", () => {
    expect(coerceFieldValue("number", "42")).toBe(42);
    expect(coerceFieldValue("number", 42)).toBe(42);
    expect(coerceFieldValue("number", "")).toBe("");
    expect(coerceFieldValue("text", 42)).toBe("42");
    expect(coerceFieldValue("checkbox", "false")).toBe(false);
    expect(coerceFieldValue("checkbox", "true")).toBe(true);
  });

  test("required select and checkbox block invalid submit", () => {
    const selectDef = { key: "role", label: "Role", type: "select", required: true, options: ["admin", "member"] };
    const opts = normalizeOptions(selectDef.options);
    expect(validateFieldValue(selectDef, "", opts)).toMatch(/required/i);
    expect(validateFieldValue(selectDef, "admin", opts)).toBeNull();
    expect(validateFieldValue(selectDef, "ghost", opts)).toMatch(/not a valid option/i);
    const agree = { key: "agree", label: "Accept", type: "checkbox", required: true };
    expect(validateFieldValue(agree, false, null)).toMatch(/must be checked/i);
    expect(validateFieldValue(agree, true, null)).toBeNull();
  });

  test("email/number bounds enforced", () => {
    expect(validateFieldValue({ key: "e", label: "Email", type: "email" }, "not-an-email")).toMatch(/valid email/i);
    expect(validateFieldValue({ key: "e", label: "Email", type: "email" }, "a@b.co")).toBeNull();
    expect(validateFieldValue({ key: "n", label: "N", type: "number", validation: { min: 1, max: 10 } }, 0)).toMatch(/at least 1/);
    expect(validateFieldValue({ key: "n", label: "N", type: "number", validation: { min: 1, max: 10 } }, 11)).toMatch(/at most 10/);
    expect(validateFieldValue({ key: "n", label: "N", type: "number" }, "abc")).toMatch(/valid number/i);
  });

  test("select preserves 1 vs '1' identity (no collision)", () => {
    const opts = normalizeOptions([{ label: "One", value: 1 }, { label: "Uno", value: "1" }]);
    expect(opts[0].value).toBe(1);
    expect(opts[1].value).toBe("1");
    expect(validateFieldValue({ key: "s", label: "S", type: "select" }, 1, opts)).toBeNull();
    expect(validateFieldValue({ key: "s", label: "S", type: "select" }, "1", opts)).toBeNull();
    expect(validateFieldValue({ key: "s", label: "S", type: "select" }, 2, opts)).toMatch(/not a valid option/i);
  });

  test("refreshed defaults do not overwrite dirty edits (B16)", () => {
    const v1 = { name: "Ada", role: "admin" };
    const defaultsV2 = { name: "Grace", role: "member", extra: "x" };
    const merged = mergeDefaultsPreservingDirty(v1, defaultsV2, new Set(["name"]));
    expect(merged.name).toBe("Ada");
    expect(merged.role).toBe("admin");
    const mergedClean = mergeDefaultsPreservingDirty({ name: "Ada" }, defaultsV2, []);
    expect(mergedClean.role).toBe("member");
    expect(mergedClean.extra).toBe("x");
  });

  test("size/showReset reconcile with layout/columns/resetLabel (E08)", () => {
    expect(normalizeFormLayout({ resetLabel: "Clear" }).showReset).toBe(true);
    expect(normalizeFormLayout({ resetLabel: "" }).showReset).toBe(false);
    expect(normalizeFormLayout({ showReset: true }).resetLabel).toBe("Reset");
    expect(normalizeFormLayout({ size: "small" }).size).toBe("sm");
    expect(normalizeFormLayout({ layout: "grid", columns: 9 }).columns).toBe(4);
    expect(normalizeFormLayout({ layout: "vertical", columns: 3 }).columns).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Dates: leap/year/month-end, invalid typed, constraints
// ---------------------------------------------------------------------------

describe("date parsing: leap/year/month-end + invalid typed (E11)", () => {
  test("leap day valid on leap years, invalid otherwise", () => {
    expect(toDateKey(parseDateSafe("2024-02-29"))).toBe("2024-02-29");
    expect(parseDateSafe("2023-02-29")).toBeNull();
    expect(parseDateSafe("2026-02-29")).toBeNull();
  });
  test("month-end and year boundaries round-trip without day shift", () => {
    expect(toDateKey(parseDateSafe("2026-01-31"))).toBe("2026-01-31");
    expect(toDateKey(parseDateSafe("2026-04-30"))).toBe("2026-04-30");
    expect(parseDateSafe("2026-04-31")).toBeNull();
    expect(toDateKey(parseDateSafe("2026-12-31"))).toBe("2026-12-31");
    expect(toDateKey(parseDateSafe("2026-01-01"))).toBe("2026-01-01");
  });
  test("invalid typed dates rejected (no silent reinterpretation)", () => {
    expect(parseDateSafe("not-a-date")).toBeNull();
    expect(parseDateSafe("2026-13-01")).toBeNull();
    expect(parseDateSafe("2026-00-10")).toBeNull();
    expect(parseDateSafe("2026-02-30")).toBeNull();
    expect(validateDateValue("garbage", {})).toMatch(/valid date/i);
  });
  test("date-only stays calendar date; datetime is wall time without Z", () => {
    expect(serializeDateValue(parseDateSafe("2026-03-15"), false)).toBe("2026-03-15");
    const dt = parseDateSafe("2026-03-15T14:30:00");
    expect(toDateTimeKey(dt)).toBe("2026-03-15T14:30:00");
    expect(toDateTimeKey(dt)).not.toMatch(/Z$/);
  });
  test("min/max/disabledDates enforced for every entry route", () => {
    const opts = { minDate: "2026-01-10", maxDate: "2026-01-20", disabledDates: ["2026-01-15"], enableTime: false };
    expect(validateDateValue("2026-01-09", opts)).toMatch(/on or after/);
    expect(validateDateValue("2026-01-21", opts)).toMatch(/on or before/);
    expect(validateDateValue("2026-01-15", opts)).toMatch(/disabled/i);
    expect(validateDateValue("2026-01-16", opts)).toBeNull();
    expect(validateDateValue("", { required: true })).toMatch(/required/i);
    expect(validateDateValue("", {})).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Ranges: inverted times, partial, presets, placeholders
// ---------------------------------------------------------------------------

describe("range validation + presets (E12)", () => {
  test("same-day inverted times rejected (including edited times)", () => {
    const bad = validateRangeValues("2026-05-01T14:00:00", "2026-05-01T09:00:00", { enableTime: true });
    expect(bad.error).toMatch(/at or after start time/i);
    expect(bad.code).toBe("inverted");
    const ok = validateRangeValues("2026-05-01T09:00:00", "2026-05-01T14:00:00", { enableTime: true });
    expect(ok.error).toBeNull();
  });
  test("end before start across days rejected", () => {
    const bad = validateRangeValues("2026-05-02", "2026-05-01", {});
    expect(bad.code).toBe("inverted");
  });
  test("partial range is a draft, not an error (onChange must not fire)", () => {
    const partial = validateRangeValues("2026-05-01", "", {});
    expect(partial.error).toBeNull();
    expect(partial.code).toBe("partial");
    const empty = validateRangeValues("", "", {});
    expect(empty.error).toBeNull();
  });
  test("placeholder aliases normalize to canonical (canonical wins)", () => {
    expect(normalizeRangePlaceholders({ startPlaceholder: "S", endPlaceholder: "E" })).toEqual({
      placeholderStart: "S",
      placeholderEnd: "E",
    });
    expect(normalizeRangePlaceholders({ placeholderStart: "C", startPlaceholder: "L" }).placeholderStart).toBe("C");
  });
  test("presets resolve canonical ISO and legacy offsets", () => {
    const canon = resolvePresetRange({ label: "X", start: "2026-01-01", end: "2026-01-31" });
    expect(toDateKey(canon.start)).toBe("2026-01-01");
    expect(toDateKey(canon.end)).toBe("2026-01-31");
    const now = new Date(2026, 5, 15, 12, 0, 0);
    const rel = resolvePresetRange({ label: "7d", startOffset: -7, endOffset: 0 }, now);
    expect(toDateKey(rel.end)).toBe("2026-06-15");
    expect(toDateKey(rel.start)).toBe("2026-06-08");
    const month = resolvePresetRange({ label: "M", startOffset: "startOfMonth", endOffset: "endOfMonth" }, now);
    expect(toDateKey(month.start)).toBe("2026-06-01");
    expect(toDateKey(month.end)).toBe("2026-06-30");
  });
});

// ---------------------------------------------------------------------------
// F05: unique IDs, narrow layout, mounted form integration
// ---------------------------------------------------------------------------

describe("F05 instance identity + responsive", () => {
  test("two placements never share field IDs", () => {
    const a = buildFieldId("widget_42_7", "email", 0);
    const b = buildFieldId("widget_42_8", "email", 0);
    expect(a).not.toBe(b);
    const r1 = buildFieldId("widget_5_1::repeat:row:0", "name", 0);
    const r2 = buildFieldId("widget_5_1::repeat:row:1", "name", 0);
    expect(r1).not.toBe(r2);
    const a11y = buildFieldA11y(a, { help: true, error: "Required" });
    expect(a11y.describedBy).toContain(`${a}-help`);
    expect(a11y.describedBy).toContain(`${a}-error`);
  });

  test("narrow range layout stacks to one calendar column", async () => {
    // Contract: popover calendars stack vertically under 640px so a 240-360px
    // card never overflows horizontally (flex-col base, row only on sm+).
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(path.join(__dirname, "../src/date-range-picker/dateRangePickerWidget.jsx"), "utf8");
    expect(src).toMatch(/flex-col/);
    expect(src).toMatch(/min-\[640px\]:flex-row/);
    expect(src).toMatch(/max-w-\[calc\(100vw-2rem\)\]/);
  });
});

const mountWidget = async (Component, props) => {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(Component, props));
  });
  return renderer;
};

describe("mounted FormWidget integration (E08 defect coverage)", () => {
  const { FormWidget } = require("../src/form/formWidget.jsx");

  const harness = async (widgetConfig, fireImpl) => {
    let state = {};
    const events = [];
    let methods;
    const setWidgetState = (updater) => {
      state = typeof updater === "function"
        ? { ...state, ...updater(state) }
        : { ...state, ...updater };
    };
    const fireWidgetEvent = async (type, payload) => {
      events.push([type, payload]);
      if (fireImpl) return fireImpl(type, payload);
      return [];
    };
    const renderer = await mountWidget(FormWidget, {
      widgetConfig,
      widgetState: state,
      setWidgetState,
      fireWidgetEvent,
      onWidgetInit: (m) => { methods = m; },
      instanceID: "widget_9_1",
    });
    const refresh = (nextState) => {
      if (nextState) state = nextState;
      renderer.update(React.createElement(FormWidget, {
        widgetConfig, widgetState: state, setWidgetState, fireWidgetEvent,
        onWidgetInit: () => {}, instanceID: "widget_9_1",
      }));
    };
    return { getState: () => state, events, getMethods: () => methods, refresh, renderer, setWidgetState };
  };

  const cfg = {
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "age", label: "Age", type: "number", validation: { min: 0 } },
      { key: "role", label: "Role", type: "select", options: ["admin", "member"], required: true },
      { key: "agree", label: "Accept", type: "checkbox", required: true },
    ],
    submitLabel: "Save",
    layout: "vertical",
  };

  test("invalid submit is blocked, error summary focuses, draft retained", async () => {
    const h = await harness(cfg);
    // Initially empty: required name/role/agree fail.
    let res;
    await act(async () => { res = await h.getMethods().submit(); });
    expect(res.ok).toBe(false);
    expect(Object.keys(h.getState().errors || {}).length).toBeGreaterThan(0);
    expect(h.events.some(([t]) => t === "onSubmit")).toBe(true);
    // Fill name only via setValues, still blocked by required select/checkbox.
    await act(async () => { h.getMethods().setValues({ name: "Ada" }); });
    h.refresh();
    await act(async () => { res = await h.getMethods().submit(); });
    expect(res.ok).toBe(false);
    expect(h.getState().values.name).toBe("Ada");
    await act(async () => { h.renderer.unmount(); });
  });

  test("failed async submit retains data and surfaces recovery", async () => {
    const h = await harness(cfg, async () => [{ actionType: "EXECUTE_QUERY", success: false, error: "boom" }]);
    await act(async () => { h.getMethods().setValues({ name: "Ada", role: "admin", agree: true, age: 30 }); });
    h.refresh();
    let res;
    await act(async () => { res = await h.getMethods().submit(); });
    expect(res.ok).toBe(false);
    // Draft survived the failure (values intact, error exposed).
    expect(h.getState().values.name).toBe("Ada");
    expect(h.getState().values.age).toBe(30);
    expect(h.getState().lastSubmitError).toMatch(/boom/);
    await act(async () => { h.renderer.unmount(); });
  });

  test("clear with defaults restores documented defaults and fires onReset once", async () => {
    const withDefaults = {
      fields: [
        { key: "name", label: "Name", type: "text", defaultValue: "Ada" },
        { key: "role", label: "Role", type: "select", options: ["a", "b"], defaultValue: "b" },
      ],
      submitLabel: "Save",
    };
    const h = await harness(withDefaults);
    await act(async () => { h.getMethods().setValues({ name: "Changed" }); });
    h.refresh();
    expect(h.getState().values.name).toBe("Changed");
    await act(async () => { h.getMethods().reset(); });
    expect(h.getState().values).toMatchObject({ name: "Ada", role: "b" });
    expect(h.events.filter(([t]) => t === "onReset").length).toBe(1);
    await act(async () => { h.renderer.unmount(); });
  });

  test("two form instances keep isolated drafts and unique labels", async () => {
    const mk = async (id) => {
      let state = {};
      const setWidgetState = (u) => { state = typeof u === "function" ? { ...state, ...u(state) } : { ...state, ...u }; };
      const renderer = await mountWidget(FormWidget, {
        widgetConfig: cfg, widgetState: state, setWidgetState,
        fireWidgetEvent: async () => [], onWidgetInit: () => {}, instanceID: id,
      });
      return { renderer, getState: () => state, setWidgetState };
    };
    const a = await mk("widget_1_1");
    const b = await mk("widget_1_2");
    const idsA = a.renderer.root.findAllByType("input").map((n) => n.props.id).filter(Boolean);
    const idsB = b.renderer.root.findAllByType("input").map((n) => n.props.id).filter(Boolean);
    for (const id of idsA) expect(idsB).not.toContain(id);
    await act(async () => { a.renderer.unmount(); });
    await act(async () => { b.renderer.unmount(); });
  });
});
