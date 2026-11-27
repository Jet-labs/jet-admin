const router = require("express").Router({ mergeParams: true });
const { validate, validateAll } = require("../../utils/validation.utils");
const { assetVersionController: controller } = require("./assetVersion.controller");
const { assetVersionParams, assetVersionVersionParams, assetVersionListQuery, assetVersionCreateBody, assetVersionDiffQuery, assetVersionRestoreBody } = require("./assetVersion.validator");

router.get("/:assetType/:assetID/versions", validateAll({ params: assetVersionParams, query: assetVersionListQuery }), controller.list);
router.get("/:assetType/:assetID/versions/:versionID", validate(assetVersionVersionParams, "params"), controller.get);
router.get("/:assetType/:assetID/versions/:versionID/impact", validate(assetVersionVersionParams, "params"), controller.impact);
router.get("/:assetType/:assetID/versions/:versionID/diff", validateAll({ params: assetVersionVersionParams, query: assetVersionDiffQuery }), controller.diff);
router.post("/:assetType/:assetID/versions", validateAll({ params: assetVersionParams, body: assetVersionCreateBody }), controller.create);
router.post("/:assetType/:assetID/versions/:versionID/restore", validateAll({ params: assetVersionVersionParams, body: assetVersionRestoreBody }), controller.restore);

module.exports = router;
