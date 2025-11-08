const { Server } = require("socket.io");
const { authMiddleware } = require("../modules/auth/auth.middleware");
const { httpServer } = require("./http-server.config");
const environmentVariables = require("../environment");
const socketIO = new Server(httpServer, {
  cors: {
    origin: environmentVariables.CORS_WHITELIST,
  },
});
socketIO.use(authMiddleware.authProviderSocket);
module.exports = { socketIO };
