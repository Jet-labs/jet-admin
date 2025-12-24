require("ignore-styles");
const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express-app.config");
const { httpServer } = require("./config/http-server.config");
const Logger = require("./utils/logger");
const { cronJobService } = require("./modules/cronJob/cronJob.service");
const { stringUtils } = require("@jet-admin/template-package");
const { socketIO } = require("./config/socket.io");
const { isModuleEnabled } = require("./config/module.config");
const {
  aiSocketController,
} = require("./modules/ai/socket/ai.socket.controller");
// Middleware setup
expressApp.use(cookieParser());

// API routes
if (isModuleEnabled(constants.MODULES.AUTH)) {
  Logger.log("success", { message: "auth module enabled" });
  expressApp.use("/api/v1/auth", require("./modules/auth/auth.v1.routes"));
}

if (isModuleEnabled(constants.MODULES.TENANT)) {
  Logger.log("success", { message: "tenant module enabled" });
  expressApp.use(
    "/api/v1/tenants",
    require("./modules/tenant/tenant.v1.routes")
  );
  expressApp.use(
    "/api/v1/tenants",
    require("./modules/tenant/tenant.v1.routes")
  );
}

// if (isModuleEnabled(constants.MODULES.WORKFLOW)) {
//   Logger.log("success", { message: "workflow module enabled" });
//   expressApp.use(
//     "/api/v1/workflows",
//     require("./modules/workflow/routes/workflow.routes")
//   );
// }

// Global error-handling middleware
expressApp.use((err, req, res, next) => {
  Logger.log("error", {
    message: "unhandled error",
    params: { error: err.message, stack: err.stack },
  });
  res.status(500).json({
    error: constants.ERROR_CODES.INVALID_REQUEST,
  });
});

// Default route for invalid API calls
expressApp.all("*", (req, res) => {
  Logger.log("warning", {
    message: "invalid api call",
    params: {
      ips: req.ips,
      headers: req.headers,
      url: req.url,
      method: req.method,
    },
  });
  res.status(404).json({
    error: constants.ERROR_CODES.INVALID_REQUEST,
  });
});

socketIO.on("connection", async (socket) => {
  const { firebase_id, token } = socket.handshake.auth;

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.AI_CHAT_USER_MESSAGE,
    async (data) => {
      await aiSocketController.onUserMessageReceived({
        socket,
        message: data.message,
        chatRoomID: data.chatRoomID,
        firebaseID: firebase_id,
      });
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WORKFLOW_RUN_JOIN,
    async (data) => {
      const { workflowSocketController } = require("./modules/workflow/controllers/workflow.socket.controller");
      await workflowSocketController.onWorkflowRunJoin({
        socket,
        runId: data.runId,
        firebaseID: firebase_id,
      });
    }
  );

  Logger.log("success", {
    message: "user connected to socket",
    params: { firebase_id },
  });

  socket.on("disconnect", () => {
    Logger.log("info", {
      message: "socket connection disconnected",
      params: { firebase_id },
    });
  });
});

// Start the server
const port = environment.PORT;
httpServer.listen(port, () => {
  Logger.log("success", {
    message: "server started listening",
    params: { port },
  });
  console.log("truncate name", stringUtils.truncateName("Hello World", 5));
  cronJobService.scheduleAllCronJobs();
});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.log("info", { message: "shutting down server" });
  httpServer.close(() => {
    process.exit(0);
  });
});
