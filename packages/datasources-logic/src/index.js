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

import { excelcsvTestConnection } from "./data-sources/excelcsv/connection";

// AI Agent — Datasource manifest registry
import { getManifestForType } from "./data-sources/manifests";


export { dataSourceRegistry };

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
    testConnection: async ({ datasourceOptions }) => {
      return await postgresqlTestConnection({
        connectionString: datasourceOptions.connectionString,
        connectionData: {
          host: datasourceOptions.host,
          port: datasourceOptions.port,
          database: datasourceOptions.database,
          user: datasourceOptions.user,
          password: datasourceOptions.password,
        },
      });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("postgresql"),
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await restAPITestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("restapi"),
  },
  [DATASOURCE_TYPES.WEB_URL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await webURLTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("weburl"),
  },
  [DATASOURCE_TYPES.FIRESTORE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await firestoreTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("firestore"),
  },
  [DATASOURCE_TYPES.MYSQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mysqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mysql"),
  },
  [DATASOURCE_TYPES.MONGODB.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mongodbTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mongodb"),
  },
  [DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await googlesheetsTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googlesheets"),
  },
  [DATASOURCE_TYPES.GRAPHQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await graphqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("graphql"),
  },
  // Batch 1 datasources
  [DATASOURCE_TYPES.MSSQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mssqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mssql"),
  },
  [DATASOURCE_TYPES.SUPABASE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await supabaseTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("supabase"),
  },
  [DATASOURCE_TYPES.BIGQUERY.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await bigqueryTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("bigquery"),
  },
  [DATASOURCE_TYPES.AIRTABLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await airtableTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("airtable"),
  },
  [DATASOURCE_TYPES.KAFKA.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await kafkaTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("kafka"),
  },
  [DATASOURCE_TYPES.RABBITMQ.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await rabbitmqTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("rabbitmq"),
  },
  [DATASOURCE_TYPES.REDIS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await redisTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("redis"),
  },
  [DATASOURCE_TYPES.S3.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await s3TestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("s3"),
  },
  [DATASOURCE_TYPES.ELASTICSEARCH.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await elasticsearchTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("elasticsearch"),
  },
  [DATASOURCE_TYPES.STRIPE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await stripeTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("stripe"),
  },
  // Batch 2 datasources
  [DATASOURCE_TYPES.ORACLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await oracleTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("oracle"),
  },
  [DATASOURCE_TYPES.SQLITE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sqliteTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sqlite"),
  },
  [DATASOURCE_TYPES.COCKROACHDB.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await cockroachdbTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("cockroachdb"),
  },
  [DATASOURCE_TYPES.NEO4J.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await neo4jTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("neo4j"),
  },
  [DATASOURCE_TYPES.TWILIO.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await twilioTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("twilio"),
  },
  [DATASOURCE_TYPES.SENDGRID.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sendgridTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sendgrid"),
  },
  [DATASOURCE_TYPES.SLACK.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await slackTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("slack"),
  },
  [DATASOURCE_TYPES.NOTION.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await notionTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("notion"),
  },
  [DATASOURCE_TYPES.JIRA.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await jiraTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("jira"),
  },
  [DATASOURCE_TYPES.GOOGLEANALYTICS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await googleanalyticsTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googleanalytics"),
  },
  
  // Listeners
  [DATASOURCE_TYPES.SYSLOG.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await syslogTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("syslog"),
  },
  [DATASOURCE_TYPES.EXCELCSV.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await excelcsvTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("excelcsv"),
  },
};
