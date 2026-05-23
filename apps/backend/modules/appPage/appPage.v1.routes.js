const express = require("express");
const router = express.Router({ mergeParams: true });
const { appPageController } = require("./appPage.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createAppPageSchema,
  updateAppPageSchema,
  appPageIdParamSchema,
} = require("./appPage.validator");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:appPage:list"]),
  appPageController.getAllAppPages
);

router.post(
  "/",
  validate(createAppPageSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:appPage:create"]),
  appPageController.createAppPage
);

router.get(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:appPage:read"]),
  appPageController.getAppPageByID
);

router.post(
  "/:appPageID/clone",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:appPage:clone"]),
  appPageController.cloneAppPageByID
);

router.patch(
  "/:appPageID",
  validateAll({
    params: appPageIdParamSchema,
    body: updateAppPageSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:appPage:update"]),
  appPageController.updateAppPageByID
);

router.delete(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:appPage:delete"]),
  appPageController.deleteAppPageByID
);

module.exports = router;
