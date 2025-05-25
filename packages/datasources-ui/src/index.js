import React from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { QueryResponseView } from "./components/common/queryResponseView";

import { PostgreSQLQueryEditor } from "./components/postgresql/query/postgreSQLQueryEditor";
import postgreSQLFormConfig from "./components/postgresql/formConfig.json";
import postgreSQLQueryConfigForm from "./components/postgresql/query/queryConfig.json";
import { PostgreSQLDatasourceTestResultUI } from "./components/postgresql/datasource/datasourceTestResultUI";

import restAPIQueryConfigForm from "./components/restapi/query/queryConfig.json";

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
    queryConfigForm: restAPIQueryConfigForm,
    queryResponseView: function ({ queryResult }) {
      return React.createElement(QueryResponseView, { queryResult });
    },
  },
};
