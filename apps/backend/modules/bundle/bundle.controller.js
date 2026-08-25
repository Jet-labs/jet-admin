/**
 * Bundle Controller
 * Express request handlers for bundle export/import.
 */
const { bundleService } = require("./bundle.service");
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const bundleController = {};

// ─── Export ──────────────────────────────────────────────────────────────

async function handleExport(req, res, { type, id }) {
  try {
    const { tenantID } = req.params;
    Logger.log("info", {
      message: `bundleController:export${type}:params`,
      params: { tenantID, [id]: req.params[id] },
    });
    const bundle = await bundleService[`export${type[0].toUpperCase()}${type.slice(1)}`]({
      tenantID,
      [id]: req.params[id],
    });
    Logger.log("success", {
      message: `bundleController:export${type}:success`,
      params: { tenantID, items: bundle.items.length },
    });
    return expressUtils.sendResponse(res, true, { bundle, message: "Bundle exported successfully." }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: `bundleController:export${type}:error`,
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
}

bundleController.exportAppPage = (req, res) =>
  handleExport(req, res, { type: "appPage", id: "appPageID" });

bundleController.exportWorkflow = (req, res) =>
  handleExport(req, res, { type: "workflow", id: "workflowID" });

bundleController.exportDataQuery = (req, res) =>
  handleExport(req, res, { type: "dataQuery", id: "dataQueryID" });

bundleController.exportWidget = (req, res) =>
  handleExport(req, res, { type: "widget", id: "widgetID" });

bundleController.exportListener = (req, res) =>
  handleExport(req, res, { type: "listener", id: "listenerID" });

// ─── Import ──────────────────────────────────────────────────────────────

bundleController.previewImport = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { bundle } = req.body;

    Logger.log("info", {
      message: "bundleController:previewImport:params",
      params: { userID: user.userID, tenantID },
    });

    const preview = await bundleService.previewImport({ tenantID, bundle });

    return expressUtils.sendResponse(res, true, { ...preview, message: "Import preview generated." }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "bundleController:previewImport:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

bundleController.executeImport = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { bundle } = req.body;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "bundleController:executeImport:params",
      params: { userID: user.userID, tenantID },
    });

    const result = await bundleService.executeImport({
      tenantID,
      userID: user.userID,
      authContext,
      bundle,
    });

    return expressUtils.sendResponse(res, true, { ...result, message: "Bundle imported successfully." }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "bundleController:executeImport:error",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { bundleController };
