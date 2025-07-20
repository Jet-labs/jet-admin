import React from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { QueryResponseView } from "./components/common/queryResponseView";

import postgreSQLFormConfig from "./components/postgresql/formConfig.json";
import postgreSQLQueryConfigForm from "./components/postgresql/query/queryConfig.json";
import { PostgreSQLDatasourceTestResultUI } from "./components/postgresql/datasource/datasourceTestResultUI";

import restAPIFormConfig from "./components/restapi/formConfig.json";
import restAPIQueryConfigForm from "./components/restapi/query/queryConfig.json";
import { RESTAPIDatasourceTestResultUI } from "./components/restapi/datasource/datasourceTestResultUI";

import webURLFormConfig from "./components/weburl/formConfig.json";
import webURLQueryConfigForm from "./components/weburl/query/queryConfig.json";
import { WebURLDatasourceTestResultUI } from "./components/weburl/datasource/datasourceTestResultUI";
import { WebViewQueryResponseView } from "./components/common/webViewQueryResponseView";

export const DATASOURCE_UI_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    formConfig: postgreSQLFormConfig,
    queryConfigForm: postgreSQLQueryConfigForm,
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
    formConfig: restAPIFormConfig,
    queryConfigForm: restAPIQueryConfigForm,
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
    formConfig: webURLFormConfig,
    queryConfigForm: webURLQueryConfigForm,
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
