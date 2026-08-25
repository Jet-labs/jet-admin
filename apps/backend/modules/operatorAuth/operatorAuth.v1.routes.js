/**
 * OperatorAuth Routes (v1)
 *
 * Mounted at /api/v1/operator/auth.
 *
 * POST /login   — email + password → session token
 * POST /logout  — revoke current session (requires session)
 * GET  /me      — current operator profile (requires session)
 */
const express = require("express");
const { operatorAuthController } = require("./operatorAuth.controller");
const { operatorAuthMiddleware } = require("./operatorAuth.middleware");
const { validate } = require("../../utils/validation.utils");
const { operatorLoginSchema } = require("./operatorAuth.validator");

const router = express.Router();

router.post("/login", validate(operatorLoginSchema, "body"), operatorAuthController.login);

router.post("/logout", operatorAuthMiddleware.requireOperator, operatorAuthController.logout);

router.get("/me", operatorAuthMiddleware.requireOperator, operatorAuthController.me);

module.exports = router;
