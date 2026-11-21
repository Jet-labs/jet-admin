jest.mock("../../../config/prisma.config", () => ({ prisma: { tblMarketplaceItem: {} } }));
jest.mock("../../../modules/bundle/bundle.service", () => ({
  assertImportableBundle: jest.fn(),
}));
jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));

const { prisma } = require("../../../config/prisma.config");
const { marketplaceService } = require("../../../modules/marketplace/marketplace.service");

const model = prisma.tblMarketplaceItem;

beforeEach(() => {
  jest.clearAllMocks();
  model.findMany = jest.fn().mockResolvedValue([{ itemID: "a" }]);
  model.count = jest.fn().mockResolvedValue(25);
  model.findUnique = jest.fn();
  model.update = jest.fn();
  model.deleteMany = jest.fn();
});

test("listItems applies search, itemType and category filters with pagination", async () => {
  const result = await marketplaceService.listItems({
    search: "stripe",
    itemType: "widget",
    category: "Payments & Commerce",
    page: 2,
    pageSize: 12,
  });

  const opts = model.findMany.mock.calls[0][0];
  expect(opts.skip).toBe(12);
  expect(opts.take).toBe(12);
  expect(opts.where.AND).toEqual([
    expect.objectContaining({ OR: expect.any(Array) }),
    { itemType: "widget" },
    { category: { equals: "Payments & Commerce", mode: "insensitive" } },
  ]);
  expect(result).toMatchObject({ totalCount: 25, page: 2, pageSize: 12, totalPages: 3 });
});

test("listItems works with no filters", async () => {
  const result = await marketplaceService.listItems({});
  expect(model.findMany.mock.calls[0][0].where).toEqual({});
  expect(result.page).toBe(1);
});

test("getItemByID throws for a missing item", async () => {
  model.findUnique.mockResolvedValue(null);
  await expect(marketplaceService.getItemByID({ itemID: "missing" })).rejects.toThrow(
    "Marketplace item not found."
  );
});

test("verifyItem updates the isVerified flag", async () => {
  model.update.mockResolvedValue({ itemID: "a", isVerified: true });
  const item = await marketplaceService.verifyItem({ itemID: "a", isVerified: true });
  expect(model.update).toHaveBeenCalledWith(
    expect.objectContaining({ where: { itemID: "a" } })
  );
  expect(item.isVerified).toBe(true);
});

test("unpublishItem throws when nothing was deleted", async () => {
  model.deleteMany.mockResolvedValue({ count: 0 });
  await expect(marketplaceService.unpublishItem({ itemID: "a" })).rejects.toThrow(
    "Marketplace item not found."
  );
});
