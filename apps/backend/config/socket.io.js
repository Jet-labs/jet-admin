const { Server } = require("socket.io");
const { authMiddleware } = require("../modules/auth/auth.middleware");
const { httpServer } = require("./http-server.config");
const environmentVariables = require("../environment");
const Logger = require("../utils/logger");
const socketIO = new Server(httpServer, {
  cors: {
    origin: environmentVariables.CORS_WHITELIST,
  },
});
socketIO.use(authMiddleware.authProviderSocket);

// Redis adapter — lets `push_to_app_page` / progress emits from ANY replica
// (or Temporal sidecar activities via DB-driven UI) reach the replica holding
// the browser socket. Same Redis instance as the listener bus, separate
// keyspace (`socket.io#*`). Single-node boots without REDIS_URL are unaffected.
try {
  if (environmentVariables.REDIS_URL) {
    const { createAdapter } = require("@socket.io/redis-adapter");
    const { getRedisClient } = require("./redis.config");
    const pubClient = getRedisClient("socket-pub");
    const subClient = getRedisClient("socket-sub");
    socketIO.adapter(createAdapter(pubClient, subClient));
    Logger.log("success", { message: "socket.io:redis adapter attached" });
  }
} catch (err) {
  Logger.log("warning", {
    message: "socket.io:redis adapter skipped",
    params: { error: err.message, hint: "npm install @socket.io/redis-adapter + ioredis for multi-replica emits" },
  });
}

module.exports = { socketIO };
