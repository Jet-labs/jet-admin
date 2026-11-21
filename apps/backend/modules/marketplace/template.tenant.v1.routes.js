/**
 * Marketplace App Template routes (tenant-scoped).
 *
 * GET    /templates                       — gallery list
 * GET    /templates/:slug                 — manifest + README + ERD + status
 * POST   /templates/:slug/install         — install into the tenant
 * DELETE /templates/:slug                 — uninstall and drop tables
 * GET    /templates/:slug/assets/*        — static package assets
 */
const express = require("express");
const { templateController } = require("./template.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { P } = require("../../config/permissions");

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware.authorize(P.marketplace.list), templateController.list);
router.get("/:slug", authMiddleware.authorize(P.marketplace.list), templateController.get);
router.post("/:slug/install", authMiddleware.authorize(P.marketplace.install), templateController.install);
router.delete("/:slug", authMiddleware.authorize(P.marketplace.install), templateController.uninstall);
router.get("/:slug/assets/*", authMiddleware.authorize(P.marketplace.list), templateController.asset);

module.exports = router;
