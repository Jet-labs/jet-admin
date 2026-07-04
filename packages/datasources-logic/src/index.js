import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { postgresqlTestConnection } from "./data-sources/postgresql/connection";
import { restAPITestConnection } from "./data-sources/restapi/connection";
import dataSourceRegistry from "./data-sources/index.js";
import { webURLTestConnection } from "./data-sources/weburl/connection";
import { firestoreTestConnection } from "./data-sources/firestore/connection";

// Batch 1 datasource connection imports
import { mssqlTestConnection } from "./data-sources/mssql/connection";
import { supabaseTestConnection } from "./data-sources/supabase/connection";
import { bigqueryTestConnection } from "./data-sources/bigquery/connection";
import { airtableTestConnection } from "./data-sources/airtable/connection";
import { s3TestConnection } from "./data-sources/s3/connection";
import { elasticsearchTestConnection } from "./data-sources/elasticsearch/connection";
import { stripeTestConnection } from "./data-sources/stripe/connection";

// Data sources with newly created connection files
import { googlesheetsTestConnection } from "./data-sources/googlesheets/connection";
import { graphqlTestConnection } from "./data-sources/graphql/connection";
import { mongodbTestConnection } from "./data-sources/mongodb/connection";
import { mysqlTestConnection } from "./data-sources/mysql/connection";
import { kafkaTestConnection } from "./data-sources/kafka/connection";
import { rabbitmqTestConnection } from "./data-sources/rabbitmq/connection";
import { redisTestConnection } from "./data-sources/redis/connection";


// Batch 2 datasource connection imports
import { oracleTestConnection } from "./data-sources/oracle/connection";
import { sqliteTestConnection } from "./data-sources/sqlite/connection";
import { cockroachdbTestConnection } from "./data-sources/cockroachdb/connection";
import { neo4jTestConnection } from "./data-sources/neo4j/connection";
import { twilioTestConnection } from "./data-sources/twilio/connection";
import { sendgridTestConnection } from "./data-sources/sendgrid/connection";
import { slackTestConnection } from "./data-sources/slack/connection";
import { notionTestConnection } from "./data-sources/notion/connection";
import { jiraTestConnection } from "./data-sources/jira/connection";
import { googleanalyticsTestConnection } from "./data-sources/googleanalytics/connection";

// Listeners
import { syslogTestConnection } from "./data-sources/syslog/connection";
import { webhookTestConnection } from "./data-sources/webhook/connection";
import { webhookRouter } from "./data-sources/webhook/router.js";
import { mqttTestConnection } from "./data-sources/mqtt/connection";
import { websocketTestConnection } from "./data-sources/websocket/connection";
import { sseTestConnection } from "./data-sources/sse/connection";
import { natsTestConnection } from "./data-sources/nats/connection";

import { excelcsvTestConnection } from "./data-sources/excelcsv/connection";

// AI Agent — Datasource manifest registry
import { getManifestForType } from "./data-sources/manifests";


export { dataSourceRegistry, webhookRouter };

/**
 * Helper: creates a getDatasourceInfo function for any datasource type.
 * Returns the LLM-readable manifest for use by the AI agent.
 * @param {string} datasourceType
 * @returns {Function}
 */
function _buildGetDatasourceInfo(datasourceType) {
  return async ({ datasourceOptions } = {}) => {
    return getManifestForType(datasourceType);
  };
}

export const DATASOURCE_LOGIC_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await postgresqlTestConnection({
        connectionString: datasourceOptions.connectionString,
        connectionData: {
          host: datasourceOptions.host,
          port: datasourceOptions.port,
          database: datasourceOptions.database,
          user: datasourceOptions.user,
          password: datasourceOptions.password,
        },
        helpers,
      });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("postgresql"),
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await restAPITestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("restapi"),
  },
  [DATASOURCE_TYPES.WEB_URL.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await webURLTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("weburl"),
  },
  [DATASOURCE_TYPES.FIRESTORE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await firestoreTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("firestore"),
  },
  [DATASOURCE_TYPES.MYSQL.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await mysqlTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mysql"),
  },
  [DATASOURCE_TYPES.MONGODB.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await mongodbTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mongodb"),
  },
  [DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await googlesheetsTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googlesheets"),
  },
  [DATASOURCE_TYPES.GRAPHQL.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await graphqlTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("graphql"),
  },
  // Batch 1 datasources
  [DATASOURCE_TYPES.MSSQL.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await mssqlTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mssql"),
  },
  [DATASOURCE_TYPES.SUPABASE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await supabaseTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("supabase"),
  },
  [DATASOURCE_TYPES.BIGQUERY.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await bigqueryTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("bigquery"),
  },
  [DATASOURCE_TYPES.AIRTABLE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await airtableTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("airtable"),
  },
  [DATASOURCE_TYPES.KAFKA.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await kafkaTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("kafka"),
  },
  [DATASOURCE_TYPES.RABBITMQ.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await rabbitmqTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("rabbitmq"),
  },
  [DATASOURCE_TYPES.REDIS.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await redisTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("redis"),
  },
  [DATASOURCE_TYPES.S3.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await s3TestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("s3"),
  },
  [DATASOURCE_TYPES.ELASTICSEARCH.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await elasticsearchTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("elasticsearch"),
  },
  [DATASOURCE_TYPES.STRIPE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await stripeTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("stripe"),
  },
  // Batch 2 datasources
  [DATASOURCE_TYPES.ORACLE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await oracleTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("oracle"),
  },
  [DATASOURCE_TYPES.SQLITE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await sqliteTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sqlite"),
  },
  [DATASOURCE_TYPES.COCKROACHDB.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await cockroachdbTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("cockroachdb"),
  },
  [DATASOURCE_TYPES.NEO4J.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await neo4jTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("neo4j"),
  },
  [DATASOURCE_TYPES.TWILIO.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await twilioTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("twilio"),
  },
  [DATASOURCE_TYPES.SENDGRID.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await sendgridTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sendgrid"),
  },
  [DATASOURCE_TYPES.SLACK.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await slackTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("slack"),
  },
  [DATASOURCE_TYPES.NOTION.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await notionTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("notion"),
  },
  [DATASOURCE_TYPES.JIRA.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await jiraTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("jira"),
  },
  [DATASOURCE_TYPES.GOOGLEANALYTICS.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await googleanalyticsTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googleanalytics"),
  },
  
  // Listeners
  [DATASOURCE_TYPES.SYSLOG.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await syslogTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("syslog"),
  },
  [DATASOURCE_TYPES.WEBHOOK.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await webhookTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("webhook"),
  },
  [DATASOURCE_TYPES.MQTT.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await mqttTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mqtt"),
  },
  [DATASOURCE_TYPES.WEBSOCKET.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await websocketTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("websocket"),
  },
  [DATASOURCE_TYPES.SSE.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await sseTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sse"),
  },
  [DATASOURCE_TYPES.NATS.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await natsTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("nats"),
  },
  [DATASOURCE_TYPES.EXCELCSV.value]: {
    testConnection: async ({ datasourceOptions, helpers }) => {
      return await excelcsvTestConnection({ datasourceOptions, helpers });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("excelcsv"),
  },
};
