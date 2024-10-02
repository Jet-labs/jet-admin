const morgan = require("morgan");
const { winstonLogger } = require("./winston.config");

const stream = {
  write: (message) => winstonLogger.warning(message),
};

const skip = () => {
  return false;
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

module.exports = { morganMiddleware };
