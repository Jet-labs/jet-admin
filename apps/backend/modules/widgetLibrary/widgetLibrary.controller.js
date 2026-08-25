/**
 * Widget Library Controller
 */
const { widgetLibraryService } = require("./widgetLibrary.service");
const { bundleService } = require("../bundle/bundle.service");
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const widgetLibraryController = {};

widgetLibraryController.listPublishedWidgets = async (req, res) => {
  try {
    const { search, page, pageSize } = req.query;
    const result = await widgetLibraryService.listPublishedWidgets({
      search,
      page,
      pageSize,
    });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "Widget library fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryController:listPublishedWidgets:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

widgetLibraryController.publishWidget = async (req, res) => {
  try {
    const { user } = req;
    const { bundle } = req.body;

    const entry = await widgetLibraryService.publishWidget({
      userID: user?.userID,
      bundle,
    });

    return expressUtils.sendResponse(
      res,
      true,
      { entry: { libraryEntryID: entry.libraryEntryID }, message: "Widget published to the library." },
      null,
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryController:publishWidget:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

widgetLibraryController.unpublishWidget = async (req, res) => {
  try {
    const { libraryEntryID } = req.params;
    await widgetLibraryService.unpublishWidget({ libraryEntryID });
    return expressUtils.sendResponse(
      res,
      true,
      { message: "Widget removed from the library." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryController:unpublishWidget:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

// ─── Tenant-scoped: preview + install ────────────────────────────────────

widgetLibraryController.previewInstall = async (req, res) => {
  try {
    const { tenantID, libraryEntryID } = req.params;
    const entry = await widgetLibraryService.getEntryBundle({ libraryEntryID });

    const preview = await bundleService.previewImport({ tenantID, bundle: entry.bundle });

    return expressUtils.sendResponse(
      res,
      true,
      { ...preview, message: "Install preview generated." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryController:previewInstall:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

widgetLibraryController.installWidget = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, libraryEntryID } = req.params;
    const authContext = getServiceAuthContext(req);

    const entry = await widgetLibraryService.getEntryBundle({ libraryEntryID });

    const result = await bundleService.executeImport({
      tenantID,
      userID: user.userID,
      authContext,
      bundle: entry.bundle,
    });

    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "Widget installed successfully." },
      null,
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    Logger.log("error", {
      message: "widgetLibraryController:installWidget:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { widgetLibraryController };
