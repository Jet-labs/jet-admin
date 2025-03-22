
const express = require("express");
const router = express.Router();
const { authController } = require("./auth.controller");
const { authMiddleware } = require("./auth.middleware");

//auth routes

router.get("/", authMiddleware.authProvider, authController.getUserInfo);
router.get(
  "/config/:tenantID",
  authMiddleware.authProvider,
  authController.getUserConfig
);
router.post(
  "/config/:tenantID",
  authMiddleware.authProvider,
  authController.updateUserConfig
);
module.exports = router;
