/**
 * Marketplace Controller
 */
const { marketplaceService } = require("./marketplace.service");
const { bundleService, selectBundleItems } = require("../bundle/bundle.service");
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const marketplaceController = {};

const sendError = (res, error, label) => {
  Logger.log("error", { message: `marketplaceController:${label}:error`, params: { error } });
  return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
};

function assertInstallable(item) {
  // Old generated placeholders have no marketplace root metadata and are not
  // dependency-complete. Never let them be installed again, even by direct ID.
  if (!item.payload?.marketplace?.root) {
    throw new Error(
      "This legacy marketplace item is not installable. Install its curated replacement instead."
    );
  }
}

marketplaceController.listItems = async (req, res) => {
  try {
    const { search, itemType, category, includeLegacy, page, pageSize } = req.query;
    const result = await marketplaceService.listItems({
      search,
      itemType,
      category,
      includeLegacy: includeLegacy === "true",
      page,
      pageSize,
    });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "Marketplace items fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "listItems");
  }
};

marketplaceController.getItem = async (req, res) => {
  try {
    const item = await marketplaceService.getItemByID({ itemID: req.params.itemID });
    return expressUtils.sendResponse(
      res,
      true,
      { item, message: "Marketplace item fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "getItem");
  }
};

marketplaceController.previewInstall = async (req, res) => {
  try {
    const { tenantID, itemID } = req.params;
    const item = await marketplaceService.getItemByID({ itemID });
    assertInstallable(item);
    const selection = selectBundleItems(item.payload, req.body?.selectedItemKeys);
    const preview = await bundleService.previewImport({
      tenantID,
      bundle: selection.bundle,
    });
    return expressUtils.sendResponse(
      res,
      true,
      {
        ...preview,
        selection: selection.selection,
        selectedCount: selection.selectedCount,
        totalCount: selection.totalCount,
        message: "Install preview generated.",
      },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "previewInstall");
  }
};

marketplaceController.installItem = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, itemID } = req.params;
    const authContext = getServiceAuthContext(req);

    const item = await marketplaceService.getItemByID({ itemID });
    assertInstallable(item);
    const selection = selectBundleItems(item.payload, req.body?.selectedItemKeys);
    const result = await bundleService.executeImport({
      tenantID,
      userID: user.userID,
      authContext,
      bundle: selection.bundle,
    });
    if (result.results.length) {
      await marketplaceService.recordInstall({ itemID }).catch(() => {});
    }

    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "Marketplace item installed successfully." },
      null,
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    return sendError(res, error, "installItem");
  }
};

marketplaceController.verifyItem = async (req, res) => {
  try {
    const { itemID } = req.params;
    const item = await marketplaceService.verifyItem({
      itemID,
      isVerified: req.body.isVerified,
    });
    return expressUtils.sendResponse(
      res,
      true,
      { item, message: "Marketplace item verification updated." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "verifyItem");
  }
};

marketplaceController.unpublishItem = async (req, res) => {
  try {
    await marketplaceService.unpublishItem({ itemID: req.params.itemID });
    return expressUtils.sendResponse(
      res,
      true,
      { message: "Marketplace item removed." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "unpublishItem");
  }
};

module.exports = { marketplaceController };
