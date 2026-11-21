/**
 * Tests the scenario-first marketplace seeder contract with mock Prisma only.
 * No database, .env, container, filesystem or browser access is used here.
 */
const mockBuildCuratedCatalog = jest.fn();
const mockValidateCuratedCatalog = jest.fn();
const mockPrismaConfigLoad = jest.fn();
const mockDotenvConfig = jest.fn();

jest.mock("../../../scripts/catalog/curatedMarketplace", () => ({
  buildCuratedCatalog: mockBuildCuratedCatalog,
}));
jest.mock("../../../scripts/catalog/validateCuratedMarketplace", () => ({
  validateCuratedCatalog: mockValidateCuratedCatalog,
}));
jest.mock("../../../config/prisma.config", () => {
  mockPrismaConfigLoad();
  return { prisma: { __source: "config/prisma.config" } };
});
jest.mock("dotenv", () => ({ config: mockDotenvConfig }));

const { main, statsFor } = require("../../../scripts/seed-marketplace");

const GENERATOR = "marketplace-catalog";

function readPath(value, path) {
  return path.reduce((cursor, key) => (cursor == null ? undefined : cursor[key]), value);
}

function matchesFilter(value, filter) {
  if (filter && typeof filter === "object" && !Array.isArray(filter)) {
    if (Array.isArray(filter.path) && Object.prototype.hasOwnProperty.call(filter, "equals")) {
      return readPath(value, filter.path) === filter.equals;
    }
    if (Array.isArray(filter.in)) return filter.in.includes(value);
    return Object.entries(filter).every(([key, condition]) => matchesFilter(value?.[key], condition));
  }
  return value === filter;
}

function rowMatches(row, where) {
  return Object.entries(where).every(([key, filter]) => matchesFilter(row[key], filter));
}

function clone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

/** Small in-memory Prisma double with only the delegates the seeder uses. */
function createFakePrisma(initialRows = []) {
  const rows = new Map(initialRows.map((row) => [row.slug, clone(row)]));
  const tblMarketplaceItem = {
    findUnique: jest.fn(async ({ where }) => (rows.has(where.slug) ? clone(rows.get(where.slug)) : null)),
    upsert: jest.fn(async ({ where, create, update }) => {
      if (rows.has(where.slug)) {
        const next = { ...rows.get(where.slug), ...clone(update) };
        rows.set(where.slug, next);
        return clone(next);
      }
      const next = clone(create);
      if (!next.itemID) next.itemID = `generated-${rows.size + 1}`;
      rows.set(where.slug, next);
      return clone(next);
    }),
    findMany: jest.fn(async ({ where, select }) => {
      const matched = [...rows.values()].filter((row) => rowMatches(row, where));
      if (!select) return matched.map(clone);
      return matched.map((row) => Object.fromEntries(Object.keys(select).map((key) => [key, row[key]])));
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const matched = [...rows.values()].filter((row) => rowMatches(row, where));
      matched.forEach((row) => Object.assign(row, clone(data)));
      return { count: matched.length };
    }),
    count: jest.fn(async () => rows.size),
    delete: jest.fn(async () => ({})),
    deleteMany: jest.fn(async () => ({ count: 0 })),
  };
  return { prisma: { tblMarketplaceItem }, rows };
}

let fixtureCounter = 0;

function basePayload() {
  return {
    bundleVersion: 1,
    generator: GENERATOR,
    marketplace: { setup: ["configure the scenario"], root: { type: "widget", id: "w1" } },
    items: [{ type: "widget", id: "w1", payload: { widgetTitle: "Fixture widget" } }],
  };
}

function catalogItem(overrides = {}) {
  fixtureCounter += 1;
  const slug = overrides.slug || `fixture-${fixtureCounter}`;
  return {
    itemID: overrides.itemID || `00000000-0000-4000-8000-${String(fixtureCounter).padStart(12, "0")}`,
    slug,
    itemType: "widget",
    title: `Title ${slug}`,
    description: `Description ${slug}`,
    category: "demo",
    tags: ["integration", "curated-v2"],
    icon: null,
    iconColor: "#2563eb",
    publisher: "jet-admin",
    version: "2.0.0",
    payload: basePayload(),
    isVerified: false,
    installCount: 0,
    sourceFamily: "curated-playbooks",
    publishedByUserID: null,
    ...overrides,
  };
}

function catalogRow(item, overrides = {}) {
  return { ...clone(item), ...overrides };
}

let consoleSpy;

