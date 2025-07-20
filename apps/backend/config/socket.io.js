const { Server } = require("socket.io");
const { authMiddleware } = require("../modules/auth/auth.middleware");
const { httpServer } = require("./http-server.config");
const socketIO = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
socketIO.use(authMiddleware.authProviderSocket);
module.exports = { socketIO };
