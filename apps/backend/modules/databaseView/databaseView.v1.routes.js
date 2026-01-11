const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseViewController } = require("./databaseView.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { param, query, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// List all views in schema
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:view:list"]),
  databaseViewController.getAllDatabaseViews
);

// Create new view
router.post(
  "/",
  body("viewName").notEmpty().withMessage("viewName is required"),
  body("selectQuery").notEmpty().withMessage("selectQuery is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:view:create"]),
  databaseViewController.createDatabaseView
);

// Get specific view details
router.get(
  "/:databaseViewName",
  param("databaseViewName")
    .notEmpty()
    .withMessage("databaseViewName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:view:read"]),
  databaseViewController.getDatabaseViewByName
);

// Update view
router.put(
  "/:databaseViewName",
  param("databaseViewName")
    .notEmpty()
    .withMessage("databaseViewName is required"),
  body("selectQuery").notEmpty().withMessage("selectQuery is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:view:update"]),
  databaseViewController.updateDatabaseView
);

// Delete view
router.delete(
  "/:databaseViewName",
  param("databaseViewName")
    .notEmpty()
    .withMessage("databaseViewName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:view:delete"]),
  databaseViewController.deleteDatabaseView
);

// Query view data
router.get(
  "/:databaseViewName/query",
  param("databaseViewName")
    .notEmpty()
    .withMessage("databaseViewName is required"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("limit must be between 1 and 1000"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be a non-negative integer"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:view:query"]),
  databaseViewController.queryDatabaseView
);

module.exports = router;
