/**
 * Marketplace Service
 *
 * Generalized, deployment-scoped store of integration items (datasource,
 * widget, workflow, appTemplate). Items carry a Bundle v1 payload so install
 * reuses the existing bundle import pipeline.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { assertImportableBundle } = require("../bundle/bundle.service");

const marketplaceService = {};

const LIST_SELECT = {
  itemID: true,
  slug: true,
  itemType: true,
  title: true,
  description: true,
  category: true,
  tags: true,
  icon: true,
  iconColor: true,
  publisher: true,
  version: true,
  isVerified: true,
  installCount: true,
  sourceFamily: true,
  createdAt: true,
};

/**
 * List marketplace items with server-side search and type/category filters.
 * @returns {Promise<{entries:Array, totalCount:number, page:number, pageSize:number, totalPages:number}>}
 */
marketplaceService.listItems = async ({
  search,
  itemType,
  category,
  includeLegacy = false,
  page,
  pageSize,
} = {}) => {
  try {
    const and = [];
    if (search) {
      and.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (itemType) and.push({ itemType });
    if (category) and.push({ category: { equals: category, mode: "insensitive" } });
    if (!includeLegacy) {
      // The original generated placeholders are retained for operator review
      // but must not be offered as working integrations in tenant stores.
      and.push({
        OR: [
          { sourceFamily: "curated-playbooks" },
          { sourceFamily: null },
          { publisher: { not: "jet-admin" } },
        ],
      });
    }
    // App templates are a first-class store surfaced by /templates, not the
    // integration marketplace. Keep them out of this list even when legacy
    // items are requested.
    and.push({ NOT: { sourceFamily: "marketplace-templates" } });
    const where = and.length ? { AND: and } : {};

    const findManyOptions = {
      where,
      orderBy: [{ isVerified: "desc" }, { title: "asc" }],
      select: LIST_SELECT,
    };

    const currentPage = Number(page) || 1;
    const currentPageSize = Number(pageSize) || 20;
    findManyOptions.skip = (currentPage - 1) * currentPageSize;
    findManyOptions.take = currentPageSize;

    const [entries, totalCount] = await Promise.all([
      prisma.tblMarketplaceItem.findMany(findManyOptions),
      prisma.tblMarketplaceItem.count({ where }),
    ]);

    return {
      entries,
      totalCount,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / currentPageSize)),
    };
  } catch (error) {
    Logger.log("error", {
      message: "marketplaceService:listItems:failure",
      params: { error },
    });
    throw error;
  }
};

marketplaceService.getItemByID = async ({ itemID }) => {
  const item = await prisma.tblMarketplaceItem.findUnique({ where: { itemID } });
  if (!item) throw new Error("Marketplace item not found.");
  assertImportableBundle(item.payload);
  return item;
};

marketplaceService.verifyItem = async ({ itemID, isVerified }) => {
  try {
    return await prisma.tblMarketplaceItem.update({
      where: { itemID },
      data: { isVerified: Boolean(isVerified), updatedAt: new Date() },
      select: LIST_SELECT,
    });
  } catch (error) {
    Logger.log("error", {
      message: "marketplaceService:verifyItem:failure",
      params: { error },
    });
    throw error;
  }
};

marketplaceService.unpublishItem = async ({ itemID }) => {
  const deleted = await prisma.tblMarketplaceItem.deleteMany({ where: { itemID } });
  if (deleted.count === 0) throw new Error("Marketplace item not found.");
  return { itemID };
};

marketplaceService.recordInstall = async ({ itemID }) => {
  await prisma.tblMarketplaceItem.update({
    where: { itemID },
    data: { installCount: { increment: 1 } },
  });
};

module.exports = { marketplaceService };