beforeEach(() => {
  fixtureCounter = 0;
  mockBuildCuratedCatalog.mockReturnValue([]);
  mockValidateCuratedCatalog.mockReturnValue({ entries: 0, valid: true });
  consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("dry-run", () => {
  test("reports counts without loading dotenv, Prisma, or mutating a database", async () => {
    const catalog = [
      catalogItem({ slug: "one", itemType: "widget" }),
      catalogItem({ slug: "two", itemType: "workflow" }),
      catalogItem({ slug: "three", itemType: "workflow" }),
    ];
    mockBuildCuratedCatalog.mockReturnValue(catalog);
    const { prisma } = createFakePrisma();

    const result = await main([], { prisma });

    expect(result).toEqual({
      mode: "dry-run",
      total: 3,
      byType: { widget: 1, workflow: 2 },
      qualityTarget: "400-500 substantive items (not yet achieved)",
    });
    expect(statsFor(catalog)).toEqual({ total: 3, byType: { widget: 1, workflow: 2 }, qualityTarget: expect.any(String) });
    expect(mockValidateCuratedCatalog).toHaveBeenCalledWith(catalog);
    expect(mockPrismaConfigLoad).not.toHaveBeenCalled();
    expect(mockDotenvConfig).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.findUnique).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.upsert).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.findMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.count).not.toHaveBeenCalled();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(consoleSpy.mock.calls[0][0])).toMatchObject({ mode: "dry-run", total: 3 });
  });

  test("is the default even when --unverify-generated is supplied", async () => {
    const catalog = [catalogItem({ slug: "opt-in-only" })];
    mockBuildCuratedCatalog.mockReturnValue(catalog);
    const { prisma, rows } = createFakePrisma([catalogRow(catalog[0], { isVerified: true })]);

    const result = await main(["--unverify-generated"], { prisma });

    expect(result.mode).toBe("dry-run");
    expect(rows.get("opt-in-only").isVerified).toBe(true);
    expect(prisma.tblMarketplaceItem.findMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.count).not.toHaveBeenCalled();
  });
});

describe("argument validation", () => {
  test("rejects unknown flags before building a catalog or opening a database", async () => {
    await expect(main(["--apply", "--force"], {})).rejects.toThrow("Unknown argument: --force");

    expect(mockBuildCuratedCatalog).not.toHaveBeenCalled();
    expect(mockValidateCuratedCatalog).not.toHaveBeenCalled();
    expect(mockPrismaConfigLoad).not.toHaveBeenCalled();
    expect(mockDotenvConfig).not.toHaveBeenCalled();
  });

  test("rejects an unknown flag on an otherwise valid dry-run", async () => {
    await expect(main(["--dry-run"])).rejects.toThrow("Unknown argument: --dry-run");
    expect(mockBuildCuratedCatalog).not.toHaveBeenCalled();
  });

  test("a catalog that fails publication guards never reaches the database", async () => {
    mockBuildCuratedCatalog.mockReturnValue([catalogItem({ slug: "invalid" })]);
    mockValidateCuratedCatalog.mockImplementation(() => {
      throw new Error("Duplicate slug invalid");
    });
    const { prisma } = createFakePrisma();

    await expect(main(["--apply"], { prisma })).rejects.toThrow("Duplicate slug invalid");

    expect(mockValidateCuratedCatalog).toHaveBeenCalled();
    expect(mockDotenvConfig).not.toHaveBeenCalled();
    expect(mockPrismaConfigLoad).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.findUnique).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.upsert).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
  });
});

