/**
 * Bundle API Routes (v1)
 *
 * POST /import/preview  — dry-run an import bundle against the tenant
 * POST /import/execute  — create all bundle items with fresh IDs
 */
const express = require("express");
const { bundleController } = require("./bundle.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate } = require("../../utils/validation.utils");
const {
  importPreviewSchema,
  importExecuteSchema,
} = require("./bundle.validator");
const { P } = require("../../config/permissions");

const router = express.Router({ mergeParams: true });

router.post(
  "/preview",
  validate(importPreviewSchema, "body"),
  authMiddleware.authorize(P.bundle.preview),
  bundleController.previewImport
);

router.post(
  "/execute",
  validate(importExecuteSchema, "body"),
  authMiddleware.authorize(P.bundle.execute),
  bundleController.executeImport
);

module.exports = router;
