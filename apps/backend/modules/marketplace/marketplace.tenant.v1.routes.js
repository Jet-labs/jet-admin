/**
 * Marketplace Tenant Routes (v1)
 *
 * The store is deployment-scoped, but routes are mounted under
 * /tenants/:tenantID because Casbin authorization requires a tenant domain.
 *
 * GET  /marketplace                       — list/filter/search items
 * GET  /marketplace/:itemID               — fetch one item
 * POST /marketplace/:itemID/preview       — dry-run install into the tenant
 * POST /marketplace/:itemID/install       — clone the item bundle into the tenant
 */
const express = require("express");
const { marketplaceController } = require("./marketplace.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  listMarketplaceQuerySchema,
  marketplaceItemIdParamSchema,
  installMarketplaceItemSchema,
} = require("./marketplace.validator");
const { P } = require("../../config/permissions");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validate(listMarketplaceQuerySchema, "query"),
  authMiddleware.authorize(P.marketplace.list),
  marketplaceController.listItems
);

router.get(
  "/:itemID",
  validate(marketplaceItemIdParamSchema, "params"),
  authMiddleware.authorize(P.marketplace.list),
  marketplaceController.getItem
);

router.post(
  "/:itemID/preview",
  validateAll({
    params: marketplaceItemIdParamSchema,
    body: installMarketplaceItemSchema,
  }),
  authMiddleware.authorize(P.marketplace.preview),
  marketplaceController.previewInstall
);

router.post(
  "/:itemID/install",
  validateAll({
    params: marketplaceItemIdParamSchema,
    body: installMarketplaceItemSchema,
  }),
  authMiddleware.authorize(P.marketplace.install),
  marketplaceController.installItem
);

module.exports = router;
