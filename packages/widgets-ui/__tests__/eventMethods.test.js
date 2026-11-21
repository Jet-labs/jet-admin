/**
 * Event + method dependability (F02; B04/B05/B17/B23).
 *
 * Behavioral coverage through real mounts (react-test-renderer):
 * - chart mark/brush gestures notify the direct callbacks exactly once and
 *   never call the page dispatcher directly (single dispatch route).
 * - checkbox/switch toggles read current state (two toggles restore);
 *   slider methods honor re-rendered bounds and never produce NaN.
 * - select open/close fire once each; clearable control clears.
 * - search clear/setValue cancel pending debounces; IME partial input emits
 *   nothing until commit; timers die on unmount.
 * - swapped callbacks are honored (no initial-closure staleness).
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

global.IS_REACT_ACT_ENVIRONMENT = true;

const mountWidget = async (Component, props) => {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(Component, props));
  });
  return renderer;
};

const harness = async (Component, config, initialState = {}) => {
  let state = { ...initialState };
  const events = [];
  let methods;
  const setWidgetState = (updater) => {
    state = typeof updater === "function" ? { ...state, ...updater(state) } : { ...state, ...updater };
  };
  const renderProps = (fire) => ({
    widgetConfig: config,
    widgetState: state,
    setWidgetState,
    fireWidgetEvent: fire,
    onWidgetInit: (m) => {
      methods = m;
    },
  });
  let fire = (type, payload) => events.push([type, payload]);
  const renderer = await mountWidget(Component, renderProps(fire));
  const refresh = (nextFire) => {
    if (nextFire) fire = nextFire;
    renderer.update(React.createElement(Component, renderProps(fire)));
  };
  return {
    getState: () => state,
    events,
    getMethods: () => methods,
    refresh,
    renderer,
  };
};

describe("chart single dispatch route (B04/E01)", () => {
  // The drill wiring is a pure helper (same code the renderer calls): a fake
  // view drives mark/brush paths with no DOM, embed, or timers involved. The
  // helper accepts no page dispatcher by construction, so a gesture can only
  // ever reach the direct callbacks (the slot owns the single page dispatch).
  const { attachVegaDrillListeners } = require("../src/vega/drillListeners.js");

  const fakeView = () => {
    const clicks = [];
    const signals = {};
    return {
      clicks,
      signals,
      view: {
        addEventListener: (name, fn) => clicks.push([name, fn]),
        addSignalListener: (name, fn) => {
          signals[name] = fn;
        },
        finalize: () => {},
      },
    };
  };

  test("mark click notifies onMarkClick once with the datum", () => {
    const { clicks, view } = fakeView();
    const marks = [];
    attachVegaDrillListeners(view, {}, { onMarkClick: (p) => marks.push(p) });
    expect(clicks.filter(([name]) => name === "click").length).toBe(1);
    const [, onClick] = clicks.find(([name]) => name === "click");
    onClick({}, { datum: { category: "A" } });
    expect(marks).toEqual([{ datum: { category: "A" } }]);
    // Datum-less clicks notify nothing at all.
    onClick({}, {});
    onClick({}, null);
    expect(marks.length).toBe(1);
  });

  test("brush signal notifies onBrush once with the raw value", () => {
    const { signals, view } = fakeView();
    const brushes = [];
    const seen = [];
    attachVegaDrillListeners(
      view,
      { params: [{ name: "brush" }, { name: "other" }] },
      {
        onBrush: (p) => brushes.push(p),
        onSignal: (name, value) => seen.push([name, value]),
      }
    );
    signals.brush("brush", [1, 2]);
    expect(brushes).toEqual([{ value: [1, 2] }]);
    expect(seen).toEqual([["brush", [1, 2]]]);
    signals.other("other", 7);
    expect(seen).toEqual([
      ["brush", [1, 2]],
      ["other", 7],
    ]);
    expect(brushes.length).toBe(1);
  });

  test("missing view or throwing listeners never break the page", () => {
    expect(() => attachVegaDrillListeners(null, {}, {})).not.toThrow();
    expect(() =>
      attachVegaDrillListeners(
        {
          addEventListener: () => {
            throw new Error("old vega");
          },
        },
        {},
        { onMarkClick: () => {} }
      )
    ).not.toThrow();
  });
});

describe("current-state toggles (B05/E17/E19)", () => {
  const { SwitchWidget } = require("../src/switch/switchWidget.jsx");
  const { CheckboxWidget } = require("../src/checkbox/checkboxWidget.jsx");

  test("two switch toggles return to the original value", async () => {
    const h = await harness(SwitchWidget, { label: "S" });
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(true);
    h.refresh();
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(false);
    expect(h.events).toEqual([
      ["onChange", { value: true }],
      ["onChange", { value: false }],
    ]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("two checkbox toggles return to the original value", async () => {
    const h = await harness(CheckboxWidget, { label: "C" });
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(true);
    h.refresh();
    await act(async () => {
      h.getMethods().toggle();
    });
    expect(h.getState().value).toBe(false);
    await act(async () => {
      h.renderer.unmount();
    });
  });
});

describe("slider honors current bounds, never NaN (B05/E20)", () => {
  const { SliderWidget } = require("../src/slider/sliderWidget.jsx");

  test("methods use re-rendered min/max and reject non-finite input", async () => {
    let state = {};
    const events = [];
    let methods;
    const propsFor = (config) => ({
      widgetConfig: config,
      widgetState: state,
      setWidgetState: (updater) => {
        state = typeof updater === "function" ? { ...state, ...updater(state) } : { ...state, ...updater };
      },
      fireWidgetEvent: (t, p) => events.push([t, p]),
      onWidgetInit: (m) => {
        methods = m;
      },
    });
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        React.createElement(SliderWidget, propsFor({ min: 0, max: 100 }))
      );
    });
    await act(async () => {
      methods.setValue(200);
    });
    expect(state.value).toBe(100);
    // Non-finite input resolves to min, never NaN.
    await act(async () => {
      methods.setValue("abc");
    });
    expect(state.value).toBe(0);
    expect(Number.isNaN(state.value)).toBe(false);
    // Changed bounds apply to later method calls (no initial closure).
    await act(async () => {
      renderer.update(React.createElement(SliderWidget, propsFor({ min: 10, max: 50 })));
    });
    await act(async () => {
      methods.setValue(200);
    });
    expect(state.value).toBe(50);
    await act(async () => {
      methods.clear();
    });
    expect(state.value).toBe(10);
    await act(async () => {
      renderer.unmount();
    });
  });
});

describe("dynamic callbacks are honored (B05)", () => {
  const { TextInputWidget } = require("../src/text-input/textInputWidget.jsx");

  test("methods use the latest fireWidgetEvent after a prop swap", async () => {
    const h = await harness(TextInputWidget, { label: "N" });
    const first = [];
    const second = [];
    h.refresh((t, p) => first.push([t, p]));
    h.refresh((t, p) => second.push([t, p]));
    await act(async () => {
      h.getMethods().setValue("hi");
    });
    expect(first).toEqual([]);
    expect(second).toEqual([["onChange", { value: "hi" }]]);
    await act(async () => {
      h.renderer.unmount();
    });
  });
});

describe("select open/close/clear behavior (B17/E15)", () => {
  const { SelectWidget } = require("../src/select/selectWidget.jsx");
  const { Select } = require("@jet-admin/ui");

  test("open and close each fire once with the current value", async () => {
    const h = await harness(SelectWidget, {
      options: [{ label: "A", value: "a" }],
    });
    const root = h.renderer.root.findByType(Select);
    await act(async () => {
      root.props.onOpenChange(true);
    });
    await act(async () => {
      root.props.onOpenChange(false);
    });
    const opens = h.events.filter(([t]) => t === "onOpen");
    const closes = h.events.filter(([t]) => t === "onClose");
    expect(opens.length).toBe(1);
    expect(closes.length).toBe(1);
    expect(opens[0][1]).toEqual({ value: "" });
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("clearable control clears; non-clearable shows no control", async () => {
    const h = await harness(SelectWidget, {
      options: [{ label: "A", value: "a" }],
      clearable: true,
    });
    await act(async () => {
      h.getMethods().setValue("a");
    });
    h.refresh();
    const clearBtn = h.renderer.root.findByProps({ "aria-label": "Clear selection" });
    await act(async () => {
      clearBtn.props.onClick({ stopPropagation: () => {} });
    });
    expect(h.getState().value).toBe("");
    expect(h.events).toContainEqual(["onClear", { value: "" }]);

    const plain = await harness(SelectWidget, {
      options: [{ label: "A", value: "a" }],
    });
    await act(async () => {
      plain.getMethods().setValue("a");
    });
    plain.refresh();
    expect(plain.renderer.root.findAllByProps({ "aria-label": "Clear selection" })).toEqual([]);
    await act(async () => {
      h.renderer.unmount();
      plain.renderer.unmount();
    });
  });
});

describe("search debounce races and IME (B23/E21)", () => {
  const { SearchInputWidget } = require("../src/search-input/searchInputWidget.jsx");

  const searchTerms = (events) => events.filter(([t]) => t === "onSearch").map(([, p]) => p.searchTerm);

  test("clear before debounce never emits the stale term", async () => {
    const h = await harness(SearchInputWidget, { debounceMs: 40 });
    const input = h.renderer.root.findByType("input");
    await act(async () => {
      input.props.onChange({ target: { value: "abc" } });
    });
    await act(async () => {
      h.getMethods().clear();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 120));
    });
    // Only the explicit empty search from clear(); "abc" must never surface.
    expect(searchTerms(h.events)).toEqual([""]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("setValue cancels a pending keystroke search", async () => {
    const h = await harness(SearchInputWidget, { debounceMs: 40 });
    const input = h.renderer.root.findByType("input");
    await act(async () => {
      input.props.onChange({ target: { value: "abc" } });
    });
    await act(async () => {
      h.getMethods().setValue("z");
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 120));
    });
    expect(searchTerms(h.events)).toEqual(["z"]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("IME composition emits nothing until commit", async () => {
    const h = await harness(SearchInputWidget, { debounceMs: 30 });
    const input = h.renderer.root.findByType("input");
    await act(async () => {
      input.props.onCompositionStart();
      input.props.onChange({ target: { value: "k" } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 90));
    });
    expect(searchTerms(h.events)).toEqual([]);
    await act(async () => {
      input.props.onCompositionEnd({ target: { value: "ka" } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 90));
    });
    expect(searchTerms(h.events)).toEqual(["ka"]);
    await act(async () => {
      h.renderer.unmount();
    });
  });

  test("unmount cancels the pending search", async () => {
    const h = await harness(SearchInputWidget, { debounceMs: 30 });
    const input = h.renderer.root.findByType("input");
    await act(async () => {
      input.props.onChange({ target: { value: "abc" } });
      h.renderer.unmount();
    });
    await new Promise((r) => setTimeout(r, 90));
    expect(searchTerms(h.events)).toEqual([]);
  });
});

describe("method cleanup on unmount", () => {
  const { SwitchWidget } = require("../src/switch/switchWidget.jsx");

  test("unmount is quiet and timers do not fire afterwards", async () => {
    const h = await harness(SwitchWidget, { label: "S" });
    await act(async () => {
      h.getMethods().setValue(true);
    });
    expect(h.getState().value).toBe(true);
    await act(async () => {
      h.renderer.unmount();
    });
    expect(h.events).toEqual([["onChange", { value: true }]]);
  });
});
