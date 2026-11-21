const express = require("express");
const cors = require("cors");
const { morganMiddleware } = require("./morgan.config");
const environmentVariables = require("../environment");

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
      // Reject the origin without throwing: throwing here turned a CORS
      // rejection into a 500 (and exposed the error stack in development).
      // Returning false simply omits the CORS headers, so browsers block the
      // response while server-to-server clients still get a normal reply.
      callback(null, false);
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
