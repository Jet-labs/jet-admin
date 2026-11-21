/**
 * widgetState.integration — B01 / F01 functional-update portion.
 *
 * Uses the ACTUAL runtime/provider integration (AppPageRuntimeProvider with
 * its real useReducer + contexts + useWidgetState), not a mocked useState.
 * A local React-state mock would resolve updaters in the test itself and hide
 * the original defect (reducer spreading the function). Here every update
 * flows through dispatch -> appPageReducer -> rebuilt state tree.
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AppPageRuntimeProvider } from "../src/logic/appPageRuntime/AppPageRuntimeProvider";
import { useWidgetState } from "../src/logic/appPageRuntime/useWidgetState";
import { useAppPageStateTree } from "../src/logic/appPageRuntime/useAppPageStateTree";
import { useWidgetMethodRegistry } from "../src/logic/appPageRuntime/useWidgetMethodRegistry";
import { resolveValue } from "../src/logic/evaluationEngine";

global.IS_REACT_ACT_ENVIRONMENT = true;

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

// Captures live hook values on every render without mocking state.
const createHarness = (widgetIDs) => {
  const holders = { states: {}, setters: {}, tree: null };
  const probes = widgetIDs.map((widgetID) =>
    React.createElement(
      function Probe() {
        const { widgetState, setWidgetState } = useWidgetState(widgetID);
        const { registerWidgetMethods } = useWidgetMethodRegistry(widgetID);
        React.useEffect(() => {
          registerWidgetMethods({ ping: () => true });
        }, [registerWidgetMethods]);
        holders.states[widgetID] = widgetState;
        holders.setters[widgetID] = setWidgetState;
        return null;
      },
      { key: widgetID }
    )
  );
  const treeProbe = React.createElement(
    function TreeProbe() {
      holders.tree = useAppPageStateTree();
      return null;
    },
    { key: "__tree" }
  );
  return { holders, children: [...probes, treeProbe] };
};

describe("widgetState provider integration (B01)", () => {
  test("object patch preserves unrelated keys", () => {
    const { holders, children } = createHarness(["w1"]);
    mountPage(children);
    act(() => holders.setters.w1({ a: 1 }));
    act(() => holders.setters.w1({ b: 2 }));
    expect(holders.states.w1).toEqual({ a: 1, b: 2 });
    expect(holders.tree.widgets.w1).toEqual({ a: 1, b: 2 });
  });

  test("functional update reads the current committed state", () => {
    const { holders, children } = createHarness(["counter"]);
    mountPage(children);
    act(() => holders.setters.counter({ count: 0 }));
    act(() => holders.setters.counter((prev) => ({ count: prev.count + 1 })));
    act(() => holders.setters.counter((prev) => ({ count: prev.count + 1 })));
    expect(holders.states.counter.count).toBe(2);
    expect(holders.tree.widgets.counter.count).toBe(2);
  });

  test("two sequential toggles return to the original value", () => {
    const { holders, children } = createHarness(["sw"]);
    mountPage(children);
    act(() => holders.setters.sw({ value: false }));
    expect(holders.tree.widgets.sw.value).toBe(false);
    // Capture the setter once to prove we do not rely on a stale render closure.
    const toggle = holders.setters.sw;
    const flip = (prev) => ({ ...prev, value: !prev.value });
    act(() => toggle(flip));
    expect(holders.tree.widgets.sw.value).toBe(true);
    act(() => toggle(flip));
    expect(holders.tree.widgets.sw.value).toBe(false);
    expect(holders.states.sw).toEqual({ value: false });
  });

  test("typing/selecting changes state.widgets.<id>.value", () => {
    const { holders, children } = createHarness(["name"]);
    mountPage(children);
    // Exact text-input call shape: setWidgetState((prev) => ({ ...prev, value: v }))
    act(() => holders.setters.name((prev) => ({ ...prev, value: "Ada" })));
    expect(holders.tree.widgets.name.value).toBe("Ada");
    act(() => holders.setters.name((prev) => ({ ...prev, value: "Grace" })));
    expect(holders.tree.widgets.name.value).toBe("Grace");
  });

  test("another widget bound to that value updates", () => {
    const { holders, children } = createHarness(["source", "sibling"]);
    mountPage(children);
    act(() => holders.setters.source((prev) => ({ ...prev, value: "Ada" })));
    // Sibling binding resolves against the same committed state tree.
    expect(resolveValue("{{ state.widgets.source.value }}", holders.tree)).toBe("Ada");
    act(() => holders.setters.source((prev) => ({ ...prev, value: "Grace" })));
    expect(resolveValue("{{ state.widgets.source.value }}", holders.tree)).toBe("Grace");
    // Sibling's own state is untouched by the source update.
    expect(holders.states.sibling).toEqual({});
  });

  test("date picker object patches still work", () => {
    const { holders, children } = createHarness(["date1"]);
    mountPage(children);
    // Mirrors DatePickerWidget.updateState + popover wiring (object form).
    act(() => holders.setters.date1({ value: "2026-01-15", date: "2026-01-15", time: "" }));
    expect(holders.tree.widgets.date1).toMatchObject({ value: "2026-01-15", date: "2026-01-15" });
    act(() => holders.setters.date1({ isOpen: true }));
    expect(holders.tree.widgets.date1).toMatchObject({ value: "2026-01-15", isOpen: true });
    act(() => holders.setters.date1({ isOpen: false }));
    expect(holders.tree.widgets.date1.isOpen).toBe(false);
    // Clear preserves the documented empty shape.
    act(() => holders.setters.date1({ value: "", date: "", time: "", isOpen: false }));
    expect(holders.tree.widgets.date1).toEqual({ value: "", date: "", time: "", isOpen: false });
  });

  test("unmount/remount and independent widgets behave as documented", () => {
    const holders = { states: {}, setters: {}, tree: null };
    const renderProbes = (showA) => {
      const nodes = [];
      if (showA) {
        nodes.push(
          React.createElement(
            function ProbeA() {
              const { widgetState, setWidgetState } = useWidgetState("wA");
              const { registerWidgetMethods } = useWidgetMethodRegistry("wA");
              React.useEffect(() => {
                registerWidgetMethods({ ping: () => true });
              }, [registerWidgetMethods]);
              holders.states.wA = widgetState;
              holders.setters.wA = setWidgetState;
              return null;
            },
            { key: "wA" }
          )
        );
      }
      nodes.push(
        React.createElement(
          function ProbeB() {
            const { widgetState, setWidgetState } = useWidgetState("wB");
            holders.states.wB = widgetState;
            holders.setters.wB = setWidgetState;
            return null;
          },
          { key: "wB" }
        )
      );
      nodes.push(
        React.createElement(
          function TreeProbe() {
            holders.tree = useAppPageStateTree();
            return null;
          },
          { key: "__tree" }
        )
      );
      return nodes;
    };

    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          renderProbes(true)
        )
      );
    });
    act(() => holders.setters.wA((p) => ({ ...p, value: "A1" })));
    act(() => holders.setters.wB((p) => ({ ...p, value: "B1" })));
    expect(holders.tree.widgets.wA.value).toBe("A1");
    expect(holders.tree.widgets.wB.value).toBe("B1");

    // Unmount wA: its method-registry cleanup dispatches UNREGISTER_WIDGET,
    // which by design removes both methods and widget state for wA only.
    act(() => {
      renderer.update(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          renderProbes(false)
        )
      );
    });
    expect(holders.tree.widgets.wA).toBeUndefined();
    expect(holders.tree.widgets.wB.value).toBe("B1");

    // Remount starts fresh (no resurrection of the unmounted draft).
    act(() => {
      renderer.update(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: {} },
          renderProbes(true)
        )
      );
    });
    expect(holders.states.wA).toEqual({});
    expect(holders.tree.widgets.wB.value).toBe("B1");
    act(() => renderer.unmount());
  });
});
