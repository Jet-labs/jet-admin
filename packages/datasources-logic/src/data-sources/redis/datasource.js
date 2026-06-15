import Redis from "ioredis";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class RedisDataSource extends DataSource {
  getRedisClient() {
    const opts = this.config.datasourceOptions || {};

    if (opts.connectionUrl) {
      return new Redis(opts.connectionUrl);
    }

    if (opts.clusterMode && opts.clusterNodes) {
      const nodes = opts.clusterNodes.split(",").map(n => {
        const [host, port] = n.trim().split(":");
        return { host, port: parseInt(port) || 6379 };
      });
      return new Redis.Cluster(nodes);
    }

    const details = opts.connectionDetails || opts;
    return new Redis({
      host: details.host || "localhost",
      port: details.port || 6379,
      password: details.password || undefined,
      db: details.database || 0,
      username: details.username || undefined,
      tls: details.tls ? {} : undefined,
    });
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "redis:RedisDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const redis = this.getRedisClient();

    try {
      const result = await this.executeOperation(redis, dataQueryOptions, context);

      Logger.log("info", {
        message: "redis:RedisDataSource:execute:success",
        params: { operation: dataQueryOptions.operation },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "redis:RedisDataSource:execute:catch",
        params: { error: error.message },
      });
      throw new Error(`Redis ${dataQueryOptions.operation} failed: ${error.message}`);
    } finally {
      redis.disconnect();
    }
  }

  async executeOperation(redis, opts, context) {
    const { operation, key, value, field, pattern, ttl, start, stop, count, streamId, channel, consumeMode, storeDestination } = opts;

    const parseValue = (v) => {
      if (!v) return v;
      try { return JSON.parse(v); } catch { return v; }
    };

    const stringifyValue = (v) => {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    };

    switch (operation) {
      // String operations
      case "get": {
        const result = await redis.get(key);
        return { key, value: parseValue(result) };
      }
      case "set": {
        const args = [key, stringifyValue(value)];
        if (ttl > 0) args.push("EX", ttl);
        await redis.set(...args);
        return { success: true, key };
      }
      case "del": {
        const deleted = await redis.del(key);
        return { success: true, key, deleted };
      }
      case "exists": {
        const exists = await redis.exists(key);
        return { key, exists: exists === 1 };
      }
      case "keys": {
        const keys = await redis.keys(pattern || "*");
        return { pattern, keys, count: keys.length };
      }
      case "expire": {
        await redis.expire(key, ttl);
        return { success: true, key, ttl };
      }
      case "ttl": {
        const remaining = await redis.ttl(key);
        return { key, ttl: remaining };
      }

      // Hash operations
      case "hget": {
        const result = await redis.hget(key, field);
        return { key, field, value: parseValue(result) };
      }
      case "hset": {
        await redis.hset(key, field, stringifyValue(value));
        return { success: true, key, field };
      }
      case "hgetall": {
        const result = await redis.hgetall(key);
        const parsed = {};
        for (const [k, v] of Object.entries(result)) {
          parsed[k] = parseValue(v);
        }
        return { key, data: parsed };
      }
      case "hdel": {
        const deleted = await redis.hdel(key, field);
        return { success: true, key, field, deleted };
      }

      // List operations
      case "lpush": {
        const length = await redis.lpush(key, stringifyValue(value));
        return { success: true, key, length };
      }
      case "rpush": {
        const length = await redis.rpush(key, stringifyValue(value));
        return { success: true, key, length };
      }
      case "lpop": {
        const result = await redis.lpop(key);
        const parsed = parseValue(result);

        return { key, value: parsed };
      }
      case "rpop": {
        const result = await redis.rpop(key);
        const parsed = parseValue(result);

        return { key, value: parsed };
      }
      case "lrange": {
        const items = await redis.lrange(key, start || 0, stop ?? -1);
        return { key, items: items.map(parseValue), count: items.length };
      }
      case "llen": {
        const length = await redis.llen(key);
        return { key, length };
      }

      // Set operations
      case "sadd": {
        const added = await redis.sadd(key, stringifyValue(value));
        return { success: true, key, added };
      }
      case "smembers": {
        const members = await redis.smembers(key);
        return { key, members: members.map(parseValue), count: members.length };
      }
      case "srem": {
        const removed = await redis.srem(key, stringifyValue(value));
        return { success: true, key, removed };
      }
      case "sismember": {
        const isMember = await redis.sismember(key, stringifyValue(value));
        return { key, value, isMember: isMember === 1 };
      }

      // Pub/Sub
      case "publish": {
        const receivers = await redis.publish(channel || key, stringifyValue(value));
        return { success: true, channel: channel || key, receivers };
      }

      // Stream operations
      case "xadd": {
        const data = parseValue(value);
        const fields = [];
        if (typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            fields.push(k, stringifyValue(v));
          }
        } else {
          fields.push("data", stringifyValue(data));
        }
        const id = await redis.xadd(key, "*", ...fields);
        return { success: true, key, id };
      }
      case "xread": {
        const result = await redis.xread("COUNT", count || 10, "STREAMS", key, streamId || "0");
        if (!result) return { key, messages: [], count: 0 };
        
        const messages = result[0][1].map(([id, fields]) => {
          const data = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = parseValue(fields[i + 1]);
          }
          return { id, data };
        });



        return { key, messages, count: messages.length };
      }
      case "xrange": {
        const entries = await redis.xrange(key, start || "-", stop || "+", "COUNT", count || 10);
        const messages = entries.map(([id, fields]) => {
          const data = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = parseValue(fields[i + 1]);
          }
          return { id, data };
        });
        return { key, messages, count: messages.length };
      }
      case "xlen": {
        const length = await redis.xlen(key);
        return { key, length };
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async subscribe(config, onEvent) {
    const redis = this.getRedisClient();
    const subType = config.subscriptionType || "pubsub";

    Logger.log("info", {
      message: "redis:subscribe:start",
      params: { subType, datasourceID: this.config.datasourceID },
    });

    if (subType === "pubsub") {
      const channels = (config.channels || "").split(",").map((c) => c.trim()).filter(Boolean);
      if (!channels.length) {
        redis.disconnect();
        throw new Error("No channels specified for Redis pubsub listener");
      }

      await redis.subscribe(...channels);
      
      redis.on("message", (channel, message) => {
        let parsed = message;
        try { parsed = JSON.parse(message); } catch {}
        onEvent({ channel, payload: parsed });
      });

      return { type: "pubsub", client: redis };
      
    } else if (subType === "stream") {
      const stream = config.stream;
      const group = config.consumerGroup;
      const consumer = config.consumerName || "jet-listener-1";
      
      if (!stream || !group) {
        redis.disconnect();
        throw new Error("Stream and consumerGroup required for Redis stream listener");
      }

      // Ensure group exists
      try {
        await redis.xgroup("CREATE", stream, group, "$", "MKSTREAM");
      } catch (e) {
        if (!e.message.includes("BUSYGROUP")) {
          redis.disconnect();
          throw e;
        }
      }

      let isRunning = true;
      const poll = async () => {
        while (isRunning) {
          try {
            // Block for 5 seconds to wait for new messages
            const result = await redis.xreadgroup(
              "GROUP", group, consumer, 
              "BLOCK", 5000, 
              "COUNT", 10, 
              "STREAMS", stream, ">"
            );
            
            if (result && result.length > 0) {
              const messages = result[0][1];
              for (const [id, fields] of messages) {
                const data = {};
                for (let i = 0; i < fields.length; i += 2) {
                  let val = fields[i + 1];
                  try { val = JSON.parse(val); } catch {}
                  data[fields[i]] = val;
                }
                
                // Dispatch event
                onEvent({ stream, id, payload: data });
                
                // Acknowledge the message
                await redis.xack(stream, group, id);
              }
            }
          } catch (e) {
            if (isRunning) {
              Logger.log("error", { 
                message: "redis:stream:poll:error", 
                params: { error: e.message }
              });
              // Sleep briefly on error before retrying to prevent tight loops
              await new Promise(r => setTimeout(r, 5000));
            }
          }
        }
      };
      
      // Start background polling without awaiting
      poll(); 

      return { type: "stream", client: redis, stop: () => { isRunning = false; } };
    }

    redis.disconnect();
    throw new Error(`Unknown Redis subscription type: ${subType}`);
  }

  async unsubscribe(handle) {
    if (!handle) return;
    Logger.log("info", {
      message: "redis:unsubscribe",
      params: { type: handle.type, datasourceID: this.config.datasourceID },
    });

    if (handle.type === "pubsub") {
      await handle.client.unsubscribe();
      handle.client.disconnect();
    } else if (handle.type === "stream") {
      handle.stop();
      handle.client.disconnect();
    }
  }
}
