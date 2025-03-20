const http = require("http");
const { expressApp } = require("./express-app.config");

const httpServer = http.createServer(expressApp);
module.exports = { httpServer };
