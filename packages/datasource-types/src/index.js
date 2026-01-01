import postgresqlFormConfig from "./postgresql/formConfig.json";
import postgresqlQueryConfigForm from "./postgresql/queryConfig.json";

import restAPIFormConfig from "./restapi/formConfig.json";
import restAPIQueryConfigForm from "./restapi/queryConfig.json";

import webURLFormConfig from "./weburl/formConfig.json";
import webURLQueryConfigForm from "./weburl/queryConfig.json";

import firestoreFormConfig from "./firestore/formConfig.json";
import firestoreQueryConfigForm from "./firestore/queryConfig.json";

import mysqlFormConfig from "./mysql/formConfig.json";
import mysqlQueryConfigForm from "./mysql/queryConfig.json";

import mongodbFormConfig from "./mongodb/formConfig.json";
import mongodbQueryConfigForm from "./mongodb/queryConfig.json";

import googlesheetsFormConfig from "./googlesheets/formConfig.json";
import googlesheetsQueryConfigForm from "./googlesheets/queryConfig.json";

import graphqlFormConfig from "./graphql/formConfig.json";
import graphqlQueryConfigForm from "./graphql/queryConfig.json";

import rabbitmqFormConfig from "./rabbitmq/formConfig.json";
import rabbitmqQueryConfigForm from "./rabbitmq/queryConfig.json";

import kafkaFormConfig from "./kafka/formConfig.json";
import kafkaQueryConfigForm from "./kafka/queryConfig.json";

import redisFormConfig from "./redis/formConfig.json";
import redisQueryConfigForm from "./redis/queryConfig.json";

// Batch 1 datasources
import mssqlFormConfig from "./mssql/formConfig.json";
import mssqlQueryConfigForm from "./mssql/queryConfig.json";

import supabaseFormConfig from "./supabase/formConfig.json";
import supabaseQueryConfigForm from "./supabase/queryConfig.json";

import bigqueryFormConfig from "./bigquery/formConfig.json";
import bigqueryQueryConfigForm from "./bigquery/queryConfig.json";

import airtableFormConfig from "./airtable/formConfig.json";
import airtableQueryConfigForm from "./airtable/queryConfig.json";

import s3FormConfig from "./s3/formConfig.json";
import s3QueryConfigForm from "./s3/queryConfig.json";

import elasticsearchFormConfig from "./elasticsearch/formConfig.json";
import elasticsearchQueryConfigForm from "./elasticsearch/queryConfig.json";

import stripeFormConfig from "./stripe/formConfig.json";
import stripeQueryConfigForm from "./stripe/queryConfig.json";

// Batch 2 datasources
import oracleFormConfig from "./oracle/formConfig.json";
import oracleQueryConfigForm from "./oracle/queryConfig.json";

import sqliteFormConfig from "./sqlite/formConfig.json";
import sqliteQueryConfigForm from "./sqlite/queryConfig.json";

import cockroachdbFormConfig from "./cockroachdb/formConfig.json";
import cockroachdbQueryConfigForm from "./cockroachdb/queryConfig.json";

import neo4jFormConfig from "./neo4j/formConfig.json";
import neo4jQueryConfigForm from "./neo4j/queryConfig.json";

import twilioFormConfig from "./twilio/formConfig.json";
import twilioQueryConfigForm from "./twilio/queryConfig.json";

import sendgridFormConfig from "./sendgrid/formConfig.json";
import sendgridQueryConfigForm from "./sendgrid/queryConfig.json";

import slackFormConfig from "./slack/formConfig.json";
import slackQueryConfigForm from "./slack/queryConfig.json";

import notionFormConfig from "./notion/formConfig.json";
import notionQueryConfigForm from "./notion/queryConfig.json";

import jiraFormConfig from "./jira/formConfig.json";
import jiraQueryConfigForm from "./jira/queryConfig.json";

import googleanalyticsFormConfig from "./googleanalytics/formConfig.json";
import googleanalyticsQueryConfigForm from "./googleanalytics/queryConfig.json";

