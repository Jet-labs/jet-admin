/**
 * Widget Library Service
 * Deployment-scoped registry of published widgets, built on top of the
 * Phase-1 export bundle format. Publish stores a full dependency bundle;
 * install clones it into a tenant with fresh IDs via the import pipeline.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { assertImportableBundle } = require("../bundle/bundle.service");

const WIDGET_TYPE = "widget";

const widgetLibraryService = {};

/**
 * The published root is the LAST item in the deps-first bundle that is of
 * type "widget". Returns { item, dependenciesCount } or null.
 */
function findPublishedWidgetItem(bundle) {
  const items = Array.isArray(bundle?.items) ? bundle.items : [];
  const widgetItems = items.filter((it) => it && it.type === WIDGET_TYPE);
  if (widgetItems.length !== 1) {
    throw new Error(
      `A library publish must contain exactly one widget; received ${widgetItems.length}.`
    );
  }
  return widgetItems[0];
}

/**
 * Lists published widgets with optional server-side text search and
 * offset pagination.
 *
 * @param {string} [param0.search] - case-insensitive match on title, description, type
 * @param {number} [param0.page]
 * @param {number} [param0.pageSize]
 * @returns {Promise<{entries: Array<object>, totalCount: number, page: number, pageSize: number, totalPages: number}>}
 */
widgetLibraryService.listPublishedWidgets = async ({ search, page, pageSize }) => {
  Logger.log("info", {
    message: "widgetLibraryService:listPublishedWidgets:params",
    params: { search, page, pageSize },
  });
  try {
    const where = search
      ? {
          OR: [
            { widgetTitle: { contains: search, mode: "insensitive" } },
            { widgetDescription: { contains: search, mode: "insensitive" } },
            { widgetType: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const findManyOptions = {
      where,
      orderBy: [{ createdAt: "desc" }],
      select: {
        libraryEntryID: true,
        widgetTitle: true,
        widgetType: true,
        widgetDescription: true,
        sourceTenantID: true,
        createdAt: true,
      },
    };

    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [entries, totalCount] = await Promise.all([
      prisma.tblWidgetLibrary.findMany(findManyOptions),
      prisma.tblWidgetLibrary.count({ where }),
    ]);

    Logger.log("success", {
      message: "widgetLibraryService:listPublishedWidgets:success",
      params: { entriesLength: entries?.length, totalCount },
    });

    return {
      entries,
      totalCount,
      page: page || 1,
      pageSize: pageSize || entries.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryService:listPublishedWidgets:failure",
      params: { error },
    });
    throw error;
  }
};

widgetLibraryService.publishWidget = async ({ userID, bundle }) => {
  Logger.log("info", {
    message: "widgetLibraryService:publishWidget:params",
    params: { userID },
  });
  try {
    // Full structural validation — same rules as tenant imports.
    assertImportableBundle(bundle);
    const widgetItem = findPublishedWidgetItem(bundle);

    const entry = await prisma.tblWidgetLibrary.create({
      data: {
        widgetTitle: widgetItem.payload.widgetTitle,
        widgetType: widgetItem.payload.widgetType,
        widgetDescription: widgetItem.payload.widgetDescription ?? null,
        bundle,
        sourceTenantID: bundle.sourceTenantID ?? null,
        publishedByUserID: userID ?? null,
      },
    });

    Logger.log("success", {
      message: "widgetLibraryService:publishWidget:success",
      params: { libraryEntryID: entry.libraryEntryID },
    });
    return entry;
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryService:publishWidget:failure",
      params: { error },
    });
    throw error;
  }
};

widgetLibraryService.unpublishWidget = async ({ libraryEntryID }) => {
  Logger.log("info", {
    message: "widgetLibraryService:unpublishWidget:params",
    params: { libraryEntryID },
  });
  try {
    const deleted = await prisma.tblWidgetLibrary.deleteMany({
      where: { libraryEntryID },
    });
    if (deleted.count === 0) {
      throw new Error("Library entry not found.");
    }
    return { libraryEntryID };
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryService:unpublishWidget:failure",
      params: { error },
    });
    throw error;
  }
};

widgetLibraryService.getEntryBundle = async ({ libraryEntryID }) => {
  const entry = await prisma.tblWidgetLibrary.findUnique({
    where: { libraryEntryID },
  });
  if (!entry) throw new Error("Library entry not found.");
  assertImportableBundle(entry.bundle);
  return entry;
};

module.exports = { widgetLibraryService };
