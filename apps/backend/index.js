require("ignore-styles");

// Patch BigInt JSON serialization globally
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const path = require('path');
const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express-app.config");
const { httpServer } = require("./config/http-server.config");
const Logger = require("./utils/logger");
const { cronJobService } = require("./modules/cronJob/cronJob.service");
const { socketIO } = require("./config/socket.io");
const { isModuleEnabled } = require("./config/module.config");
const { widgetSocketController } = require("./modules/widget/widget.socket.controller");
const { authMiddleware } = require("./modules/auth/auth.middleware");
const { errorUtils } = require("./utils/error.util");
const { workflowSocketController } = require("./modules/workflow/workflow.socket.controller");
const { startAllListeners, stopAllListeners } = require("./config/startup");

// Routes imports
const authRoutes = require("./modules/auth/auth.v1.routes");
const tenantRoutes = require("./modules/tenant/tenant.v1.routes");
const aiRoutes = require("./modules/ai/ai.v1.routes");
const oauthRoutes = require("./modules/oauth/oauth.v1.routes");
const { webhookRouter } = require("@jet-admin/datasources-logic");

// Middleware setup
expressApp.use(cookieParser());

Logger.log("success", { message: "public folder path", params: { path: path.join(__dirname, 'public') } });

// Health Check Route
expressApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API routes
if (isModuleEnabled(constants.MODULES.AUTH)) {
  Logger.log("success", { message: "auth module enabled" });
  expressApp.use("/api/v1/auth", authRoutes);
}

if (isModuleEnabled(constants.MODULES.TENANT)) {
  Logger.log("success", { message: "tenant module enabled" });
  expressApp.use(
    "/api/v1/tenants",
    tenantRoutes
  );
}

// AI Agent routes (tenant-scoped)
expressApp.use(
  "/api/v1/tenants/:tenantID/ai",
  aiRoutes
);

// OAuth integration routes
expressApp.use("/api/v1/oauth", oauthRoutes);

// Webhook ingress routes (served inline — no separate port or nginx routing needed)
// These handle: /webhooks/v1/inbound/:tenantID/:pathSuffix
//               /webhooks/v1/inbound/:listenerID
expressApp.use("/webhooks", webhookRouter.getApp());

// Global error-handling middleware
expressApp.use((err, req, res, next) => {
  Logger.log("error", {
    message: "unhandled error",
    params: { error: err.message, stack: err.stack },
  });

  const errorObj = errorUtils.extractError(err);
  
  let statusCode = err.statusCode || err.status || 500;
  if (errorObj.code === "PERMISSION_DENIED") {
    statusCode = 403;
  } else if (
    errorObj.code === "INVALID_API_KEY" ||
    errorObj.code === "USER_AUTH_TOKEN_EXPIRED" ||
    errorObj.code === "USER_AUTH_TOKEN_NOT_FOUND" ||
    errorObj.code === "INVALID_LOGIN"
  ) {
    statusCode = 401;
  } else if (errorObj.code === "VALIDATION_ERROR" || errorObj.code === "INVALID_REQUEST") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    error: errorObj,
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
    constants.SOCKET_RECEIVE_EVENTS.WORKFLOW_RUN_JOIN,
    async (data) => {
      try {
        await workflowSocketController.onWorkflowRunJoin({
          socket,
          runId: data.runId,
          firebaseID: firebase_id,
        });
      } catch (error) {
        Logger.log("error", { message: "socket:workflow_run_join:error", params: { error: error.message } });
      }
    }
  );

  // === Widget-Workflow Integration Events ===
  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_CONNECT,
    async (data) => {
      try {
        Logger.log('warning', {
          message: 'socket:widget_workflow_connect:received',
          params: { widgetID: data.widgetID, workflowID: data.workflowID, mode: data.mode, instanceID: data.instanceID },
        });
        await widgetSocketController.onWidgetWorkflowConnect({
          socket,
          widgetID: data.widgetID,
          workflowID: data.workflowID,
          mode: data.mode || 'execute',
          inputParams: data.inputParams || {},
          instanceID: data.instanceID,
          tenantID: data.tenantID,
          firebaseID: firebase_id,
          widgetType: data.widgetType,
          widgetConfig: data.widgetConfig,
          workflowConfig: data.workflowConfig,
        });
      } catch (error) {
        Logger.log("error", { message: "socket:widget_workflow_connect:error", params: { error: error.message } });
      }
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_SEND_INPUT,
    async (data) => {
      try {
        await widgetSocketController.onWidgetSendInput({
          socket,
          widgetID: data.widgetID,
          instanceID: data.instanceID,
          inputType: data.inputType,
          data: data.data,
        });
      } catch (error) {
        Logger.log("error", { message: "socket:widget_send_input:error", params: { error: error.message } });
      }
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_REFRESH,
    async (data) => {
      try {
        await widgetSocketController.onWidgetRefresh({
          socket,
          widgetID: data.widgetID,
          inputParams: data.inputParams,
          tenantID: data.tenantID,
        });
      } catch (error) {
        Logger.log("error", { message: "socket:widget_refresh:error", params: { error: error.message } });
      }
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_DISCONNECT,
    async (data) => {
      try {
        await widgetSocketController.onWidgetWorkflowDisconnect({
          socket,
          widgetID: data.widgetID,
        });
      } catch (error) {
        Logger.log("error", { message: "socket:widget_workflow_disconnect:error", params: { error: error.message } });
      }
    }
  );

  // === Room Management (for listener test streaming, etc.) ===
  socket.on('join_room', (room) => {
    try {
      if (typeof room === 'string' && (room.startsWith('listener_test:') || room.startsWith('tenant:') || room.startsWith('listener:'))) {
        socket.join(room);
      }
    } catch (error) {
      Logger.log("error", { message: "socket:join_room:error", params: { error: error.message } });
    }
  });

  socket.on('leave_room', (room) => {
    try {
      if (typeof room === 'string' && room.startsWith('listener_test:')) {
        socket.leave(room);
      }
    } catch (error) {
      Logger.log("error", { message: "socket:leave_room:error", params: { error: error.message } });
    }
  });

  Logger.log("success", {
    message: "user connected to socket",
    params: { firebase_id },
  });

  socket.on("disconnect", () => {
    try {
      widgetSocketController.onSocketDisconnect({
        socket,
        firebaseID: firebase_id,
      });
    } catch (error) {
      Logger.log("error", { message: "socket:disconnect:error", params: { error: error.message } });
    }

    Logger.log("info", {
      message: "socket connection disconnected",
      params: { firebase_id },
    });
  });
});

// Start the server
const port = environment.PORT;
httpServer.listen(port, async () => {
  Logger.log("success", {
    message: "server started listening",
    params: { port },
  });
  cronJobService.scheduleAllCronJobs();

  // Start all listeners (workflow queue, subscription consumers, etc.)
  try {
    await startAllListeners();
  } catch (error) {
    Logger.log("warning", { message: "listeners not started", params: { error: error.message } });
  }

});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  Logger.log("info", { message: `shutting down server (${signal})` });

  // Stop all listeners
  try {
    await stopAllListeners();
  } catch (error) {
    // Ignore cleanup errors
  }

  if (httpServer) {
    httpServer.close(() => {
      if (signal === "SIGUSR2") {
        process.kill(process.pid, "SIGUSR2");
      } else {
        process.exit(0);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.once("SIGUSR2", () => gracefulShutdown("SIGUSR2"));
