const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseChatController } = require("./databaseChat.controller");
const { databaseChatStreamController } = require("./databaseChat.stream.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

/**
 * POST /message
 * Send a natural language message and get AI-generated response with query results
 */
router.post(
  "/message",
  body("message")
    .notEmpty()
    .withMessage("message is required")
    .isString()
    .withMessage("message must be a string")
    .isLength({ min: 1, max: 5000 })
    .withMessage("message must be between 1 and 5000 characters"),
  body("conversationHistory")
    .optional()
    .isArray()
    .withMessage("conversationHistory must be an array"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:raw-sql:execute"]),
  databaseChatController.sendMessage
);

/**
 * POST /message/stream
 * SSE streaming endpoint for real-time response streaming
 */
router.post(
  "/message/stream",
  body("message")
    .notEmpty()
    .withMessage("message is required")
    .isString()
    .withMessage("message must be a string")
    .isLength({ min: 1, max: 5000 })
    .withMessage("message must be between 1 and 5000 characters"),
  body("conversationHistory")
    .optional()
    .isArray()
    .withMessage("conversationHistory must be an array"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:raw-sql:execute"]),
  databaseChatStreamController.streamMessage
);

module.exports = router;

