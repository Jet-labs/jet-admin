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
import WebhookDataSource from "./webhook/datasource";
import WebSocketDataSource from "./websocket/datasource";
import SSEDataSource from "./sse/datasource";
import MQTTDataSource from "./mqtt/datasource";
import NatsDataSource from "./nats/datasource";

import ExcelCSVDataSource from "./excelcsv/datasource";

// New batch: analytics, metrics, files, and code-hosting integrations
import ClickHouseDataSource from "./clickhouse/datasource";
import DuckDBDataSource from "./duckdb/datasource";
import PrometheusDataSource from "./prometheus/datasource";
import InfluxDBDataSource from "./influxdb/datasource";
import FileSystemDataSource from "./filesystem/datasource";
import SFTPDataSource from "./sftp/datasource";
import GitHubDataSource from "./github/datasource";
import GitLabDataSource from "./gitlab/datasource";
import SMTPDataSource from "./smtp/datasource";
import LDAPDataSource from "./ldap/datasource";

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
  webhook: WebhookDataSource,
  websocket: WebSocketDataSource,
  sse: SSEDataSource,
  mqtt: MQTTDataSource,
  nats: NatsDataSource,

  excelcsv: ExcelCSVDataSource,

  // New batch
  clickhouse: ClickHouseDataSource,
  duckdb: DuckDBDataSource,
  prometheus: PrometheusDataSource,
  influxdb: InfluxDBDataSource,
  filesystem: FileSystemDataSource,
  sftp: SFTPDataSource,
  github: GitHubDataSource,
  gitlab: GitLabDataSource,
  smtp: SMTPDataSource,
  ldap: LDAPDataSource,
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
