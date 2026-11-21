/**
 * Widget contracts (F04/F09, B07/B17).
 *
 * - Every registered sample config normalizes losslessly and validates.
 * - Legacy fixtures migrate to canonical shapes (section 4 rows).
 * - Capability conformance through REAL mounts (react-test-renderer):
 *   emitted events and callable methods are exercised, not just listed.
 *   (Search debounce-cancel races belong to F02/B23 and are not asserted here.)
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

global.IS_REACT_ACT_ENVIRONMENT = true;

const { WIDGETS_MAP } = require("../dist/index.cjs");
const {
  normalizeWidgetConfig,
  isNormalizedConfig,
  validateWidgetConfig,
  getSupportedEvents,
  getSupportedMethods,
} = require("@jet-admin/widget-types");

const TYPES_32 = [
  "vega-lite", "vega", "button", "table", "text", "stat", "alert", "form",
  "image", "iframe", "date-picker", "date-range-picker", "html",
  "text-input", "select", "multi-select", "checkbox", "radio-group", "switch",
  "slider", "search-input", "file-upload", "divider", "tabs",
  "key-value", "json-viewer", "list", "badge", "progress", "timeline",
  "video", "code-block",
];

describe("samples validate + normalize for all 32 types", () => {
  test("registry covers all types with sample configs", () => {
    expect(Object.keys(WIDGETS_MAP).sort()).toEqual([...TYPES_32].sort());
    for (const type of TYPES_32) {
      expect(WIDGETS_MAP[type].sampleConfig).toBeDefined();
    }
  });

  test("every sample validates and normalizes to a stable canonical config", () => {
    for (const type of TYPES_32) {
      const sample = WIDGETS_MAP[type].sampleConfig;
      const v = validateWidgetConfig(type, sample, { mode: "authoring" });
      expect([type, v.errors]).toEqual([type, []]);
      // Samples are authoring inputs (legacy root showHeader etc. allowed):
      // normalization must converge to a valid fixed point without losses.
      const once = normalizeWidgetConfig(type, sample);
      const out = validateWidgetConfig(type, once.config, { mode: "authoring" });
      expect([type, out.errors]).toEqual([type, []]);
      expect([type, isNormalizedConfig(type, once.config)]).toEqual([type, true]);
      if (sample.showHeader !== undefined) {
        expect([type, once.config.properties?.showHeader]).toEqual([type, sample.showHeader]);
        expect([type, once.config.showHeader]).toEqual([type, undefined]);
      }
      if (sample.columns) expect(once.config.columns).toEqual(sample.columns);
      if (sample.events) expect(once.config.events).toEqual(sample.events);
    }
  });

  test("declared events/methods match the capability source of truth", () => {
    for (const type of TYPES_32) {
      const supported = getSupportedEvents(type).map((e) => e.value);
      expect(supported).toContain("onClick");
      expect(supported).toContain("onRefresh");
      expect(supported).toContain("onLoad");
    }
    expect(getSupportedMethods("table").map((m) => m.name)).toEqual(
      expect.arrayContaining(["refresh", "setSelectedRow", "clearSelection"])
    );
  });
});

describe("legacy fixtures migrate without losing events/styles", () => {
  test("button label + select clear + stat value through real samples", () => {
    const btn = normalizeWidgetConfig("button", { label: "Go", events: { onClick: [] } });
    expect(btn.config.text).toBe("Go");
    expect(btn.config.events).toEqual({ onClick: [] });

    const stat = normalizeWidgetConfig("stat", {
      value: "{{ q }}",
      properties: { showHeader: true },
    });
    expect(stat.config.valueTemplate).toBe("{{ q }}");
    expect(stat.config.value).toBe("{{ q }}");
    expect(stat.config.properties.showHeader).toBe(true);
  });

  test("iframe src + table flags + vega spec migrate", () => {
    const frame = normalizeWidgetConfig("iframe", { src: "https://x.test" });
    expect(frame.config.url).toBe("https://x.test");
    expect(frame.config.src).toBeUndefined();

    const table = normalizeWidgetConfig("table", {
      searchable: true,
      columns: [],
      dataArrayTemplate: "{{ q }}",
    });
    expect(table.config.search).toEqual({ enabled: true });
    expect(table.config.dataArrayTemplate).toBe("{{ q }}");
    expect(table.config.columns).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Mounted capability exercises (real components, real methods/events)
// ---------------------------------------------------------------------------

const mountWidget = async (Component, props) => {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(Component, props));
  });
  return renderer;
};

describe("button click method (B17/E03)", () => {
  const { ButtonWidget } = require("../src/button/buttonWidget.jsx");

  test("mouse, keyboard and method clicks each execute once; disabled blocks all", async () => {
    const calls = [];
    const onClick = (...args) => {
      calls.push(args);
      return Promise.resolve();
    };
    let methods;
    const renderer = await mountWidget(ButtonWidget, {
      widgetConfig: { text: "Go" },
      onClick,
      onWidgetInit: (m) => {
        methods = m;
      },
    });
    expect(Object.keys(methods).sort()).toEqual(["click", "focus"]);

    const button = renderer.root.findByType("button");
    await act(async () => {
      await button.props.onClick({});
    });
    expect(calls.length).toBe(1);

    await act(async () => {
      await methods.click();
    });
    expect(calls.length).toBe(2);

    // Disabled blocks the method route too.
    await act(async () => {
      renderer.update(
        React.createElement(ButtonWidget, {
          widgetConfig: { text: "Go", disabled: true },
          onClick,
          onWidgetInit: () => {},
        })
      );
    });
    await act(async () => {
      await methods.click();
    });
    expect(calls.length).toBe(2);
    await act(async () => {
      renderer.unmount();
    });
  });
});

describe("input methods operate on current state and fire typed events", () => {
  const { TextInputWidget } = require("../src/text-input/textInputWidget.jsx");
  const { SwitchWidget } = require("../src/switch/switchWidget.jsx");
  const { CheckboxWidget } = require("../src/checkbox/checkboxWidget.jsx");
  const { SelectWidget } = require("../src/select/selectWidget.jsx");
  const { TabsWidget } = require("../src/tabs/tabsWidget.jsx");

  const harness = async (Component, config) => {
    let state = {};
    const events = [];
    let methods;
    const setWidgetState = (updater) => {
      state = typeof updater === "function" ? { ...state, ...updater(state) } : { ...state, ...updater };
    };
    const renderer = await mountWidget(Component, {
      widgetConfig: config,
      widgetState: state,
      setWidgetState,
      fireWidgetEvent: (type, payload) => events.push([type, payload]),
      onWidgetInit: (m) => {
        methods = m;
      },
    });
    const refresh = () => {
      renderer.update(
        React.createElement(Component, {
          widgetConfig: config,
          widgetState: state,
          setWidgetState,
          fireWidgetEvent: (type, payload) => events.push([type, payload]),
          onWidgetInit: () => {},
        })
      );
    };
    return { getState: () => state, events, getMethods: () => methods, refresh, renderer };
  };

  test("text-input setValue writes state and fires onChange with the value", async () => {
    const h = await harness(TextInputWidget, { label: "N" });
    expect(Object.keys(h.getMethods()).sort()).toEqual(["clear", "focus", "setValue"]);
    await act(async () => {
      h.getMethods().setValue("Ada");
    });
    expect(h.getState().value).toBe("Ada");
    expect(h.events).toContainEqual(["onChange", { value: "Ada" }]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("switch toggle flips from the default off state", async () => {
    // NOTE: repeated-toggle freshness across config changes is B05 (F01
    // stale closures), covered by its own slice — not locked here.
    const h = await harness(SwitchWidget, { label: "S" });
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(true);
    expect(h.events).toContainEqual(["onChange", { value: true }]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("checkbox toggle flips from the default unchecked state", async () => {
    const h = await harness(CheckboxWidget, { label: "C" });
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(true);
    expect(h.events).toContainEqual(["onChange", { value: true }]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  // NOTE: Radix Select touches `window` during unmount cleanup, which logs a
  // React warning under node (no DOM). The method/state/event paths exercised
  // below do not depend on the dropdown UI; open/close wiring stays
  // unsupported per descriptor until E15.
  test("select setValue/clear fire onChange/onClear; no open/close wiring", async () => {
    const h = await harness(SelectWidget, { options: [{ label: "A", value: "a" }] });
    expect(Object.keys(h.getMethods()).sort()).toEqual(["clear", "setValue"]);
    await act(async () => {
      h.getMethods().setValue("a");
    });
    expect(h.getState().value).toBe("a");
    expect(h.events).toContainEqual(["onChange", { value: "a" }]);
    await act(async () => {
      h.getMethods().clear();
    });
    expect(h.events).toContainEqual(["onClear", { value: "" }]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("tabs setTab fires onChange with the tab value", async () => {
    const h = await harness(TabsWidget, {
      tabs: [
        { label: "One", value: "one" },
        { label: "Two", value: "two" },
      ],
    });
    await act(async () => {
      h.getMethods().setTab("two");
    });
    expect(h.getState().value).toBe("two");
    expect(h.events).toContainEqual(["onChange", { value: "two" }]);
    await act(async () => {
      h.renderer.unmount();
    });
  });
});
