require("ignore-styles");

// Patch BigInt JSON serialization globally
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
const { listenerConnectionManager } = require("./modules/listener/listenerEngine/connectionManager");
// Middleware setup
expressApp.use(cookieParser());
const path = require('path');

Logger.log("success", { message: "public folder path", params: { path: path.join(__dirname, 'public') } });

// Monitor UI Route
expressApp.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monitor.html'));
});

// Health Check Route
expressApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

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
    constants.SOCKET_RECEIVE_EVENTS.WORKFLOW_RUN_JOIN,
    async (data) => {
      const { workflowSocketController } = require("./modules/workflow/workflow.socket.controller");
      await workflowSocketController.onWorkflowRunJoin({
        socket,
        runId: data.runId,
        firebaseID: firebase_id,
      });
    }
  );

  // === Widget-Workflow Integration Events ===
  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_CONNECT,
    async (data) => {
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
        // Generic widget configuration (opaque — only widgets-logic knows internals)
        widgetType: data.widgetType,
        widgetConfig: data.widgetConfig,
        workflowConfig: data.workflowConfig,
      });
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_SEND_INPUT,
    async (data) => {
      await widgetSocketController.onWidgetSendInput({
        socket,
        widgetID: data.widgetID,
        instanceID: data.instanceID,
        inputType: data.inputType,
        data: data.data,
      });
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_REFRESH,
    async (data) => {
      await widgetSocketController.onWidgetRefresh({
        socket,
        widgetID: data.widgetID,
        inputParams: data.inputParams,
        tenantID: data.tenantID,
      });
    }
  );

  socket.on(
    constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_DISCONNECT,
    async (data) => {
      await widgetSocketController.onWidgetWorkflowDisconnect({
        socket,
        widgetID: data.widgetID,
      });
    }
  );

  Logger.log("success", {
    message: "user connected to socket",
    params: { firebase_id },
  });

  socket.on("disconnect", () => {
    // Clean up widget connections on disconnect
    widgetSocketController.onSocketDisconnect({
      socket,
      firebaseID: firebase_id,
    });

    try {

      listenerConnectionManager.clearTestScriptsForSession(socket.id);
    } catch (e) {
      // Ignore errors during disconnect cleanup
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

  // Initialize Monitor Socket
  try {
    const { initializeMonitorSocket } = require('./modules/monitor/monitor.socket');
    initializeMonitorSocket();
  } catch (err) {
    Logger.log('error', { message: 'Failed to init monitor socket', params: { error: err.message } });
  }

  // Start all listeners (workflow queue, subscription consumers, etc.)
  try {
    const { startAllListeners } = require("./config/startup");
    await startAllListeners();
  } catch (error) {
    Logger.log("warning", { message: "listeners not started", params: { error: error.message } });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.log("info", { message: "shutting down server" });

  // Stop all listeners
  try {
    const { stopAllListeners } = require("./config/startup");
    await stopAllListeners();
  } catch (error) {
    // Ignore cleanup errors
  }

  httpServer.close(() => {
    process.exit(0);
  });
});

