import PostgreSQLDataSource from "./postgresql/datasource";
import RestAPIDataSource from "./restapi/datasource";
import WebURLDataSource from "./weburl/datasource";
import FirestoreDataSource from "./firestore/datasource";
import MySQLDataSource from "./mysql/datasource";
import MongoDBDataSource from "./mongodb/datasource";
import GoogleSheetsDataSource from "./googlesheets/datasource";
import GraphQLDataSource from "./graphql/datasource";
import RabbitMQDataSource from "./rabbitmq/datasource";
import KafkaDataSource from "./kafka/datasource";
import RedisDataSource from "./redis/datasource";

// Batch 1 datasource imports
import MSSQLDataSource from "./mssql/datasource";
import SupabaseDataSource from "./supabase/datasource";
import BigQueryDataSource from "./bigquery/datasource";
import AirtableDataSource from "./airtable/datasource";
import S3DataSource from "./s3/datasource";
import ElasticsearchDataSource from "./elasticsearch/datasource";
import StripeDataSource from "./stripe/datasource";

// Batch 2 datasource imports
import OracleDataSource from "./oracle/datasource";
import SQLiteDataSource from "./sqlite/datasource";
import CockroachDBDataSource from "./cockroachdb/datasource";
import Neo4jDataSource from "./neo4j/datasource";
import TwilioDataSource from "./twilio/datasource";
import SendGridDataSource from "./sendgrid/datasource";
import SlackDataSource from "./slack/datasource";
import NotionDataSource from "./notion/datasource";
import JiraDataSource from "./jira/datasource";
import GoogleAnalyticsDataSource from "./googleanalytics/datasource";

// Listeners
import SyslogDataSource from "./syslog/datasource";

const dataSources = {
  postgresql: PostgreSQLDataSource,
  restapi: RestAPIDataSource,
  weburl: WebURLDataSource,
  firestore: FirestoreDataSource,
  mysql: MySQLDataSource,
  mongodb: MongoDBDataSource,
  googlesheets: GoogleSheetsDataSource,
  graphql: GraphQLDataSource,
  rabbitmq: RabbitMQDataSource,
  kafka: KafkaDataSource,
  redis: RedisDataSource,
  // Batch 1 datasources
  mssql: MSSQLDataSource,
  supabase: SupabaseDataSource,
  bigquery: BigQueryDataSource,
  airtable: AirtableDataSource,
  s3: S3DataSource,
  elasticsearch: ElasticsearchDataSource,
  stripe: StripeDataSource,
  // Batch 2 datasources
  oracle: OracleDataSource,
  sqlite: SQLiteDataSource,
  cockroachdb: CockroachDBDataSource,
  neo4j: Neo4jDataSource,
  twilio: TwilioDataSource,
  sendgrid: SendGridDataSource,
  slack: SlackDataSource,
  notion: NotionDataSource,
  jira: JiraDataSource,
  googleanalytics: GoogleAnalyticsDataSource,
  
  // Listeners
  syslog: SyslogDataSource,
};

export default {
  getDataSource(type) {
    const DataSource = dataSources[type.toLowerCase()];
    if (!DataSource) throw new Error(`Unsupported data source: ${type}`);
    return DataSource;
  },

  registerDataSource(type, implementation) {
    dataSources[type.toLowerCase()] = implementation;
  },
};
