import React from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { QueryResponseView } from "./components/common/queryResponseView";
import { WebViewQueryResponseView } from "./components/common/webViewQueryResponseView";

// Generic test result UI for all datasources
const GenericDatasourceTestResultUI = ({ connectionResult }) => {
  let connectionResultClass = "bg-slate-100 !border-slate-200 text-[#1c1c1e]";
  let connectionResultText = "Connection not tested";
  console.log("connectionResult", connectionResult);

  if (connectionResult === true || (connectionResult?.ok === true)) {
    connectionResultClass = "bg-green-100 !border-green-400 text-green-700";
    connectionResultText = connectionResult?.statusText || "Connection successful";
  } else if (connectionResult === false || (connectionResult?.ok === false)) {
    connectionResultClass = "bg-red-100 !border-red-400 text-red-700";
    connectionResultText = connectionResult?.error || "Connection failed";
  } else if (connectionResult === undefined) {
    connectionResultClass = "bg-slate-100 !border-slate-200 text-[#1c1c1e]";
    connectionResultText = "Connection not tested";
  } else {
    connectionResultClass = "bg-orange-100 !border-orange-400 text-orange-700";
    connectionResultText = "Error testing connection";
  }

  return React.createElement("div", { className: "p-3" },
    React.createElement("div", {
      className: `w-full flex flex-col justify-start items-start p-3 rounded-md border ${connectionResultClass}`
    },
      React.createElement("div", { className: "!flex !flex-row justify-start items-center" },
        React.createElement("span", { className: "!text-sm !font-normal" }, connectionResultText)
      )
    )
  );
};

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
  [DATASOURCE_TYPES.POSTGRESQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.RESTAPI.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.WEB_URL.value]: createWebUrlDatasourceUI(),
  [DATASOURCE_TYPES.FIRESTORE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MYSQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MONGODB.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.GOOGLESHEETS.value]: createGenericDatasourceUI(),
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
};
