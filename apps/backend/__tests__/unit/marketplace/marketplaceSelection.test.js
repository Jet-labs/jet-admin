jest.mock("../../../config/prisma.config", () => ({ prisma: {} }));
jest.mock("../../../config/casbin.config", () => ({
  grantCreatorAccess: jest.fn(),
  removePoliciesForResource: jest.fn(),
}));
jest.mock("../../../modules/datasource/datasource.service", () => ({
  encryptOptions: (v) => v,
  decryptOptions: (v) => v,
}));
jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));

const { selectBundleItems } = require("../../../modules/bundle/bundle.service");
const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");

const item = buildCuratedCatalog().find((e) => e.slug === "curated-postgresql-admin-app");
const key = (bundle, type) => {
  const found = bundle.items.find((i) => i.type === type);
  return `${found.type}:${found.id}`;
};

test("omitting a selection installs the complete dependency bundle", () => {
  const result = selectBundleItems(item.payload);
  expect(result.totalCount).toBe(7);
  expect(result.selectedCount).toBe(7);
  expect(result.bundle.items).toHaveLength(7);
  expect(result.selection.every((s) => s.selected)).toBe(true);
});

test("deselecting dependencies is reported while the chosen assets stay selected", () => {
  const pageKey = key(item.payload, "appPage");
  const result = selectBundleItems(item.payload, [pageKey]);
  expect(result.selectedCount).toBe(1);
  expect(result.bundle.items.map((i) => `${i.type}:${i.id}`)).toEqual([pageKey]);
  const page = result.selection.find((s) => s.key === pageKey);
  expect(page.selected).toBe(true);
  expect(page.dependsOn.length).toBeGreaterThan(0);
  expect(page.missingDependencies.length).toBe(page.dependsOn.length);
});

test("selecting the datasource exposes its dependents for optional inclusion", () => {
  const datasourceKey = key(item.payload, "datasource");
  const result = selectBundleItems(item.payload, [datasourceKey]);
  const datasource = result.selection.find((s) => s.key === datasourceKey);
  expect(datasource.selected).toBe(true);
  expect(datasource.requiredBy.length).toBe(2);
  expect(datasource.missingDependencies).toEqual([]);
});

test("unknown and empty asset selections fail closed", () => {
  expect(() => selectBundleItems(item.payload, [])).toThrow(/at least one/i);
  expect(() =>
    selectBundleItems(item.payload, ["widget:00000000-0000-4000-8000-000000000000"])
  ).toThrow(/unknown bundle asset/i);
});
