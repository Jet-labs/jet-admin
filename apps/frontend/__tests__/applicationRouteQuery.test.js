import {
  createApplicationDefinition,
  parseApplicationRouteQuery,
  validateApplicationDefinition,
} from "@jet-admin/application-contracts";

const route = {
  id: "orders",
  path: "/orders",
  pageAssetKey: "page",
  params: {},
  query: {
    page: { type: "integer", default: 1 },
    tab: { type: "string", default: "all" },
    archived: { type: "boolean" },
    customerID: { type: "uuid" },
  },
};

describe("Application route query declarations", () => {
  it("coerces declared values and applies defaults", () => {
    const result = parseApplicationRouteQuery(
      route,
      new URLSearchParams(
        "page=2&archived=true&customerID=11111111-1111-4111-8111-111111111111&utm=email"
      )
    );
    expect(result).toMatchObject({
      valid: true,
      query: {
        page: 2,
        tab: "all",
        archived: true,
        customerID: "11111111-1111-4111-8111-111111111111",
        utm: "email",
      },
    });
  });

  it("preserves empty strings for string query parameters without defaults", () => {
    const result = parseApplicationRouteQuery(
      { ...route, query: { search: { type: "string" } } },
      new URLSearchParams("search=")
    );
    expect(result).toMatchObject({ valid: true, query: { search: "" } });
  });

  it("rejects invalid typed values", () => {
    expect(
      parseApplicationRouteQuery(route, new URLSearchParams("page=1.5"))
    ).toMatchObject({ valid: false, key: "page" });
    expect(
      parseApplicationRouteQuery(route, new URLSearchParams("archived=yes"))
    ).toMatchObject({ valid: false, key: "archived" });
    expect(
      parseApplicationRouteQuery(route, new URLSearchParams("customerID=nope"))
    ).toMatchObject({ valid: false, key: "customerID" });
  });

  it("validates query defaults against their declared type", () => {
    const asset = [{ assetType: "appPage", assetKey: "page" }];
    const definition = {
      ...createApplicationDefinition(),
      shell: {
        kind: "sidebar",
        homeRouteID: "orders",
        navigation: [{ routeID: "orders", label: "Orders" }],
      },
      routes: [
        {
          id: "orders",
          path: "/orders",
          pageAssetKey: "page",
          params: {},
          query: { page: { type: "integer", default: "not-a-number" } },
        },
      ],
    };
    expect(
      validateApplicationDefinition(definition, asset).diagnostics
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "INVALID_QUERY_DEFAULT" }),
      ])
    );
  });

  it("requires declared query parameters when page-variable sync is enabled", () => {
    const asset = [{ assetType: "appPage", assetKey: "page" }];
    const base = {
      ...createApplicationDefinition(),
      shell: {
        kind: "sidebar",
        homeRouteID: "orders",
        navigation: [{ routeID: "orders", label: "Orders" }],
      },
    };
    const synced = {
      ...base,
      routes: [
        {
          id: "orders",
          path: "/orders",
          pageAssetKey: "page",
          params: {},
          query: { page: { type: "integer", default: 1 } },
          syncPageVariables: true,
        },
      ],
    };
    expect(validateApplicationDefinition(synced, asset).diagnostics).toEqual(
      []
    );

    const unsynced = {
      ...base,
      routes: [
        {
          id: "orders",
          path: "/orders",
          pageAssetKey: "page",
          params: {},
          query: {},
          syncPageVariables: true,
        },
      ],
    };
    expect(
      validateApplicationDefinition(unsynced, asset).diagnostics
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "QUERY_SYNC_WITHOUT_QUERY" }),
      ])
    );
  });
});