describe("--apply upserts", () => {
  test("creates on first run and becomes an idempotent update on the second", async () => {
    const catalog = [
      catalogItem({ slug: "alpha", installCount: 0 }),
      catalogItem({ slug: "beta", itemType: "workflow", installCount: 0 }),
    ];
    mockBuildCuratedCatalog.mockReturnValue(catalog);
    const { prisma, rows } = createFakePrisma();
    const writeBackup = jest.fn();

    const first = await main(["--apply"], { prisma, writeBackup });
    expect(first).toMatchObject({ mode: "apply", total: 2, created: 2, updated: 0, unverified: 0, storedTotal: 2 });
    expect(rows.size).toBe(2);
    expect(writeBackup).not.toHaveBeenCalled();

    const firstCreates = prisma.tblMarketplaceItem.upsert.mock.calls.map(([arg]) => arg.create);
    expect(firstCreates).toHaveLength(2);
    firstCreates.forEach((create) => {
      expect(create).toHaveProperty("itemID");
      expect(create).toHaveProperty("installCount");
      expect(create).toHaveProperty("isVerified", false);
    });

    const second = await main(["--apply"], { prisma, writeBackup });
    expect(second).toMatchObject({ mode: "apply", total: 2, created: 0, updated: 2, unverified: 0, storedTotal: 2 });
    expect(rows.size).toBe(2);

    const secondCalls = prisma.tblMarketplaceItem.upsert.mock.calls.slice(2).map(([arg]) => arg);
    expect(secondCalls).toHaveLength(2);
    secondCalls.forEach(({ create, update }) => {
      expect(create).toBeDefined();
      // Identity/statistics/verification fields are never rewritten by an unchanged re-apply.
      expect(update).not.toHaveProperty("itemID");
      expect(update).not.toHaveProperty("installCount");
      expect(update).not.toHaveProperty("isVerified");
      expect(update.updatedAt).toBeInstanceOf(Date);
      expect(update.slug).toBeDefined();
      expect(update.payload).toBeDefined();
    });
    expect(prisma.tblMarketplaceItem.findMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.delete).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.deleteMany).not.toHaveBeenCalled();
  });

  test("preserves installCount and unchanged verified state while resetting only changed payloads", async () => {
    const unchanged = catalogItem({ slug: "unchanged", installCount: 0, isVerified: false });
    const changed = catalogItem({ slug: "changed", installCount: 0, isVerified: false });
    const changedPayload = { ...clone(changed.payload), note: "new definition content" };
    const catalog = [{ ...unchanged }, { ...changed, payload: changedPayload }];
    mockBuildCuratedCatalog.mockReturnValue(catalog);

    const { prisma, rows } = createFakePrisma([
      catalogRow(unchanged, { installCount: 42, isVerified: true }),
      catalogRow(changed, { installCount: 9, isVerified: true }),
    ]);

    const result = await main(["--apply"], { prisma });
    expect(result).toMatchObject({ created: 0, updated: 2, storedTotal: 2 });

    expect(rows.get("unchanged")).toMatchObject({ installCount: 42, isVerified: true });
    expect(rows.get("changed")).toMatchObject({ installCount: 9, isVerified: false });

    const updates = new Map(prisma.tblMarketplaceItem.upsert.mock.calls.map(([arg]) => [arg.where.slug, arg.update]));
    expect(updates.get("unchanged")).not.toHaveProperty("isVerified");
    expect(updates.get("unchanged")).not.toHaveProperty("installCount");
    expect(updates.get("changed")).toHaveProperty("isVerified", false);
    expect(updates.get("changed")).not.toHaveProperty("installCount");
  });

  test.each([
    ["a different publisher", { publisher: "someone-else", publishedByUserID: null }],
    ["a user-published jet-admin row", { publisher: "jet-admin", publishedByUserID: "2f4e1c3a-0000-4000-8000-000000000001" }],
  ])("refuses to overwrite %s", async (_label, ownership) => {
    const item = catalogItem({ slug: "owned-row" });
    mockBuildCuratedCatalog.mockReturnValue([item]);
    const existing = catalogRow(item, { ...ownership, installCount: 3, isVerified: true });
    const { prisma, rows } = createFakePrisma([existing]);

    await expect(main(["--apply"], { prisma })).rejects.toThrow(
      /Refusing to overwrite a user-published entry: owned-row/,
    );

    expect(prisma.tblMarketplaceItem.upsert).not.toHaveBeenCalled();
    expect(rows.get("owned-row")).toMatchObject({ installCount: 3, isVerified: true, publisher: ownership.publisher });
    expect(prisma.tblMarketplaceItem.delete).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.deleteMany).not.toHaveBeenCalled();
  });

  test("stops at the first user-published row instead of silently skipping it", async () => {
    const first = catalogItem({ slug: "safe-row" });
    const second = catalogItem({ slug: "protected-row" });
    mockBuildCuratedCatalog.mockReturnValue([first, second]);
    const { prisma, rows } = createFakePrisma([
      catalogRow(second, { publisher: "tenant-author", publishedByUserID: null }),
    ]);

    await expect(main(["--apply"], { prisma })).rejects.toThrow(/protected-row/);
    // The earlier row may have been created, but the protected row is untouched.
    expect(rows.get("safe-row")).toBeDefined();
    expect(rows.get("protected-row")).toMatchObject({ publisher: "tenant-author" });
  });
});

