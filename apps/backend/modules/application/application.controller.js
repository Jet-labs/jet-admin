const { applicationService } = require("./application.service");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");
const Logger = require("../../utils/logger");

const handler = (method, key, status = 200) => async (req, res) => {
  try {
    const result = await applicationService[method]({
      ...req.query, ...req.body, ...req.params,
      ctx: req.executionCtx, authContext: getServiceAuthContext(req),
    });
    res.set("Cache-Control", "no-store");
    return expressUtils.sendResponse(res, true, key ? { [key]: result } : result, null, status);
  } catch (error) {
    // Never return database details or dump author definitions in logs.
    if (error.code === "P2002") return expressUtils.sendResponse(res, false, {}, { code: "APPLICATION_DUPLICATE", message: "The slug, asset key, or page link already exists." }, 409);
    if (error.code === "P2003") return expressUtils.sendResponse(res, false, {}, { code: "APPLICATION_REFERENCE_CONFLICT", message: "A referenced asset is unavailable or still in use." }, 409);
    if (!error.statusCode) Logger.log("error", { message: `application:${method}:failed`, params: { code: error.code, applicationID: req.params.applicationID } });
    return expressUtils.sendResponse(res, false, {}, error.statusCode ? error : { code: "SERVER_ERROR", message: "Application operation failed." }, error.statusCode || 500);
  }
};
module.exports = { applicationController: {
  list: handler("list"), create: handler("create", "application", 201), get: handler("get", "application"),
  getDraft: handler("getDraft", "draft"),
  saveDraft: handler("saveDraft", "draft"), linkPage: handler("linkPage", "application", 201), selectPageVersion: handler("selectPageVersion", "application"), unlinkAsset: handler("unlinkAsset", "application"),
  archive: handler("archive", "application"), validate: handler("validate", "validation"), preview: handler("preview", "preview"),
  getConsumerPolicy: handler("getConsumerPolicy"), updateConsumerPolicy: handler("updateConsumerPolicy", "consumerPolicy"),
  publish: handler("publish", "release", 201), listReleases: handler("listReleases", "releases"),
  listWorkflowRuns: handler("listWorkflowRuns"),
  getEnvironment: handler("getEnvironment", "environment"), updateBindings: handler("updateBindings", "environment"), deploy: handler("deploy"),
  runtimeManifest: handler("runtimeManifest", "manifest"), runtimePageManifest: handler("runtimePageManifest", "manifest"), runtimeExecute: handler("runtimeExecute", "dataQueryResult"),
  runtimeWorkflowStatus: handler("runtimeWorkflowStatus", "run"), runtimeWorkflowCancel: handler("runtimeWorkflowCancel"),
  runtimeWorkflowSubmit: handler("runtimeWorkflowSubmit"), runtimeListenerEvents: handler("runtimeListenerEvents", "subscription"),
} };
