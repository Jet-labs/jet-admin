import { Client } from "pg";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class PostgreSQLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "postgresql:PostgreSQLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });
    const { query } = dataQueryOptions;
    const client = new Client({
      connectionString: this.config.datasourceOptions?.connectionString,
      ...this.config.datasourceOptions?.connectionData,
    });
    try {
      await client.connect();
      Logger.log("info", {
        message: "postgresql:PostgreSQLDataSource:execute:connected",
        params: { connectionString: this.config.connectionString },
      });
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "postgresql:PostgreSQLDataSource:execute:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      await client.end();
    }
  }

  async subscribe(config, onEvent) {
    const channels = (config.channels || "").split(",").map(c => c.trim()).filter(Boolean);
    
    if (!channels.length) {
      throw new Error("No channels specified for PostgreSQL listener");
    }

    Logger.log("info", {
      message: "postgresql:subscribe:start",
      params: { channels, datasourceID: this.config.datasourceID },
    });

    const client = new Client({
      connectionString: this.config.datasourceOptions?.connectionString,
      ...this.config.datasourceOptions?.connectionData,
    });
    
    await client.connect();

    client.on("notification", (msg) => {
      let payload = msg.payload;
      if (payload) {
        try {
          payload = JSON.parse(msg.payload);
        } catch {}
      }
      
      onEvent({
        channel: msg.channel,
        payload,
      });
    });

    for (const channel of channels) {
      // Basic escaping for identifiers by doubling quotes
      const escapedChannel = channel.replace(/"/g, '""');
      await client.query(`LISTEN "${escapedChannel}"`);
    }

    return { client, channels };
  }

  async unsubscribe(handle) {
    if (!handle || !handle.client) return;

    Logger.log("info", {
      message: "postgresql:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      for (const channel of handle.channels || []) {
        try {
          const escapedChannel = channel.replace(/"/g, '""');
          await handle.client.query(`UNLISTEN "${escapedChannel}"`);
        } catch (e) {
          // Ignore error if client is disconnected
        }
      }
      await handle.client.end();
    } catch (e) {
      Logger.log("error", {
        message: "postgresql:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
