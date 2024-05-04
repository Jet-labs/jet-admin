const morgan = require("morgan");
const { winstonLogger } = require("./winston");

const stream = {
  // Use the http severity
  write: (message) => winstonLogger.http(message),
};

const skip = () => {
  return false;
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

module.exports = { morganMiddleware };
