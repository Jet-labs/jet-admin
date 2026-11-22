/**
 * Unit tests for the committed marketplace template packages.
 *
 * These run without a database and protect package shape, deterministic IDs,
 * parameterized SQL, page/widget references and the role matrix for every
 * template that ships in the catalogue.
 */
const path = require("path");
const { loadPackage, validatePackage } = require("../../../../../marketplace/scripts/validate-templates");
const { loadPackageFromDisk, compileBundle, tablePrefix } = require("../../../../../apps/backend/modules/marketplace/template.package");

const TEMPLATES_ROOT = path.resolve(__dirname, "../../../../../marketplace/templates");
const TEMPLATE_CASES = [
  { slug: "crm-sales-pipeline", alias: "crm", category: "Sales & CRM" },
  { slug: "customer-support-console", alias: "support", category: "Customer Support" },
  { slug: "inventory-replenishment-planner", alias: "inv", category: "Inventory & Operations" },
  { slug: "invoice-matching-desk", alias: "ap", category: "Finance & Accounting" },
];

for (const expected of TEMPLATE_CASES) {
  describe(`${expected.slug} marketplace template package`, () => {
    const pkg = loadPackage(path.join(TEMPLATES_ROOT, expected.slug));

    test("manifest exposes the required catalogue metadata", () => {
      expect(pkg.manifest.slug).toBe(expected.slug);
      expect(pkg.manifest.alias).toBe(expected.alias);
      expect(pkg.manifest.version).toBeTruthy();
      expect(pkg.manifest.category).toBe(expected.category);
      expect(pkg.manifest.screenshots.length).toBeGreaterThan(0);
      expect(pkg.manifest.installOptions.map((option) => option.key)).toEqual(
        expect.arrayContaining(["includeSampleData", "createDemoUsers", "enableAutomation"])
      );
    });

    test("package passes the structural/referential validator", () => {
      const result = validatePackage(pkg);
      expect(result.errors).toEqual([]);
      expect(result.ok).toBe(true);
    });

    test("contains the required counts and feature surfaces", () => {
      expect(pkg.tables.length).toBeGreaterThanOrEqual(8);
      expect(pkg.tables.length).toBeLessThanOrEqual(20);
      expect(pkg.queries.length).toBeGreaterThanOrEqual(30);
      expect(pkg.queries.length).toBeLessThanOrEqual(80);
      expect(pkg.pages.length).toBeGreaterThanOrEqual(12);
      expect(pkg.workflows.length).toBeGreaterThanOrEqual(4);
      expect(pkg.listeners.length).toBeGreaterThanOrEqual(2);
      expect(pkg.cronJobs.length).toBeGreaterThanOrEqual(2);
      expect(pkg.roles.length).toBeGreaterThanOrEqual(4);
      expect(pkg.workflows.some((wf) => wf.nodes.some((node) => node.type === "approval"))).toBe(true);
      expect(pkg.workflows.some((wf) => wf.nodes.some((node) => node.type === "dataCollection"))).toBe(true);
      expect(pkg.pages.some((page) => page.appPageConfig.widgets.some((slot) => slot.widgetKey))).toBe(true);
    });

    test("all SQL is parameterized and keeps table placeholders", () => {
      for (const query of pkg.queries.filter((q) => q.datasource === "primary")) {
        expect(query.options.parameterized).toBe(true);
        expect(query.options.query).not.toMatch(/\{\{\s*inputs\./);
        expect(query.options.query).not.toMatch(/\{\{p:/);
        const max = Math.max(0, ...[...query.options.query.matchAll(/\$(\d+)/g)].map((m) => Number(m[1])));
        expect(max).toBeLessThanOrEqual((query.options.inputDefinitions || []).length);
      }
    });

    test("compiles to a dependency-complete, deterministic Bundle v1", () => {
      const compilerPkg = loadPackageFromDisk(expected.slug);
      const prefix = tablePrefix(compilerPkg.manifest, "11111111-2222-4333-8444-555555555555");
      const bundle = compileBundle(compilerPkg, prefix);
      const again = compileBundle(compilerPkg, prefix);
      expect(again).toEqual(bundle);
      expect(bundle.bundleVersion).toBe(1);
      const types = new Set(bundle.items.map((item) => item.type));
      expect([...types]).toEqual(
        expect.arrayContaining(["datasource", "dataQuery", "widget", "workflow", "appPage", "listener"])
      );
      for (const item of bundle.items) {
        expect(item.id).toMatch(/^[0-9a-f-]{36}$/);
        expect(item.payload).toBeTruthy();
      }
      const listener = bundle.items.find((item) => item.type === "listener");
      expect(listener.dependencies.some((dep) => dep.type === "datasource")).toBe(true);
      const query = bundle.items.find((item) => item.type === "dataQuery");
      expect(query.payload.dataQueryOptions.query).toContain(`"tpl_${expected.alias}_11111111_`);
      expect(query.payload.dataQueryOptions.query).not.toContain("{{table:");
    });
  });
}
