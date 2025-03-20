
const express = require("express");
const router = express.Router();
const { authController } = require("./auth.controller");
const { authMiddleware } = require("./auth.middleware");

//auth routes

router.get("/", authMiddleware.authProvider, authController.getUserInfo);

module.exports = router;
