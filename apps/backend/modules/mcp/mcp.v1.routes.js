const express = require("express");
const router = express.Router({mergeParams:true});
const { authMiddleware } = require("../auth/auth.middleware");
const { mcpController } = require("./mcp.controller");
const { mcpService } = require("./mcp.service");

router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:ai:chat"]),
  async(req, res) => {
    try {
    const input = req.body;
    const result = await mcpService.handle(input);
    res.json(result);
  } catch (err) {
    console.error("Error handling MCP request:", err);
    res.status(500).json({ error: "Internal MCP Server error" });
  }
  }
);



module.exports = router;
