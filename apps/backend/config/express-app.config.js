const express = require("express");
const cors = require("cors");
const { morganMiddleware } = require("./morgan.config");
const environmentVariables = require("../environment");
const constants = require("../constants");

var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow server-to-server requests
    if (
      [
        ...environmentVariables.CORS_WHITELIST,
        "chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop",
      ].indexOf(origin) !== -1
    ) {
      callback(null, true);
    } else {
      callback(new Error(constants.ERROR_CODES.NOT_ALLOWED_BY_CORS.message));
    }
  },
};

const strictCors = cors(corsOptions);
const openCors = cors({ origin: true, credentials: true });

const expressApp = express();
expressApp.enable("trust proxy");

// Dynamically apply CORS based on the route
const dynamicCors = (req, res, next) => {
  if (req.path.startsWith('/webhooks')) {
    openCors(req, res, next);
  } else {
    strictCors(req, res, next);
  }
};

expressApp.options('*', dynamicCors);
expressApp.use(dynamicCors);
expressApp.use(morganMiddleware);
expressApp.use(
  express.json({
    limit: environmentVariables.EXPRESS_REQUEST_SIZE_LIMIT,
    verify: (req, res, buffer) => (req.rawBody = buffer),
  })
);
expressApp.use(
  express.urlencoded({
    limit: environmentVariables.EXPRESS_REQUEST_SIZE_LIMIT,
    extended: false,
  })
);
module.exports = { expressApp };
