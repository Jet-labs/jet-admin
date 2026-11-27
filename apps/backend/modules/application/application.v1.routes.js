const router = require("express").Router({ mergeParams: true });
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const { P } = require("../../config/permissions");
const { applicationController: controller } = require("./application.controller");
const schemas = require("./application.validator");

const permission = action => authMiddleware.authorize({ ...P.application[action], paramKey: "applicationID" });
router.get("/", validate(schemas.listApplicationsSchema, "query"), permission("list"), controller.list);
router.post("/", validate(schemas.createApplicationSchema, "body"), permission("create"), controller.create);
router.use("/:applicationID", validate(schemas.applicationParams, "params"));
router.get("/:applicationID", permission("read"), controller.get);
router.get("/:applicationID/draft", permission("read"), controller.getDraft);
router.patch("/:applicationID/draft", validate(schemas.saveDraftSchema, "body"), permission("update"), controller.saveDraft);
router.post("/:applicationID/assets/pages", validate(schemas.linkPageSchema, "body"), permission("update"), controller.linkPage);
router.patch("/:applicationID/assets/:assetKey/version", validateAll({ params: schemas.assetParams, body: schemas.selectPageVersionSchema }), permission("update"), controller.selectPageVersion);
router.delete("/:applicationID/assets/:assetKey", validateAll({ params: schemas.assetParams, body: schemas.unlinkAssetSchema }), permission("update"), controller.unlinkAsset);
router.post("/:applicationID/validate", permission("read"), controller.validate);
router.get("/:applicationID/consumer-policy", permission("read"), controller.getConsumerPolicy);
router.put("/:applicationID/consumer-policy", validate(schemas.consumerPolicySchema, "body"), permission("update"), controller.updateConsumerPolicy);
router.post("/:applicationID/preview", permission("update"), controller.preview);
router.post("/:applicationID/archive", validate(schemas.unlinkAssetSchema, "body"), permission("archive"), controller.archive);

// Immutable releases and environment deployment
router.post("/:applicationID/releases", validate(schemas.publishSchema, "body"), permission("publish"), controller.publish);
router.get("/:applicationID/releases", permission("read"), controller.listReleases);
router.get("/:applicationID/runs", validate(schemas.workflowRunsQuery, "query"), permission("read"), controller.listWorkflowRuns);
router.get("/:applicationID/environments/:environment", validate(schemas.environmentParams, "params"), permission("read"), controller.getEnvironment);
router.put("/:applicationID/environments/:environment/bindings", validateAll({ params: schemas.environmentParams, body: schemas.bindingsSchema }), permission("deploy"), controller.updateBindings);
router.post("/:applicationID/environments/:environment/deployments", validateAll({ params: schemas.environmentParams, body: schemas.deploySchema }), permission("deploy"), controller.deploy);

// Runtime resources resolve only captured release resources, never client query IDs.
router.get("/:applicationID/runtime/:environment/manifest", validate(schemas.environmentParams, "params"), permission("execute"), controller.runtimeManifest);
router.get("/:applicationID/runtime/:environment/pages/:pageAssetKey/manifest", validateAll({ params: schemas.runtimePageParams, query: schemas.runtimeListenerSchema.pick({ routeID: true }) }), permission("execute"), controller.runtimePageManifest);
router.post("/:applicationID/runtime/:environment/pages/:pageAssetKey/data-sources/:alias/execute", validateAll({ params: schemas.runtimeParams, body: schemas.runtimeExecuteSchema }), permission("execute"), controller.runtimeExecute);
router.get("/:applicationID/runtime/:environment/pages/:pageAssetKey/data-sources/:alias/runs/:instanceID", validate(schemas.runtimeRunParams, "params"), permission("execute"), controller.runtimeWorkflowStatus);
router.post("/:applicationID/runtime/:environment/pages/:pageAssetKey/data-sources/:alias/runs/:instanceID/cancel", validateAll({ params: schemas.runtimeRunParams, body: schemas.runtimeExecuteSchema.pick({}) }), permission("execute"), controller.runtimeWorkflowCancel);
router.post("/:applicationID/runtime/:environment/pages/:pageAssetKey/data-sources/:alias/runs/:instanceID/requests/:collectionRequestID/submit", validateAll({ params: schemas.runtimeRequestParams, body: schemas.runtimeSubmissionSchema }), permission("execute"), controller.runtimeWorkflowSubmit);
router.get("/:applicationID/runtime/:environment/pages/:pageAssetKey/data-sources/:alias/events", validateAll({ params: schemas.runtimeParams, query: schemas.runtimeListenerSchema }), permission("execute"), controller.runtimeListenerEvents);
module.exports = router;
