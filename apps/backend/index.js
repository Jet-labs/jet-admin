const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express-app.config");
const { httpServer } = require("./config/http-server.config");
const Logger = require("./utils/logger");
const {
  connectDatabaseQueryRunnerJobProducer,
  disconnectDatabaseQueryRunnerJobProducer,
  initDatabaseQueryRunnerJobResultConsumer,
} = require("./config/kafka.config");

// Middleware setup
expressApp.use(cookieParser());
expressApp.use("/api/v1/auth", require("./modules/auth/auth.v1.routes"));
expressApp.use("/api/v1/tenants", require("./modules/tenant/tenant.v1.routes"));

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

// Start the server
const port = environment.PORT;
httpServer.listen(port, async () => {
  Logger.log("success", {
    message: "server started listening",
    params: { port },
  });
  await connectDatabaseQueryRunnerJobProducer();
  await initDatabaseQueryRunnerJobResultConsumer();
});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.log("info", { message: "shutting down server" });
  httpServer.close(() => {
    disconnectDatabaseQueryRunnerJobProducer();
    process.exit(0);
  });
});
