import { buildApplicationRouteTarget } from "../src/logic/applicationRuntime/applicationNavigation";

const basePath = "/tenants/t1/applications/a1/run/production";
const routes = [
  { id: "home", path: "/" },
  { id: "orders", path: "/orders/:orderID" },
  {
    id: "customer",
    path: "/customers/:customerID/section/:section",
    params: { customerID: "uuid", section: "string" },
  },
  { id: "count", path: "/count/:value", params: { value: "integer" } },
];

describe("Application navigation targets", () => {
  it("builds static and parameterized paths under the runtime base path", () => {
    expect(
      buildApplicationRouteTarget({ routes, routeID: "home", basePath }).path
    ).toBe(`${basePath}/`);
    expect(
      buildApplicationRouteTarget({
        routes,
        routeID: "orders",
        params: { orderID: "A 100/blue" },
        basePath,
      }).path
    ).toBe(`${basePath}/orders/A%20100%2Fblue`);
  });

  it("serializes primitive query values and skips null/undefined", () => {
    const target = buildApplicationRouteTarget({
      routes,
      routeID: "orders",
      params: { orderID: "A-100" },
      query: { tab: "items", page: 2, archived: false, empty: null, missing: undefined },
      basePath,
    });
    expect(target.path).toBe(
      `${basePath}/orders/A-100?tab=items&page=2&archived=false`
    );
  });

  it("validates required, unknown, and typed route parameters", () => {
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "orders",
        params: {},
        basePath,
      })
    ).toThrow(/requires parameter/);
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "orders",
        params: { orderID: "1", extra: "x" },
        basePath,
      })
    ).toThrow(/no path parameter/);
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "customer",
        params: { customerID: "not-a-uuid", section: "items" },
        basePath,
      })
    ).toThrow(/invalid parameter/);
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "count",
        params: { value: "1.5" },
        basePath,
      })
    ).toThrow(/invalid parameter/);
  });

  it("validates declared route query types when navigating", () => {
    const typedRoutes = [
      {
        id: "orders",
        path: "/orders",
        query: {
          page: { type: "integer", default: 1 },
          archived: { type: "boolean" },
        },
      },
    ];
    expect(
      buildApplicationRouteTarget({
        routes: typedRoutes,
        routeID: "orders",
        query: { page: 2, archived: true },
        basePath,
      }).path
    ).toBe(`${basePath}/orders?page=2&archived=true`);
    expect(() =>
      buildApplicationRouteTarget({
        routes: typedRoutes,
        routeID: "orders",
        query: { page: 1.5 },
        basePath,
      })
    ).toThrow(/must be an integer/);
    expect(() =>
      buildApplicationRouteTarget({
        routes: typedRoutes,
        routeID: "orders",
        query: { archived: "yes" },
        basePath,
      })
    ).toThrow(/must be true or false/);
  });

  it("rejects unknown routes and non-primitive query values", () => {
    expect(() =>
      buildApplicationRouteTarget({ routes, routeID: "missing", basePath })
    ).toThrow(/not part of this application release/);
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "orders",
        params: { orderID: "1" },
        query: { ["__proto__"]: "x" },
        basePath,
      })
    ).toThrow(/non-empty and short/);
    expect(() =>
      buildApplicationRouteTarget({
        routes,
        routeID: "orders",
        params: { orderID: "1" },
        query: { filter: { status: "open" } },
        basePath,
      })
    ).toThrow(/must be a string, number, or boolean/);
  });
});