describe("--unverify-generated", () => {
  test("only unverifies built-in generator rows and backs them up before updating", async () => {
    const builtInA = catalogItem({ slug: "built-in-a", payload: basePayload() });
    const builtInB = catalogItem({ slug: "built-in-b", itemType: "workflow", payload: basePayload() });
    const otherGenerator = catalogItem({ slug: "other-generator", payload: { ...basePayload(), generator: "marketplace-catalog-v1" } });
    const otherPublisher = catalogItem({ slug: "other-publisher", payload: basePayload(), publisher: "acme" });
    const userPublished = catalogItem({
      slug: "user-published",
      payload: basePayload(),
      publisher: "jet-admin",
      publishedByUserID: "3b6c9f10-0000-4000-8000-000000000001",
    });
    const alreadyUnverified = catalogItem({ slug: "already-unverified", payload: basePayload(), isVerified: false });

    const initial = [
      catalogRow(builtInA, { isVerified: true }),
      catalogRow(builtInB, { isVerified: true }),
      catalogRow(otherGenerator, { isVerified: true }),
      catalogRow(otherPublisher, { isVerified: true }),
      catalogRow(userPublished, { isVerified: true }),
      catalogRow(alreadyUnverified, { isVerified: false }),
    ];
    mockBuildCuratedCatalog.mockReturnValue([]);
    const { prisma, rows } = createFakePrisma(initial);
    const writeBackup = jest.fn(() => "backups/marketplace/verification-before-test.json");

    const result = await main(["--apply", "--unverify-generated"], { prisma, writeBackup });

    expect(result).toMatchObject({
      mode: "apply",
      created: 0,
      updated: 0,
      unverified: 2,
      verificationBackup: "backups/marketplace/verification-before-test.json",
      storedTotal: 6,
    });

    const expectedWhere = {
      publisher: "jet-admin",
      publishedByUserID: null,
      payload: { path: ["generator"], equals: GENERATOR },
    };
    expect(prisma.tblMarketplaceItem.findMany).toHaveBeenCalledWith({
      where: { ...expectedWhere, isVerified: true },
      select: { itemID: true, slug: true, isVerified: true },
    });

    const expectedIds = [builtInA.itemID, builtInB.itemID];
    expect(prisma.tblMarketplaceItem.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.tblMarketplaceItem.updateMany).toHaveBeenCalledWith({
      where: { ...expectedWhere, itemID: { in: expectedIds } },
      data: { isVerified: false, updatedAt: expect.any(Date) },
    });

    expect(writeBackup).toHaveBeenCalledTimes(1);
    expect(writeBackup).toHaveBeenCalledWith([
      { itemID: builtInA.itemID, slug: "built-in-a", isVerified: true },
      { itemID: builtInB.itemID, slug: "built-in-b", isVerified: true },
    ]);
    expect(writeBackup.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.tblMarketplaceItem.updateMany.mock.invocationCallOrder[0],
    );

    expect(rows.get("built-in-a").isVerified).toBe(false);
    expect(rows.get("built-in-b").isVerified).toBe(false);
    expect(rows.get("other-generator").isVerified).toBe(true);
    expect(rows.get("other-publisher").isVerified).toBe(true);
    expect(rows.get("user-published").isVerified).toBe(true);
    expect(rows.get("already-unverified").isVerified).toBe(false);
    expect(rows.size).toBe(6);

    expect(prisma.tblMarketplaceItem.delete).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.deleteMany).not.toHaveBeenCalled();
  });

  test("does nothing when no verified built-in generator rows exist", async () => {
    mockBuildCuratedCatalog.mockReturnValue([]);
    const { prisma } = createFakePrisma([
      catalogRow(catalogItem({ slug: "already-clean" }), { isVerified: false }),
    ]);
    const writeBackup = jest.fn();

    const result = await main(["--apply", "--unverify-generated"], { prisma, writeBackup });

    expect(result).toMatchObject({ updated: 0, created: 0, unverified: 0, storedTotal: 1 });
    expect(result.verificationBackup).toBeUndefined();
    expect(writeBackup).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.delete).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.deleteMany).not.toHaveBeenCalled();
  });

  test("a backup failure aborts before any unverification write", async () => {
    const builtIn = catalogItem({ slug: "built-in" });
    mockBuildCuratedCatalog.mockReturnValue([]);
    const { prisma, rows } = createFakePrisma([catalogRow(builtIn, { isVerified: true })]);
    const writeBackup = jest.fn(() => {
      throw new Error("backup directory is not writable");
    });

    await expect(main(["--apply", "--unverify-generated"], { prisma, writeBackup })).rejects.toThrow(
      "backup directory is not writable",
    );

    expect(writeBackup).toHaveBeenCalledTimes(1);
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
    expect(rows.get("built-in").isVerified).toBe(true);
    expect(rows.size).toBe(1);
    expect(prisma.tblMarketplaceItem.delete).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.deleteMany).not.toHaveBeenCalled();
  });

  test("an apply without the flag never reads or resets verification rows", async () => {
    const item = catalogItem({ slug: "ordinary-apply" });
    mockBuildCuratedCatalog.mockReturnValue([item]);
    const { prisma } = createFakePrisma([catalogRow(item, { isVerified: true })]);
    const writeBackup = jest.fn();

    await main(["--apply"], { prisma, writeBackup });

    expect(prisma.tblMarketplaceItem.findMany).not.toHaveBeenCalled();
    expect(prisma.tblMarketplaceItem.updateMany).not.toHaveBeenCalled();
    expect(writeBackup).not.toHaveBeenCalled();
  });
});
