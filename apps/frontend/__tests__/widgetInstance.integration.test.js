/**
 * widgetInstance.integration — B24 + F01 instance identity, F12 repeat scope.
 *
 * Pure unit locks for the identity contract plus provider integration through
 * the REAL AppPageRuntimeProvider (real useReducer + contexts + hooks), so a
 * mocked local-state harness cannot hide duplicate-placement collisions.
 *
 * Widget-type coverage is exercised through the same hooks every renderer
 * uses (useWidgetState/useWidgetMethodRegistry/useWidgetEventHandlers) with
 * the state shapes of forms, checkboxes, tabs and a method caller — slot
 * isolation itself is widget-agnostic (verified via deriveSlotIdentity).
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AppPageRuntimeProvider } from "../src/logic/appPageRuntime/AppPageRuntimeProvider";
import { useWidgetState } from "../src/logic/appPageRuntime/useWidgetState";
import { useAppPageStateTree } from "../src/logic/appPageRuntime/useAppPageStateTree";
import { useWidgetMethodRegistry } from "../src/logic/appPageRuntime/useWidgetMethodRegistry";
import { useWidgetEventHandlers } from "../src/logic/appPageRuntime/useWidgetEventHandlers";
import { buildAppPageStateTree } from "../src/logic/appPageRuntime/appPageExpressionEngine";
import { appPageReducer, createAppPageInitialState } from "../src/logic/appPageRuntime/appPageReducer";
import { appPageActions } from "../src/logic/appPageRuntime/appPageActions";
import { resolveValue } from "../src/logic/evaluationEngine";
import {
  buildIterationWidgetsView,
  deriveSlotIdentity,
  groupInstancesByResource,
  parseResourceID,
  remapPlacementResource,
  resolveLegacyWidgetReference,
} from "../src/logic/appPageRuntime/widgetInstanceIdentity";

global.IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Pure identity contract
// ---------------------------------------------------------------------------

describe("widgetInstanceIdentity (pure)", () => {
  test("parseResourceID handles legacy, placement and repeat keys", () => {
    expect(parseResourceID("widget_123")).toBe("123");
    expect(parseResourceID("widget_123_4")).toBe("123");
    expect(parseResourceID("widget_123_1700000000")).toBe("123");
    expect(parseResourceID("widget_123_4::repeat:row1:0")).toBe("123");
    expect(parseResourceID("")).toBe("");
    expect(parseResourceID(null)).toBe("");
    expect(parseResourceID(undefined)).toBe("");
  });

  test("deriveSlotIdentity splits resource vs placement vs repeat deterministically", () => {
    expect(deriveSlotIdentity("widget_42_7", [])).toEqual({
      resourceID: "42",
      placementKey: "widget_42_7",
      repeatPath: [],
      instanceID: "widget_42_7",
    });
    const a = deriveSlotIdentity("widget_42_7", ["rowA:0"]);
    const b = deriveSlotIdentity("widget_42_7", ["rowA:1"]);
    expect(a.instanceID).not.toBe(b.instanceID);
    expect(parseResourceID(a.instanceID)).toBe("42");
    expect(parseResourceID(b.instanceID)).toBe("42");
    // Deterministic: same inputs, same instance.
    expect(deriveSlotIdentity("widget_42_7", ["rowA:0"]).instanceID).toBe(a.instanceID);
  });

  test("resolveLegacyWidgetReference never picks an arbitrary placement", () => {
    const live = ["widget_9_1", "widget_9_2"];
    expect(resolveLegacyWidgetReference("widget_9_1", live)).toEqual({
      kind: "instance",
      instanceID: "widget_9_1",
      ref: "widget_9_1",
    });
    expect(resolveLegacyWidgetReference("9", ["widget_9_1"])).toMatchObject({
      kind: "instance",
      instanceID: "widget_9_1",
    });
    expect(resolveLegacyWidgetReference("9", [])).toMatchObject({ kind: "missing" });
    const ambiguous = resolveLegacyWidgetReference("9", live);
    expect(ambiguous.kind).toBe("ambiguous");
    expect(ambiguous.candidates.sort()).toEqual(["widget_9_1", "widget_9_2"]);
    expect(ambiguous.instanceID).toBeUndefined();
  });

  test("buildIterationWidgetsView scopes bare refs to the firing iteration", () => {
    const globalWidgets = {
      "widget_5_1::repeat:row:0": { value: "zero" },
      "widget_5_1::repeat:row:1": { value: "one" },
    };
    const view = buildIterationWidgetsView({
      globalWidgets,
      placementKey: "widget_5_1",
      resourceID: "5",
      instanceID: "widget_5_1::repeat:row:1",
      solePlacementForResource: true,
    });
    expect(view["widget_5_1::repeat:row:0"].value).toBe("zero");
    expect(view["widget_5_1"].value).toBe("one");
    expect(view["5"].value).toBe("one");
    // Global object untouched.
    expect(globalWidgets["widget_5_1"]).toBeUndefined();
  });

  test("import/export remap preserves placement suffixes (backend contract)", () => {
    expect(remapPlacementResource("widget_11_4", "99")).toBe("widget_99_4");
    expect(remapPlacementResource("widget_11_1700000000", "99")).toBe("widget_99_1700000000");
    // Repeat suffixes are runtime-only and never persisted, so remap leaves them alone.
    expect(remapPlacementResource("not-a-key", "99")).toBe("not-a-key");
    const groups = groupInstancesByResource(["widget_99_4", "widget_99_9"]);
    expect(groups).toEqual({ 99: ["widget_99_4", "widget_99_9"] });
  });
});

// ---------------------------------------------------------------------------
// Provider integration harness (real runtime, no state mocks)
// ---------------------------------------------------------------------------

const mountPage = (children, pageConfig = {}) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        AppPageRuntimeProvider,
        { pageID: "p1", tenantID: "t1", pageConfig },
        children
      )
    );
  });
  return renderer;
};

// Stable component types at module scope: renderer.update() then preserves
// sibling mounts by type+key. Inline definitions would remount every probe on
// each update and falsely wipe sibling state/methods.
function InstanceProbe({ instanceID, holders, methods }) {
  const { widgetState, setWidgetState } = useWidgetState(instanceID);
  const { registerWidgetMethods } = useWidgetMethodRegistry(instanceID);
  const methodsRef = React.useRef(methods);
  methodsRef.current = methods;
  React.useEffect(() => {
    if (methodsRef.current) registerWidgetMethods(methodsRef.current);
  }, [registerWidgetMethods, instanceID]);
  holders.states[instanceID] = widgetState;
  holders.setters[instanceID] = setWidgetState;
  return null;
}

function CallerProbe({ instanceID, holders, widgetConfig, identity }) {
  const { fireWidgetEvent } = useWidgetEventHandlers(instanceID, widgetConfig, identity);
  holders.fires[instanceID] = fireWidgetEvent;
  return null;
}

function TreeWatcher({ holders }) {
  holders.tree = useAppPageStateTree();
  return null;
}

/** Probe bound to an explicit runtime instance ID (as AppPageWidgetSlot does). */
const createInstanceHarness = (instanceIDs) => {
  const holders = { states: {}, setters: {}, methods: {}, tree: null, fires: {} };
  const probes = instanceIDs.map((instanceID) =>
    React.createElement(InstanceProbe, {
      key: instanceID,
      instanceID,
      holders,
      methods: { ping: () => true },
    })
  );
  const treeProbe = React.createElement(TreeWatcher, { key: "__tree", holders });
  return { holders, children: [...probes, treeProbe] };
};

