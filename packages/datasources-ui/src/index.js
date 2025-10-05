import React from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { QueryResponseView } from "./components/common/queryResponseView";

import { PostgreSQLDatasourceTestResultUI } from "./components/postgresql/datasource/datasourceTestResultUI";

import { RESTAPIDatasourceTestResultUI } from "./components/restapi/datasource/datasourceTestResultUI";

import { WebURLDatasourceTestResultUI } from "./components/weburl/datasource/datasourceTestResultUI";
import { WebViewQueryResponseView } from "./components/common/webViewQueryResponseView";

export const DATASOURCE_UI_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    formConfig: DATASOURCE_TYPES.POSTGRESQL.formConfig,
    queryConfigForm: DATASOURCE_TYPES.POSTGRESQL.queryConfigForm,
    queryResponseView: function ({ queryResult }) {
      return React.createElement(QueryResponseView, { queryResult });
    },
    datasourceTestResultUI: function ({ connectionResult }) {
      return React.createElement(PostgreSQLDatasourceTestResultUI, {
        connectionResult,
      });
    },
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    formConfig: DATASOURCE_TYPES.RESTAPI.formConfig,
    queryConfigForm: DATASOURCE_TYPES.RESTAPI.queryConfigForm,
    queryResponseView: function ({ queryResult }) {
      return React.createElement(QueryResponseView, { queryResult });
    },
    datasourceTestResultUI: function ({ connectionResult }) {
      return React.createElement(RESTAPIDatasourceTestResultUI, {
        connectionResult,
      });
    },
  },
  [DATASOURCE_TYPES.WEB_URL.value]: {
    formConfig: DATASOURCE_TYPES.WEB_URL.formConfig,
    queryConfigForm: DATASOURCE_TYPES.WEB_URL.queryConfigForm,
    datasourceTestResultUI: function ({ connectionResult }) {
      return React.createElement(WebURLDatasourceTestResultUI, {
        connectionResult,
      });
    },
    queryResponseView: function ({ queryResult }) {
      return React.createElement(WebViewQueryResponseView, { queryResult });
    },
  },
};
