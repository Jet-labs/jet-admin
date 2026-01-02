import Redis from "ioredis";
import { Logger } from "../../utils/logger.js";

export const redisTestConnection = async ({ datasourceOptions }) => {
  let redis;
  
  try {
    Logger.log("info", {
      message: "redis:redisTestConnection:params",
    });

    if (datasourceOptions.connectionUrl) {
      redis = new Redis(datasourceOptions.connectionUrl, {
        lazyConnect: true,
        connectTimeout: 10000,
      });
    } else if (datasourceOptions.clusterMode && datasourceOptions.clusterNodes) {
      const nodes = datasourceOptions.clusterNodes.split(",").map(n => {
        const [host, port] = n.trim().split(":");
        return { host, port: parseInt(port) || 6379 };
      });
      redis = new Redis.Cluster(nodes, {
        lazyConnect: true,
      });
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      redis = new Redis({
        host: details.host || "localhost",
        port: details.port || 6379,
        password: details.password || undefined,
        db: details.database || 0,
        username: details.username || undefined,
        tls: details.tls ? {} : undefined,
        lazyConnect: true,
        connectTimeout: 10000,
      });
    }
    
    await redis.connect();
    
    // Test with PING command
    await redis.ping();

    Logger.log("info", {
      message: "redis:redisTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "redis:redisTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
};
