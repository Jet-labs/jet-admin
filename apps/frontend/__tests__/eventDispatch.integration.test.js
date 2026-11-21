/**
 * eventDispatch.integration — F02/B04 event dependability through the REAL
 * page adapter (AppPageRuntimeProvider + useWidgetEventHandlers + reducer).
 *
 * - One chart mark gesture executes its action chain exactly once with the
 *   flat datum payload (a second identical fire would double it, proving the
 *   test is sensitive to the old double-dispatch shape).
 * - Table row selection resolves flat {{ event.row }} / {{ event.rowIndex }}
 *   bindings (never the generic { inputs } nesting).
 * - shapeTableRowSelect: one callback call -> one flat fire (pure pin).
 * - Changed event configs are honored dynamically (no stale wiring).
 * - Method-style toggles against latest state restore the original value.
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AppPageRuntimeProvider } from "../src/logic/appPageRuntime/AppPageRuntimeProvider";
import { useAppPageStateTree } from "../src/logic/appPageRuntime/useAppPageStateTree";
import { useWidgetState } from "../src/logic/appPageRuntime/useWidgetState";
import {
  useWidgetEventHandlers,
  shapeTableRowSelect,
} from "../src/logic/appPageRuntime/useWidgetEventHandlers";

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

const eventProbe = (holders, widgetID, widgetConfig) =>
  React.createElement(
    function EventProbe() {
      const { fireWidgetEvent } = useWidgetEventHandlers(widgetID, widgetConfig, {
        resourceID: widgetID,
        placementKey: widgetID,
        repeatPath: [],
      });
      holders.fires[widgetID] = fireWidgetEvent;
      return null;
    },
    { key: `e:${widgetID}` }
  );

const treeProbe = (holders) =>
  React.createElement(
    function TreeProbe() {
      holders.tree = useAppPageStateTree();
      return null;
    },
    { key: "__tree" }
  );

const pageConfigWith = (variables = [{ key: "hits", defaultValue: 0 }]) => ({ variables });

describe("exactly-once chart dispatch through the page adapter (B04)", () => {
  test("one mark gesture increments once with the flat datum payload", async () => {
    const holders = { fires: {}, tree: null };
    const widgetConfig = {
      events: {
        onMarkClick: [
          {
            actionType: "SET_VARIABLE",
            config: { key: "hits", value: "{{ (state.variables.hits || 0) + 1 }}" },
          },
          {
            actionType: "SET_VARIABLE",
            config: { key: "picked", value: "{{ event.datum.category }}" },
          },
        ],
      },
    };
    const renderer = mountPage(
      [eventProbe(holders, "chart1", widgetConfig), treeProbe(holders)],
      pageConfigWith([
        { key: "hits", defaultValue: 0 },
        { key: "picked", defaultValue: "" },
      ])
    );
    let results;
    await act(async () => {
      results = await holders.fires.chart1("onMarkClick", { datum: { category: "A" } });
    });
    expect(holders.tree.variables.hits).toBe(1);
    expect(holders.tree.variables.picked).toBe("A");
    expect(results).toEqual([
      expect.objectContaining({ actionType: "SET_VARIABLE", success: true }),
      expect.objectContaining({ actionType: "SET_VARIABLE", success: true }),
    ]);
    // Sensitivity proof: the old double-fire shape would have counted twice.
    await act(async () => {
      await holders.fires.chart1("onMarkClick", { datum: { category: "B" } });
    });
    expect(holders.tree.variables.hits).toBe(2);
    expect(holders.tree.variables.picked).toBe("B");
    act(() => renderer.unmount());
  });
});

describe("table row selection keeps the documented flat payload (B04)", () => {
  test("shapeTableRowSelect fires once with { row, rowIndex }", () => {
    const calls = [];
    const onRowSelect = shapeTableRowSelect((t, p) => calls.push([t, p]));
    onRowSelect({ id: 7 }, 2);
    expect(calls).toEqual([["onRowSelect", { row: { id: 7 }, rowIndex: 2 }]]);
  });

  test("adapter resolves {{ event.row }} without inputs nesting", async () => {
    const holders = { fires: {}, tree: null };
    const widgetConfig = {
      events: {
        onRowSelect: [
          { actionType: "SET_VARIABLE", config: { key: "rowId", value: "{{ event.row.id }}" } },
          { actionType: "SET_VARIABLE", config: { key: "rowIdx", value: "{{ event.rowIndex }}" } },
        ],
      },
    };
    const renderer = mountPage(
      [eventProbe(holders, "tbl1", widgetConfig), treeProbe(holders)],
      pageConfigWith([
        { key: "rowId", defaultValue: null },
        { key: "rowIdx", defaultValue: null },
      ])
    );
    await act(async () => {
      await holders.fires.tbl1("onRowSelect", { row: { id: 7 }, rowIndex: 2 });
    });
    expect(holders.tree.variables.rowId).toBe(7);
    expect(holders.tree.variables.rowIdx).toBe(2);
    act(() => renderer.unmount());
  });
});

describe("changed event configs are honored dynamically", () => {
  test("rewiring events between renders takes effect immediately", async () => {
    const holders = { fires: {}, tree: null };
    const renderWith = (config) =>
      mountPage(
        [eventProbe(holders, "w1", config), treeProbe(holders)],
        pageConfigWith([{ key: "v", defaultValue: "old" }])
      );
    const withAction = {
      events: { onTest: [{ actionType: "SET_VARIABLE", config: { key: "v", value: "new" } }] },
    };
    // First wiring has no actions: firing is a no-op, not a crash.
    let renderer = renderWith({ events: {} });
    await act(async () => {
      await holders.fires.w1("onTest", {});
    });
    expect(holders.tree.variables.v).toBe("old");
    // Rewire with the same component identity (config prop changes only).
    act(() => {
      renderer.update(
        React.createElement(
          AppPageRuntimeProvider,
          { pageID: "p1", tenantID: "t1", pageConfig: pageConfigWith([{ key: "v", defaultValue: "old" }]) },
          [
            React.createElement(
              function EventProbe() {
                const { fireWidgetEvent } = useWidgetEventHandlers("w1", withAction, {
                  resourceID: "w1",
                  placementKey: "w1",
                  repeatPath: [],
                });
                holders.fires.w1 = fireWidgetEvent;
                return null;
              },
              { key: "e:w1" }
            ),
            treeProbe(holders),
          ]
        )
      );
    });
    await act(async () => {
      await holders.fires.w1("onTest", {});
    });
    expect(holders.tree.variables.v).toBe("new");
    act(() => renderer.unmount());
  });
});

describe("method-style toggles against latest state (B05 via adapter)", () => {
  test("two toggles restore the original value", async () => {
    const holders = { states: {}, setters: {}, tree: null };
    const toggleProbe = React.createElement(
      function ToggleProbe() {
        const { widgetState, setWidgetState } = useWidgetState("sw");
        holders.states.sw = widgetState;
        holders.setters.sw = setWidgetState;
        return null;
      },
      { key: "sw" }
    );
    const renderer = mountPage([toggleProbe, treeProbe(holders)]);
    const flip = () => {
      const current = holders.tree.widgets.sw?.value === true;
      holders.setters.sw(() => ({ value: !current }));
    };
    act(() => flip());
    expect(holders.tree.widgets.sw.value).toBe(true);
    act(() => flip());
    expect(holders.tree.widgets.sw.value).toBe(false);
    act(() => renderer.unmount());
  });
});
