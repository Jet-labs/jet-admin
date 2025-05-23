import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { PostgreSQLQueryEditor } from "./components/postgresql/query/postgreSQLQueryEditor";
import { PostgreSQLQueryResponseView } from "./components/postgresql/query/postgreSQLQueryResponseView";
import formConfig from "./components/postgresql/formConfig.json";
import React from "react";

export const DATASOURCE_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    formConfig: formConfig,
    queryEditor: function({ query, setQuery }) {
      return React.createElement(PostgreSQLQueryEditor, { query, setQuery });
    },
    queryResponseView: function({ queryResult }) {
      return React.createElement(PostgreSQLQueryResponseView, { queryResult });
    },
  },
};
