import { Client } from "pg";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

/**
 * Normalize the two supported PostgreSQL configuration shapes.
 *
 * The form writes `connectionDetails`; older API clients and the listener
 * tests use `connectionData`; the connection-string option is separate.
 * Every pg consumer must use this helper so the form, tester, executor, and
 * listener all resolve the same credentials.
 */
export function buildPostgresClientConfig(datasourceOptions = {}) {
  const options = datasourceOptions || {};
  const details = options.connectionDetails || options.connectionData || {};
  const option = options.connectionOption;

  if (option !== "connectionDetails" && options.connectionString) {
    return { connectionString: options.connectionString };
  }

  const config = {};
  if (details.host) config.host = details.host;
  if (details.port !== undefined && details.port !== null && details.port !== "") {
    config.port = Number(details.port);
  }
  if (details.database) config.database = details.database;
  if (details.user) config.user = details.user;
  if (details.password !== undefined) config.password = details.password;

  const sslMode = details.sslMode || options.sslMode;
  if (sslMode && sslMode !== "disable") {
    config.ssl = {
      rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full",
    };
  }

  const additional = details.additionalOptions || {};
  if (Number(additional.connectTimeout) > 0) {
    config.connectionTimeoutMillis = Number(additional.connectTimeout) * 1000;
  }
  if (additional.applicationName) {
    config.application_name = additional.applicationName;
  }

  return config;
}

export default class PostgreSQLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "postgresql:PostgreSQLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });
    const { query } = dataQueryOptions;
    const client = new Client(buildPostgresClientConfig(this.config.datasourceOptions));
    try {
      await client.connect();
      Logger.log("info", {
        message: "postgresql:PostgreSQLDataSource:execute:connected",
        params: { datasourceID: this.config.datasourceID },
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

    const client = new Client(buildPostgresClientConfig(this.config.datasourceOptions));
    
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

  async getSchema(params, context) {
    const client = new Client(buildPostgresClientConfig(this.config.datasourceOptions));
    try {
      await client.connect();
      const query = `
        SELECT 
          c.table_name, 
          c.column_name, 
          c.data_type, 
          c.is_nullable,
          c.column_default,
          tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu 
          ON c.table_schema = kcu.table_schema 
          AND c.table_name = kcu.table_name 
          AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc 
          ON kcu.table_schema = tc.table_schema 
          AND kcu.table_name = tc.table_name 
          AND kcu.constraint_name = tc.constraint_name
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position;
      `;
      const res = await client.query(query);
      
      const tablesMap = {};
      for (const row of res.rows) {
        if (!tablesMap[row.table_name]) {
          tablesMap[row.table_name] = {
            tableName: row.table_name,
            columns: [],
          };
        }
        tablesMap[row.table_name].columns.push({
          columnName: row.column_name,
          dataType: row.data_type,
          isNullable: row.is_nullable === 'YES',
          defaultValue: row.column_default,
          isPrimaryKey: row.constraint_type === 'PRIMARY KEY',
        });
      }
      return { tables: Object.values(tablesMap) };
    } catch (error) {
      Logger.log("error", {
        message: "postgresql:PostgreSQLDataSource:getSchema:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      await client.end();
    }
  }

  async getSampleData(params, context) {
    const { table, limit = 5 } = params;
    if (!table || typeof table !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error("Invalid table name");
    }
    const client = new Client(buildPostgresClientConfig(this.config.datasourceOptions));
    try {
      await client.connect();
      const query = `SELECT * FROM "${table}" LIMIT ${parseInt(limit, 10)};`;
      const res = await client.query(query);
      return res.rows;
    } catch (error) {
      Logger.log("error", {
        message: "postgresql:PostgreSQLDataSource:getSampleData:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      await client.end();
    }
  }
}
