/**
 * Marketplace App Template controller.
 */
const { listTemplates, getTemplate, installTemplate, uninstallTemplate, readAsset } = require("./template.installer");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const templateController = {};

function sendError(res, error, label) {
  Logger.log("error", { message: `templateController:${label}:error`, params: { error: error.message } });
  const status = error.statusCode || constants.HTTP_STATUS.BAD_REQUEST;
  return expressUtils.sendResponse(res, false, {}, error, status);
}

templateController.list = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const result = await listTemplates({ tenantID, search: req.query.search, category: req.query.category });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "App templates fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "list");
  }
};

templateController.get = async (req, res) => {
  try {
    const { tenantID, slug } = req.params;
    const result = await getTemplate({ tenantID, slug });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "App template fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "get");
  }
};

templateController.install = async (req, res) => {
  try {
    const { tenantID, slug } = req.params;
    const authContext = getServiceAuthContext(req);
    const result = await installTemplate({
      tenantID,
      slug,
      options: req.body?.options || req.body || {},
      userID: req.user?.userID,
      authContext,
    });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: result.alreadyInstalled ? "Template is already installed." : "Template installed successfully." },
      null,
      result.alreadyInstalled ? constants.HTTP_STATUS.OK : constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    return sendError(res, error, "install");
  }
};

templateController.uninstall = async (req, res) => {
  try {
    const { tenantID, slug } = req.params;
    const result = await uninstallTemplate({ tenantID, slug, userID: req.user?.userID });
    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: result.removed ? "Template uninstalled." : "Template is not installed." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    return sendError(res, error, "uninstall");
  }
};

templateController.asset = async (req, res) => {
  try {
    const { slug } = req.params;
    const assetPath = req.params[0] || "";
    const asset = await readAsset({ slug, assetPath });
    res.setHeader("Content-Type", asset.mime);
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.send(asset.content);
  } catch (error) {
    return sendError(res, error, "asset");
  }
};

module.exports = { templateController };