describe("duplicate placements share nothing (B24 reproduction)", () => {
  test("one saved widget placed twice: isolated form state, sibling-safe unmount", () => {
    const a = deriveSlotIdentity("widget_77_1", []).instanceID;
    const b = deriveSlotIdentity("widget_77_2", []).instanceID;
    expect(parseResourceID(a)).toBe(parseResourceID(b));

    const holders = { states: {}, setters: {}, tree: null, fires: {} };
    const renderAll = (showA) => {
      const nodes = [];
      if (showA) {
        nodes.push(
          React.createElement(InstanceProbe, {
            key: `A:${a}`,
            instanceID: a,
            holders,
            methods: { clear: () => true },
          })
        );
      }
      nodes.push(
        React.createElement(InstanceProbe, {
          key: `B:${b}`,
          instanceID: b,
          holders,
          methods: { clear: () => true },
        })
      );
      nodes.push(React.createElement(TreeWatcher, { key: "__tree", holders }));
      return nodes;
    };

    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          renderAll(true)
        )
      );
    });
    // Form-like drafts diverge per placement.
    act(() => holders.setters[a]((p) => ({ ...p, values: { name: "Ada" } })));
    act(() => holders.setters[b]((p) => ({ ...p, values: { name: "Grace" } })));
    expect(holders.tree.widgets[a].values).toEqual({ name: "Ada" });
    expect(holders.tree.widgets[b].values).toEqual({ name: "Grace" });
    expect(holders.tree.widgets[a]).not.toBe(holders.tree.widgets[b]);

    // Removing placement A must not unregister B's methods or erase B's state.
    act(() => {
      renderer.update(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          renderAll(false)
        )
      );
    });
    expect(holders.tree.widgets[a]).toBeUndefined();
    expect(holders.tree.widgets[b].values).toEqual({ name: "Grace" });
    expect(typeof holders.tree.widgetMethods[b].clear).toBe("function");
    expect(holders.tree.widgetMethods[a]).toBeUndefined();
    act(() => renderer.unmount());
  });

  test("legacy resource binding: singleton aliases, duplicates stay undefined with diagnostics", () => {
    const a = deriveSlotIdentity("widget_78_1", []).instanceID;
    const { holders, children } = createInstanceHarness([a]);
    mountPage(children);
    act(() => holders.setters[a]((p) => ({ ...p, value: "solo" })));
    // Singleton: legacy resource ref is deterministic.
    expect(holders.tree.widgets["78"].value).toBe("solo");
    expect(holders.tree.widgets["78"]).toBe(holders.tree.widgets[a]);
    expect(holders.tree.widgetDiagnostics.ambiguousWidgetResources["78"]).toBeUndefined();
    // Explicit instance form always works.
    expect(resolveValue(`{{ state.widgets.${a}.value }}`, holders.tree)).toBe("solo");

    // Duplicate the placement (same resource, second instance).
    let s = createAppPageInitialState();
    s = appPageReducer(s, appPageActions.setWidgetState(a, { value: "solo" }));
    const b = deriveSlotIdentity("widget_78_2", []).instanceID;
    s = appPageReducer(s, appPageActions.setWidgetState(b, { value: "other" }));
    const tree = buildAppPageStateTree(s, []);
    expect(tree.widgets[a].value).toBe("solo");
    expect(tree.widgets[b].value).toBe("other");
    // No silent reroute: legacy ref is undefined + diagnosed with both candidates.
    expect(tree.widgets["78"]).toBeUndefined();
    expect(tree.widgetDiagnostics.ambiguousWidgetResources["78"].sort()).toEqual([a, b].sort());
  });
});

