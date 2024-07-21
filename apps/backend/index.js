const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express.app");
const { httpServer } = require("./config/http.server");
const Logger = require("./utils/logger");
const { CustomCronJobScheduler } = require("./jobs/cron.jobs");

expressApp.use(cookieParser());
expressApp.use("/admin_api/auth", require("./modules/auth/auth.route"));

expressApp.use(
  "/admin_api/constants",
  require("./modules/constants/constants.route")
);

expressApp.use("/admin_api/tables", require("./modules/table/table.route"));
expressApp.use(
  "/admin_api/accounts",
  require("./modules/accounts/account.route")
);
expressApp.use("/admin_api/graphs", require("./modules/graph/graph.route"));
expressApp.use(
  "/admin_api/dashboards",
  require("./modules/dashboard/dashboard.route")
);
expressApp.use("/admin_api/queries", require("./modules/query/query.route"));

expressApp.use("/admin_api/jobs", require("./modules/job/job.route"));

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
  CustomCronJobScheduler.scheduleAllCustomJobs();
});


