import React from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { QueryResponseView } from "./components/common/queryResponseView";
import { WebViewQueryResponseView } from "./components/common/webViewQueryResponseView";
import { ExcelCSVQueryBuilder } from "./components/excelcsv/ExcelCSVQueryBuilder";
import { GoogleSheetsDatasourceEditor } from "./components/googlesheets/GoogleSheetsDatasourceEditor";
import { GoogleSheetsQueryEditor } from "./components/googlesheets/GoogleSheetsQueryEditor";
import { PostgresQueryEditor } from "./components/postgres/PostgresQueryEditor";

import { GenericDatasourceTestResultUI } from "./components/common/genericDatasourceTestResultUI";

// ─── Context exports (definitions only — providers live in frontend app) ──────
export { DatasourceEditorContext, useDatasourceEditorContext } from "./context/DatasourceEditorContext";
export { QueryEditorContext, useQueryEditorContext } from "./context/QueryEditorContext";


// ─── Datasource UI component registry ─────────────────────────────────────────

// Helper to create standard datasource UI config
const createGenericDatasourceUI = () => ({
  queryResponseView: function ({ queryResult }) {
    return React.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function ({ connectionResult }) {
    return React.createElement(GenericDatasourceTestResultUI, { connectionResult });
  },
});

// Special UI for WEB_URL that uses WebViewQueryResponseView
const createWebUrlDatasourceUI = () => ({
  queryResponseView: function ({ queryResult }) {
    return React.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function ({ connectionResult }) {
    return React.createElement(GenericDatasourceTestResultUI, { connectionResult });
  },
});

export const DATASOURCE_UI_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    ...createGenericDatasourceUI(),
    dedicatedQueryEditor: function ({ queryEditorForm }) {
      return React.createElement(PostgresQueryEditor, { queryEditorForm });
    },
  },
  [DATASOURCE_TYPES.RESTAPI.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.WEB_URL.value]: createWebUrlDatasourceUI(),
  [DATASOURCE_TYPES.FIRESTORE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MYSQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MONGODB.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    ...createGenericDatasourceUI(),
    dedicatedDatasourceEditor: function ({ datasourceEditorForm }) {
      return React.createElement(GoogleSheetsDatasourceEditor, { datasourceEditorForm });
    },
    dedicatedQueryEditor: function ({ queryEditorForm }) {
      return React.createElement(GoogleSheetsQueryEditor, { queryEditorForm });
    },
  },
  [DATASOURCE_TYPES.GRAPHQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.RABBITMQ.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.KAFKA.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.REDIS.value]: createGenericDatasourceUI(),
  // Batch 1 datasources
  [DATASOURCE_TYPES.MSSQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SUPABASE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.BIGQUERY.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.AIRTABLE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.S3.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.ELASTICSEARCH.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.STRIPE.value]: createGenericDatasourceUI(),
  // Batch 2 datasources
  [DATASOURCE_TYPES.ORACLE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SQLITE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.COCKROACHDB.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.NEO4J.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.TWILIO.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SENDGRID.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SLACK.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.NOTION.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.JIRA.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.GOOGLEANALYTICS.value]: createGenericDatasourceUI(),
  // Listener-capable new datasources
  [DATASOURCE_TYPES.WEBHOOK.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MQTT.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.WEBSOCKET.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SSE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.SYSLOG.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.NATS.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.EXCELCSV.value]: {
    ...createGenericDatasourceUI(),
    dedicatedQueryEditor: function ({ queryEditorForm }) {
      return React.createElement(ExcelCSVQueryBuilder, { queryEditorForm });
    },
  },
};
