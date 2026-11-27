const { assetVersionService } = require("./assetVersion.service");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");

const handler = method => async (req, res) => {
  try {
    const result = await assetVersionService[method]({
      ...req.query,
      ...req.body,
      ...req.params,
      ctx: req.executionCtx,
    });
    res.set("Cache-Control", "no-store");
    return expressUtils.sendResponse(res, true, result, null, 200);
  } catch (error) {
    if (!error.statusCode) Logger.log("error", {
      message: `assetVersion:${method}:failed`,
      params: {
        code: error.code,
        assetType: req.params.assetType,
        assetID: req.params.assetID,
        detail: error.meta?.error || error.message,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error.statusCode ? error : { code: "SERVER_ERROR", message: "Asset version operation failed." }, error.statusCode || 500);
  }
};

module.exports = { assetVersionController: {
  list: handler("listVersions"),
  get: handler("getVersion"),
  impact: handler("getImpact"),
  diff: handler("getVersionDiff"),
  restore: handler("restoreVersion"),
  create: handler("createVersion"),
} };
