const express = require("express");
const cors = require("cors");
const { morganMiddleware } = require("./morgan.config");
const environmentVariables = require("../environment");
const constants = require("../constants");

var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (
      [
        ...environmentVariables.CORS_WHITELIST,
        "chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop",
        // Allow requests with no origin (like mobile apps, Postman desktop app)
        undefined,
        "null",
      ].indexOf(origin) !== -1
    ) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error(constants.ERROR_CODES.NOT_ALLOWED_BY_CORS.message));
    }
  },
};

const expressApp = express();
expressApp.enable("trust proxy");
expressApp.options('*', cors());
expressApp.use(morganMiddleware);
expressApp.use(cors(corsOptions));
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
expressApp.use(express.json({ extended: false }));
module.exports = { expressApp };
