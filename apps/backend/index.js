const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express-app.config");
const { httpServer } = require("./config/http-server.config");
const Logger = require("./utils/logger");
const { CustomCronJobScheduler } = require("./jobs/cron.jobs");
const { pgPool } = require("./db/pg");
const { TriggerService } = require("./modules/triggers/trigger.services");

expressApp.use(cookieParser());
expressApp.use("/admin_api/auth", require("./modules/auth/auth.route"));

expressApp.use(
  "/admin_api/app_constants",
  require("./modules/app-constants/app-constants.route")
);

expressApp.use("/admin_api/schemas", require("./modules/schema/schema.route"));
expressApp.use("/admin_api/tables", require("./modules/table/table.route"));
expressApp.use(
  "/admin_api/accounts",
  require("./modules/accounts/account.route")
);
expressApp.use(
  "/admin_api/policies",
  require("./modules/policies/policy.route")
);
expressApp.use("/admin_api/graphs", require("./modules/graph/graph.route"));
expressApp.use(
  "/admin_api/dashboards",
  require("./modules/dashboard/dashboard.route")
);
expressApp.use("/admin_api/queries", require("./modules/query/query.route"));

expressApp.use("/admin_api/jobs", require("./modules/job/job.route"));

expressApp.use(
  "/admin_api/triggers",
  require("./modules/triggers/trigger.route")
);

expressApp.get("/", async (req, res) => {
  Logger.log("warning", {
    message: "wrong api call",
    params: { ips: req.ips, headers: req.headers, url: req.url },
  });
  res.status(404).json({
    error: constants.ERROR_CODES.INVALID_REQUEST,
  });
});

//-----------------------------------------------------------------------------------
const port = environment.PORT;

httpServer.listen(port, () => {
  Logger.log("success", {
    message: "server started listening",
    params: { port },
  });
  TriggerService.registerAllTriggerNotificationChannelsOnStartup();
  CustomCronJobScheduler.scheduleAllCustomJobs();
});