describe("checkboxes and tabs isolate per placement", () => {
  test("two checkboxes from one resource toggle independently", () => {
    const a = deriveSlotIdentity("widget_21_1", []).instanceID;
    const b = deriveSlotIdentity("widget_21_2", []).instanceID;
    const { holders, children } = createInstanceHarness([a, b]);
    mountPage(children);
    act(() => holders.setters[a]((p) => ({ ...p, value: false })));
    act(() => holders.setters[b]((p) => ({ ...p, value: false })));
    const flip = (prev) => ({ ...prev, value: !prev.value });
    act(() => holders.setters[a](flip));
    expect(holders.tree.widgets[a].value).toBe(true);
    expect(holders.tree.widgets[b].value).toBe(false);
    act(() => holders.setters[a](flip));
    expect(holders.tree.widgets[a].value).toBe(false);
  });

  test("two tab bars from one resource keep separate selection", () => {
    const a = deriveSlotIdentity("widget_24_1", []).instanceID;
    const b = deriveSlotIdentity("widget_24_2", []).instanceID;
    const { holders, children } = createInstanceHarness([a, b]);
    mountPage(children);
    act(() => holders.setters[a]((p) => ({ ...p, value: "overview" })));
    act(() => holders.setters[b]((p) => ({ ...p, value: "activity" })));
    act(() => holders.setters[a]((p) => ({ ...p, value: "settings" })));
    expect(holders.tree.widgets[a].value).toBe("settings");
    expect(holders.tree.widgets[b].value).toBe("activity");
  });
});

