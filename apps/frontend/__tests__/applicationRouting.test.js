import {
  createApplicationDefinition,
  validateApplicationDefinition,
} from "@jet-admin/application-contracts";

const assets = [
  { assetType: "appPage", assetKey: "home-page" },
  { assetType: "appPage", assetKey: "orders-page" },
  { assetType: "appPage", assetKey: "detail-page" },
  { assetType: "appPage", assetKey: "forbidden-page" },
];

const definitionWith = (routes, homeRouteID = routes[0]?.id ?? null) => ({
  ...createApplicationDefinition(),
  shell: {
    kind: "sidebar",
    homeRouteID,
    navigation: routes
      .filter((route) => !route.path.includes(":"))
      .map((route) => ({ routeID: route.id, label: route.id })),
  },
  routes,
});

const codes = (definition) =>
  validateApplicationDefinition(definition, assets).diagnostics.map(
    (diagnostic) => diagnostic.code
  );

describe("Application routing contracts", () => {
  it("defaults routing lifecycle flags and accepts nested child routes", () => {
    const definition = definitionWith([
      {
        id: "orders",
        path: "/orders",
        pageAssetKey: "orders-page",
        title: "Orders",
        params: {},
        query: {},
      },
      {
        id: "order-detail",
        path: "/orders/:orderID",
        pageAssetKey: "detail-page",
        parentRouteID: "orders",
        params: { orderID: "uuid" },
        query: {},
        keepAlive: true,
      },
    ]);
    expect(validateApplicationDefinition(definition, assets).valid).toBe(true);
    expect(codes(definition)).toEqual([]);
  });

  it("rejects unknown parents, cycles, and non-nested child paths", () => {
    expect(
      codes(
        definitionWith([
          {
            id: "orders",
            path: "/orders",
            pageAssetKey: "orders-page",
            parentRouteID: "missing",
            params: {},
            query: {},
          },
        ])
      )
    ).toContain("UNKNOWN_ROUTE_PARENT");

    expect(
      codes(
        definitionWith([
          {
            id: "a",
            path: "/a",
            pageAssetKey: "orders-page",
            parentRouteID: "b",
            params: {},
            query: {},
          },
          {
            id: "b",
            path: "/b",
            pageAssetKey: "detail-page",
            parentRouteID: "a",
            params: {},
            query: {},
          },
        ])
      )
    ).toContain("ROUTE_PARENT_CYCLE");

    expect(
      codes(
        definitionWith([
          {
            id: "orders",
            path: "/orders",
            pageAssetKey: "orders-page",
            params: {},
            query: {},
          },
          {
            id: "detail",
            path: "/other/:orderID",
            pageAssetKey: "detail-page",
            parentRouteID: "orders",
            params: { orderID: "uuid" },
            query: {},
          },
        ])
      )
    ).toContain("NESTED_ROUTE_PATH");
  });

  it("validates guard targets and rejects unsafe redirects", () => {
    expect(
      codes(
        definitionWith([
          {
            id: "secure",
            path: "/secure",
            pageAssetKey: "orders-page",
            params: {},
            query: {},
            guard: {
              expression: "state.application.variables.allowed === true",
              redirectRouteID: "missing",
            },
          },
        ])
      )
    ).toContain("UNKNOWN_GUARD_REDIRECT");

    expect(
      codes(
        definitionWith([
          {
            id: "secure",
            path: "/secure",
            pageAssetKey: "orders-page",
            params: {},
            query: {},
            guard: {
              expression: "false",
              redirectRouteID: "secure",
            },
          },
        ])
      )
    ).toContain("GUARD_REDIRECT_SELF");

    expect(
      codes(
        definitionWith([
          {
            id: "detail",
            path: "/detail/:id",
            pageAssetKey: "detail-page",
            params: { id: "uuid" },
            query: {},
          },
          {
            id: "secure",
            path: "/secure",
            pageAssetKey: "orders-page",
            params: {},
            query: {},
            guard: {
              expression: "false",
              redirectRouteID: "detail",
            },
          },
        ])
      )
    ).toContain("PARAMETERIZED_GUARD_REDIRECT");
  });

  it("validates the configured not-found route", () => {
    const valid = definitionWith([
      {
        id: "home",
        path: "/",
        pageAssetKey: "home-page",
        params: {},
        query: {},
      },
      {
        id: "missing",
        path: "/missing",
        pageAssetKey: "forbidden-page",
        params: {},
        query: {},
      },
    ]);
    valid.shell.notFoundRouteID = "missing";
    expect(codes(valid)).toEqual([]);

    const unknown = {
      ...valid,
      shell: { ...valid.shell, notFoundRouteID: "nope" },
    };
    expect(codes(unknown)).toContain("UNKNOWN_NOT_FOUND_ROUTE");

    const parameterized = definitionWith([
      {
        id: "home",
        path: "/",
        pageAssetKey: "home-page",
        params: {},
        query: {},
      },
      {
        id: "missing",
        path: "/missing/:id",
        pageAssetKey: "forbidden-page",
        params: { id: "uuid" },
        query: {},
      },
    ]);
    parameterized.shell.notFoundRouteID = "missing";
    expect(codes(parameterized)).toContain("PARAMETERIZED_NOT_FOUND_ROUTE");
  });
});
