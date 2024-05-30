const environment = require("./environment");
const cookieParser = require("cookie-parser");
const constants = require("./constants");
const { expressApp } = require("./config/express.app");
const { httpServer } = require("./config/http.server");
const Logger = require("./utils/logger");

expressApp.use(cookieParser());
expressApp.use("/admin_api/auth", require("./modules/routes/auth.route"));

expressApp.use(
  "/admin_api/constants",
  require("./modules/routes/constants.route")
);

expressApp.use("/admin_api/tables", require("./modules/routes/table.route"));
expressApp.use("/admin_api/graphs", require("./modules/routes/graph.route"));
expressApp.use(
  "/admin_api/dashboard_layouts",
  require("./modules/routes/dashboardLayout.route")
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
});