describe("method caller respects instance identity", () => {
  const registerTarget = (holders, instanceID, fn) =>
    React.createElement(InstanceProbe, {
      key: `t:${instanceID}`,
      instanceID,
      holders,
      methods: { activate: fn },
    });

  const mountCaller = (holders, callerID, widgetConfig) =>
    React.createElement(CallerProbe, {
      key: `c:${callerID}`,
      instanceID: callerID,
      holders,
      widgetConfig,
      identity: {
        resourceID: parseResourceID(callerID),
        placementKey: callerID,
        repeatPath: [],
      },
    });

  test("exact instance target invokes once; ambiguous legacy target warns and skips", async () => {
    const calls = [];
    const a = "widget_31_1";
    const b = "widget_31_2";
    const caller = "widget_99_1";
    const holders = { states: {}, setters: {}, tree: null, fires: {} };
    // NOTE: capture warnings via a manual console.warn patch. The usual
    // jest spy helper trips this repo's esbuild-jest babel pre-transform path,
    // so it is deliberately avoided in this suite.
    const originalWarn = console.warn;
    const warned = [];
    console.warn = (...args) => {
      warned.push(args.map(String).join(" "));
    };
    try {
      let renderer;
      const configFor = (target) => ({
        events: {
          onTest: [{ actionType: "CALL_WIDGET_METHOD", config: { targetWidgetID: target, methodName: "activate", inputs: [] } }],
        },
      });
      act(() => {
        renderer = TestRenderer.create(
          React.createElement(
            AppPageRuntimeProvider,
            { pageID: "p1", tenantID: "t1", pageConfig: {} },
            [
              registerTarget(holders, a, () => calls.push("a")),
              registerTarget(holders, b, () => calls.push("b")),
              mountCaller(holders, caller, configFor(a)),
              React.createElement(TreeWatcher, { key: "__t", holders }),
            ]
          )
        );
      });
      await act(async () => {
        await holders.fires[caller]("onTest", {});
      });
      expect(calls).toEqual(["a"]);

      // Ambiguous legacy resource target: must warn naming candidates, call nothing.
      calls.length = 0;
      act(() => {
        renderer.update(
          React.createElement(
            AppPageRuntimeProvider,
            { pageID: "p1", tenantID: "t1", pageConfig: {} },
            [
              registerTarget(holders, a, () => calls.push("a")),
              registerTarget(holders, b, () => calls.push("b")),
              mountCaller(holders, caller, configFor("31")),
              React.createElement(TreeWatcher, { key: "__t", holders }),
            ]
          )
        );
      });
      await act(async () => {
        await holders.fires[caller]("onTest", {});
      });
      expect(calls).toEqual([]);
      const ambiguousWarnings = warned.filter((line) => line.includes("ambiguous target"));
      expect(ambiguousWarnings.length).toBeGreaterThan(0);
      expect(String(ambiguousWarnings[0])).toMatch(/widget_31_1/);
      expect(String(ambiguousWarnings[0])).toMatch(/widget_31_2/);
      act(() => renderer.unmount());
    } finally {
      console.warn = originalWarn;
    }
  });

  test("legacy singleton target still resolves (backward compat)", async () => {
    const calls = [];
    const a = "widget_32_1";
    const caller = "widget_99_2";
    const holders = { states: {}, setters: {}, tree: null, fires: {} };
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          [
            registerTarget(holders, a, () => calls.push("a")),
            mountCaller(holders, caller, {
              events: {
                onTest: [{ actionType: "CALL_WIDGET_METHOD", config: { targetWidgetID: "32", methodName: "activate", inputs: [] } }],
              },
            }),
          ]
        )
      );
    });
    await act(async () => {
      await holders.fires[caller]("onTest", {});
    });
    expect(calls).toEqual(["a"]);
    act(() => renderer.unmount());
  });
});

describe("repeated layout isolates iterations (F12)", () => {
  test("same placement repeated over rows keeps per-iteration form drafts", () => {
    const i0 = deriveSlotIdentity("widget_55_3", ["rowX:0"]).instanceID;
    const i1 = deriveSlotIdentity("widget_55_3", ["rowX:1"]).instanceID;
    expect(i0).not.toBe(i1);
    const { holders, children } = createInstanceHarness([i0, i1]);
    mountPage(children);
    act(() => holders.setters[i0]((p) => ({ ...p, values: { qty: 1 } })));
    act(() => holders.setters[i1]((p) => ({ ...p, values: { qty: 5 } })));
    expect(holders.tree.widgets[i0].values).toEqual({ qty: 1 });
    expect(holders.tree.widgets[i1].values).toEqual({ qty: 5 });
    // Global bare placement ref is NOT silently shared: iteration view scopes it.
    const view = buildIterationWidgetsView({
      globalWidgets: holders.tree.widgets,
      placementKey: "widget_55_3",
      resourceID: "55",
      instanceID: i1,
      solePlacementForResource: true,
    });
    expect(view["widget_55_3"].values).toEqual({ qty: 5 });
    expect(view["55"].values).toEqual({ qty: 5 });
  });
});
