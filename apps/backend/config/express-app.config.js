const express = require("express");
const cors = require("cors");
const { morganMiddleware } = require("./morgan.config");

var whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://localhost:3001",
  undefined /** other domains if any */,
];

var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const expressApp = express();
expressApp.enable("trust proxy");
expressApp.use(morganMiddleware);
expressApp.use(cors(corsOptions));
expressApp.use(
  express.json({
    limit: "5mb",
    verify: (req, res, buffer) => (req.rawBody = buffer),
  })
);
expressApp.use(express.urlencoded({ limit: "5mb", extended: false }));
expressApp.use(express.json({ extended: false }));
module.exports = { expressApp };
