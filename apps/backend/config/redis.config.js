// utils/redis.client.js
import Redis from "ioredis";
import Logger from "../utils/logger";


class RedisClient {
  constructor() {
    this.client = null;
    this.connect();
  }

  connect() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.registerEventHandlers();
  }

  registerEventHandlers() {
    this.client.on("connect", () => {
      Logger.log("success", {
        message: "Redis: Connected to server",
      });
    });

    this.client.on("ready", () => {
      
      Logger.log("success", {
        message: "Redis: Connection ready",
      });
    });

    this.client.on("error", (err) => {
      
      Logger.log('error', {
        message: "Redis: Connection error",
        params: { err },
      });
    });

    this.client.on("reconnecting", () => {
      Logger.log("warning", {
        message: "Redis: Reconnecting to server",
      });
    });

    this.client.on("end", () => {
      Logger.log("info", {
        message: "Redis: Connection ended",
      });
    });
  }

  // Hash operations
  async hSet(key, field, value) {
    return this.client.hset(key, field, value);
  }

  async hGetAll(key) {
    return this.client.hgetall(key);
  }

  async hDel(key, ...fields) {
    return this.client.hdel(key, ...fields);
  }

  // Key operations
  async expire(key, seconds) {
    return this.client.expire(key, seconds);
  }

  async exists(key) {
    return this.client.exists(key);
  }

  // Health check
  async ping() {
    return this.client.ping();
  }

  // Graceful shutdown
  async disconnect() {
    return this.client.quit();
  }
}

// Singleton instance
const redisClient = new RedisClient();

module.exports = {redisClient};