export const DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql",
    icon: "SiPostgresql",
    iconColor: "#336791",
    formConfig: postgresqlFormConfig,
    queryConfigForm: postgresqlQueryConfigForm,
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi",
    icon: "TbApi",
    iconColor: "#10b981",
    formConfig: restAPIFormConfig,
    queryConfigForm: restAPIQueryConfigForm,
  },
  WEB_URL: {
    name: "Web URL",
    value: "weburl",
    icon: "TbWorldWww",
    iconColor: "#3b82f6",
    formConfig: webURLFormConfig,
    queryConfigForm: webURLQueryConfigForm,
  },
  FIRESTORE: {
    name: "Firestore",
    value: "firestore",
    icon: "SiFirebase",
    iconColor: "#FFCA28",
    formConfig: firestoreFormConfig,
    queryConfigForm: firestoreQueryConfigForm,
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql",
    icon: "SiMysql",
    iconColor: "#4479A1",
    formConfig: mysqlFormConfig,
    queryConfigForm: mysqlQueryConfigForm,
  },
  MONGODB: {
    name: "MongoDB",
    value: "mongodb",
    icon: "SiMongodb",
    iconColor: "#47A248",
    formConfig: mongodbFormConfig,
    queryConfigForm: mongodbQueryConfigForm,
  },
  GOOGLESHEETS: {
    name: "Google Sheets",
    value: "googlesheets",
    icon: "SiGooglesheets",
    iconColor: "#0F9D58",
    formConfig: googlesheetsFormConfig,
    queryConfigForm: googlesheetsQueryConfigForm,
  },
  GRAPHQL: {
    name: "GraphQL",
    value: "graphql",
    icon: "SiGraphql",
    iconColor: "#E10098",
    formConfig: graphqlFormConfig,
    queryConfigForm: graphqlQueryConfigForm,
  },
  RABBITMQ: {
    name: "RabbitMQ",
    value: "rabbitmq",
    icon: "SiRabbitmq",
    iconColor: "#FF6600",
    formConfig: rabbitmqFormConfig,
    queryConfigForm: rabbitmqQueryConfigForm,
  },
  KAFKA: {
    name: "Kafka",
    value: "kafka",
    icon: "SiApachekafka",
    iconColor: "#231F20",
    formConfig: kafkaFormConfig,
    queryConfigForm: kafkaQueryConfigForm,
  },
  REDIS: {
    name: "Redis",
    value: "redis",
    icon: "SiRedis",
    iconColor: "#DC382D",
    formConfig: redisFormConfig,
    queryConfigForm: redisQueryConfigForm,
  },
  // Batch 1 datasources
  MSSQL: {
    name: "Microsoft SQL Server",
    value: "mssql",
    icon: "SiMicrosoftsqlserver",
    iconColor: "#CC2927",
    formConfig: mssqlFormConfig,
    queryConfigForm: mssqlQueryConfigForm,
  },
  SUPABASE: {
    name: "Supabase",
    value: "supabase",
    icon: "SiSupabase",
    iconColor: "#3ECF8E",
    formConfig: supabaseFormConfig,
    queryConfigForm: supabaseQueryConfigForm,
  },
  BIGQUERY: {
    name: "BigQuery",
    value: "bigquery",
    icon: "SiGooglebigquery",
    iconColor: "#4285F4",
    formConfig: bigqueryFormConfig,
    queryConfigForm: bigqueryQueryConfigForm,
  },
  AIRTABLE: {
    name: "Airtable",
    value: "airtable",
    icon: "SiAirtable",
    iconColor: "#18BFFF",
    formConfig: airtableFormConfig,
    queryConfigForm: airtableQueryConfigForm,
  },
  S3: {
    name: "AWS S3",
    value: "s3",
    icon: "SiAmazons3",
    iconColor: "#569A31",
    formConfig: s3FormConfig,
    queryConfigForm: s3QueryConfigForm,
  },
  ELASTICSEARCH: {
    name: "Elasticsearch",
    value: "elasticsearch",
    icon: "SiElasticsearch",
    iconColor: "#005571",
    formConfig: elasticsearchFormConfig,
    queryConfigForm: elasticsearchQueryConfigForm,
  },
  STRIPE: {
    name: "Stripe",
    value: "stripe",
    icon: "SiStripe",
    iconColor: "#635BFF",
    formConfig: stripeFormConfig,
    queryConfigForm: stripeQueryConfigForm,
  },
  // Batch 2 datasources
  ORACLE: {
    name: "Oracle",
    value: "oracle",
    icon: "SiOracle",
    iconColor: "#F80000",
    formConfig: oracleFormConfig,
    queryConfigForm: oracleQueryConfigForm,
  },
  SQLITE: {
    name: "SQLite",
    value: "sqlite",
    icon: "SiSqlite",
    iconColor: "#003B57",
    formConfig: sqliteFormConfig,
    queryConfigForm: sqliteQueryConfigForm,
  },
  COCKROACHDB: {
    name: "CockroachDB",
    value: "cockroachdb",
    icon: "SiCockroachlabs",
    iconColor: "#6933FF",
    formConfig: cockroachdbFormConfig,
    queryConfigForm: cockroachdbQueryConfigForm,
  },
  NEO4J: {
    name: "Neo4j",
    value: "neo4j",
    icon: "SiNeo4j",
    iconColor: "#008CC1",
    formConfig: neo4jFormConfig,
    queryConfigForm: neo4jQueryConfigForm,
  },
  TWILIO: {
    name: "Twilio",
    value: "twilio",
    icon: "SiTwilio",
    iconColor: "#F22F46",
    formConfig: twilioFormConfig,
    queryConfigForm: twilioQueryConfigForm,
  },
  SENDGRID: {
    name: "SendGrid",
    value: "sendgrid",
    icon: "SiSendgrid",
    iconColor: "#1A82E2",
    formConfig: sendgridFormConfig,
    queryConfigForm: sendgridQueryConfigForm,
  },
  SLACK: {
    name: "Slack",
    value: "slack",
    icon: "SiSlack",
    iconColor: "#4A154B",
    formConfig: slackFormConfig,
    queryConfigForm: slackQueryConfigForm,
  },
  NOTION: {
    name: "Notion",
    value: "notion",
    icon: "SiNotion",
    iconColor: "#000000",
    formConfig: notionFormConfig,
    queryConfigForm: notionQueryConfigForm,
  },
  JIRA: {
    name: "Jira",
    value: "jira",
    icon: "SiJira",
    iconColor: "#0052CC",
    formConfig: jiraFormConfig,
    queryConfigForm: jiraQueryConfigForm,
  },
  GOOGLEANALYTICS: {
    name: "Google Analytics",
    value: "googleanalytics",
    icon: "SiGoogleanalytics",
    iconColor: "#E37400",
    formConfig: googleanalyticsFormConfig,
    queryConfigForm: googleanalyticsQueryConfigForm,
  },
};

/**
 * Get datasource type config by value (e.g., 'postgresql', 'restapi', 'weburl')
 * @param {string} value - The datasource type value
 * @returns {object|undefined} The datasource type config or undefined if not found
 */
export const getDatasourceTypeByValue = (value) => {
  return Object.values(DATASOURCE_TYPES).find(type => type.value === value);
};
