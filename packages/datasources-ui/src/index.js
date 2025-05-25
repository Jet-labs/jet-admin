import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { PostgreSQLQueryEditor } from "./components/postgresql/query/postgreSQLQueryEditor";
import { PostgreSQLQueryResponseView } from "./components/postgresql/query/postgreSQLQueryResponseView";
import postgreSQLFormConfig from "./components/postgresql/formConfig.json";
import restAPIFormConfig from "./components/restapi/formConfig.json";
import React from "react";
import { PostgreSQLDatasourceTestResultUI } from "./components/postgresql/datasource/datasourceTestResultUI";
import { RESTAPIDatasourceTestResultUI } from "./components/restapi/datasource/datasourceTestResultUI";

export const DATASOURCE_UI_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    formConfig: postgreSQLFormConfig,
    queryEditor: function ({ query, setQuery }) {
      return React.createElement(PostgreSQLQueryEditor, { query, setQuery });
    },
    queryResponseView: function ({ queryResult }) {
      return React.createElement(PostgreSQLQueryResponseView, { queryResult });
    },
    datasourceTestResultUI: function ({ connectionResult }) {
      return React.createElement(PostgreSQLDatasourceTestResultUI, {
        connectionResult,
      });
    },
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    formConfig: restAPIFormConfig,
    queryEditor: function ({ query, setQuery }) {
      return React.createElement(PostgreSQLQueryEditor, { query, setQuery });
    },
    queryResponseView: function ({ queryResult }) {
      return React.createElement(PostgreSQLQueryResponseView, { queryResult });
    },
    datasourceTestResultUI: function ({ connectionResult }) {
      return React.createElement(RESTAPIDatasourceTestResultUI, {
        connectionResult,
      });
    },
  },
};
