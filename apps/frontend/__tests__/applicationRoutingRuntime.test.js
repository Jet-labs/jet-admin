import {
  applicationRouteGuardRedirect,
  evaluateApplicationRouteGuard,
} from "../src/logic/applicationRuntime/applicationGuards";
import {
  createPageStateCache,
  snapshotPageState,
} from "../src/logic/appPageRuntime/appPageStateCache";

describe("application route guards", () => {
  const context = {
    application: { variables: { allowed: true, blocked: false } },
    route: { id: "secure", params: {}, query: {} },
  };

  it("admits only literal true results", () => {
    expect(
      evaluateApplicationRouteGuard(
        { expression: "state.application.variables.allowed" },
        context
      )
    ).toBe(true);
    expect(
      evaluateApplicationRouteGuard(
        { expression: "state.application.variables.blocked" },
        context
      )
    ).toBe(false);
    expect(
      evaluateApplicationRouteGuard(
        { expression: "state.application.variables.allowed === false" },
        context
      )
    ).toBe(false);
    expect(
      evaluateApplicationRouteGuard({ expression: "not valid syntax {{" }, context)
    ).toBe(false);
  });

  it("returns the configured redirect only when the guard fails", () => {
    const routes = [
      { id: "secure", path: "/secure" },
      { id: "denied", path: "/denied" },
    ];
    expect(
      applicationRouteGuardRedirect(
        { guard: { expression: "true", redirectRouteID: "denied" } },
        routes,
        context
      )
    ).toBe(null);
    expect(
      applicationRouteGuardRedirect(
        { guard: { expression: "false", redirectRouteID: "denied" } },
        routes,
        context
      )
    ).toMatchObject({ id: "denied", path: "/denied" });
  });
});

describe("page state cache", () => {
  it("restores recent entries and evicts the oldest", () => {
    const cache = createPageStateCache({ limit: 2 });
    cache.set("a", { variables: { a: 1 } });
    cache.set("b", { variables: { b: 1 } });
    expect(cache.get("a")).toMatchObject({ variables: { a: 1 } });
    cache.set("c", { variables: { c: 1 } });
    expect(cache.get("b")).toBe(null);
    expect(cache.get("a")).toMatchObject({ variables: { a: 1 } });
    expect(cache.get("c")).toMatchObject({ variables: { c: 1 } });
  });

  it("drops widget method functions from snapshots", () => {
    const snapshot = snapshotPageState({
      variables: { page: 1 },
      widgetStates: { widget: { selected: "row" } },
      widgetMethods: { widget: { focus: () => {} } },
    });
    expect(snapshot).not.toHaveProperty("widgetMethods");
    expect(snapshot).toMatchObject({
      variables: { page: 1 },
      widgetStates: { widget: { selected: "row" } },
    });
  });
});
