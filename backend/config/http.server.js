const http = require("http");
const { expressApp } = require("./express.app");

const httpServer = http.createServer(expressApp);
module.exports = { httpServer };
