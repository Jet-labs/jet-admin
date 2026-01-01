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

export { dataSourceRegistry };

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
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await restAPITestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.WEB_URL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await webURLTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.FIRESTORE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await firestoreTestConnection({ datasourceOptions });
    },
  },
  // Batch 1 datasources
  [DATASOURCE_TYPES.MSSQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mssqlTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.SUPABASE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await supabaseTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.BIGQUERY.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await bigqueryTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.AIRTABLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await airtableTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.S3.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await s3TestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.ELASTICSEARCH.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await elasticsearchTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.STRIPE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await stripeTestConnection({ datasourceOptions });
    },
  },
  // Batch 2 datasources
  [DATASOURCE_TYPES.ORACLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await oracleTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.SQLITE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sqliteTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.COCKROACHDB.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await cockroachdbTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.NEO4J.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await neo4jTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.TWILIO.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await twilioTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.SENDGRID.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sendgridTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.SLACK.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await slackTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.NOTION.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await notionTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.JIRA.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await jiraTestConnection({ datasourceOptions });
    },
  },
  [DATASOURCE_TYPES.GOOGLEANALYTICS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await googleanalyticsTestConnection({ datasourceOptions });
    },
  },
};
