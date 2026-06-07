// src/index.js
import React8 from "react";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";

// src/components/common/queryResponseView.js
import { Button } from "@jet-admin/ui";
import React5, { useState } from "react";

// src/components/common/queryResponseJSONTab.js
import React from "react";
import { CodeEditor } from "@jet-admin/ui";
import PropTypes from "prop-types";
var QueryResponseJSONTab = ({ data }) => {
  QueryResponseJSONTab.propTypes = {
    data: PropTypes.object
  };
  return /* @__PURE__ */ React.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto pb-5" }, /* @__PURE__ */ React.createElement(
    CodeEditor,
    {
      value: JSON.stringify(data, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-slate-200"
    }
  ));
};

// src/components/common/queryResponseRawTab.js
import React2 from "react";
import { CodeEditor as CodeEditor2 } from "@jet-admin/ui";
import PropTypes2 from "prop-types";
var QueryResponseRAWTab = ({ data }) => {
  QueryResponseRAWTab.propTypes = {
    data: PropTypes2.object
  };
  return /* @__PURE__ */ React2.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ React2.createElement(
    CodeEditor2,
    {
      value: JSON.stringify(data, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-slate-200"
    }
  ));
};

// src/components/common/queryResponseSchemaTab.js
import React3 from "react";
import { CodeEditor as CodeEditor3 } from "@jet-admin/ui";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import PropTypes3 from "prop-types";
var QueryResponseSchemaTab = ({ data }) => {
  QueryResponseSchemaTab.propTypes = {
    data: PropTypes3.object
  };
  const dataSchema = jsonSchemaGenerator(
    data ? data : { arrays: { mode: "all" } }
  );
  return /* @__PURE__ */ React3.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ React3.createElement(
    CodeEditor3,
    {
      value: JSON.stringify(dataSchema, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-slate-200"
    }
  ));
};

// src/components/common/queryResponseTableTab.js
import { Box } from "@mui/material";
import React4, { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import jsonSchemaGenerator2 from "to-json-schema";
import PropTypes4 from "prop-types";
var QueryResponseTableTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseTableTab.propTypes = {
    data: PropTypes4.array,
    className: PropTypes4.string,
    height: PropTypes4.string,
    width: PropTypes4.string
  };
  const dataSchema = Array.isArray(data) && data.length > 0 ? jsonSchemaGenerator2(data[0]) : null;
  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return {
          key,
          name: key,
          field: key,
          display: "flex",
          headerName: String(key),
          width: 300
        };
      });
    } else {
      return null;
    }
  }, [dataSchema]);
  return /* @__PURE__ */ React4.createElement(
    Box,
    {
      sx: { width, height },
      className: `!flex !flex-col !justify-start !items-stretch ${className}`
    },
    !dataSchema ? /* @__PURE__ */ React4.createElement("div", { className: "!h-32 flex flex-col justify-center items-center w-full text-foreground" }, /* @__PURE__ */ React4.createElement("span", null, "Data schema not valid or no data available")) : !columns ? /* @__PURE__ */ React4.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ React4.createElement("span", null, "Columns cannot be extracted or mapped")) : data && Array.isArray(data) && data.length && columns ? /* @__PURE__ */ React4.createElement(
      DataGrid,
      {
        rows: data.map((item, index) => {
          return { _g_uuid: `_index_${index}`, ...item };
        }),
        virtualizeColumnsWithAutoRowHeight: true,
        columns,
        className: `!w-100 !border-0`,
        density: "compact",
        showCellVerticalBorder: true,
        getRowClassName: (params) => params.indexRelativeToCurrentPage % 2 === 0 ? "bg-primary/10" : "Mui-odd",
        getRowHeight: () => "auto",
        getRowId: (row) => row._g_uuid,
        defaultColumnOptions: {
          sortable: true,
          resizable: true
        },
        sx: {
          "--unstable_DataGrid-radius": "0",
          "& .MuiDataGrid-root": {
            borderRadius: 0
          },
          "& .MuiIconButton-root": {
            outline: "none"
          },
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem !important",
            lineHeight: "1.25rem !important",
            fontWeight: "400 !important"
          },
          "& .MuiCheckbox-root": {
            padding: "4px"
          },
          "& .MuiDataGrid-columnHeaderCheckbox": {
            minWidth: "auto !important",
            width: "auto !important",
            flex: "0 0 auto !important",
            padding: "0.25rem !important",
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              width: "auto",
              minWidth: "auto",
              flex: "none"
            }
          },
          "& .MuiDataGrid-cellCheckbox": {
            minWidth: "auto !important",
            width: "auto !important",
            flex: "0 0 auto !important",
            color: "hsl(var(--primary))",
            padding: "0.25rem !important"
          }
        }
      }
    ) : /* @__PURE__ */ React4.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ React4.createElement("span", null, "No data"))
  );
};

// src/components/common/queryResponseView.js
import PropTypes5 from "prop-types";
var QueryResponseView = ({ queryResult }) => {
  const [tab, setTab] = useState(0);
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col h-full overflow-hidden p-4" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center" }, ["Table", "JSON", "Raw", "Data Schema"].map((label, index) => /* @__PURE__ */ React5.createElement(
    Button,
    {
      key: label,
      variant: "ghost",
      className: `px-4 mr-2 py-2 text-sm font-medium rounded-sm transition-colors ${index === tab ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"}`,
      onClick: () => setTab(index),
      type: "button"
    },
    label
  ))), /* @__PURE__ */ React5.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background flex flex-col gap-2 overflow-y-auto flex-1" }, tab === 0 && /* @__PURE__ */ React5.createElement(QueryResponseTableTab, { data: queryResult ? queryResult : "" }), tab === 1 && /* @__PURE__ */ React5.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" }), tab === 2 && /* @__PURE__ */ React5.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" }), tab === 3 && /* @__PURE__ */ React5.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })));
};
QueryResponseView.propTypes = {
  queryResult: PropTypes5.object
};

// src/components/common/webViewQueryResponseView.js
import React7 from "react";
import PropTypes7 from "prop-types";

// src/components/common/queryResponseWebViewTab.js
import React6 from "react";
import PropTypes6 from "prop-types";
var QueryResponseWebViewTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseWebViewTab.propTypes = {
    data: PropTypes6.array,
    className: PropTypes6.string,
    height: PropTypes6.string,
    width: PropTypes6.string
  };
  console.log("data", data);
  return /* @__PURE__ */ React6.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto pb-5" }, /* @__PURE__ */ React6.createElement(
    "iframe",
    {
      src: data.url,
      title: "Web View",
      className: "w-full h-full border-none"
    }
  ));
};

// src/components/common/webViewQueryResponseView.js
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@jet-admin/ui";
var WebViewQueryResponseView = ({ queryResult }) => {
  WebViewQueryResponseView.propTypes = {
    queryResult: PropTypes7.object
  };
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(Tabs, { defaultValue: "web", className: "w-full flex flex-col h-full" }, /* @__PURE__ */ React7.createElement(TabsList, null, /* @__PURE__ */ React7.createElement(TabsTrigger, { value: "web" }, "Web View"), /* @__PURE__ */ React7.createElement(TabsTrigger, { value: "json" }, "JSON"), /* @__PURE__ */ React7.createElement(TabsTrigger, { value: "raw" }, "Raw"), /* @__PURE__ */ React7.createElement(TabsTrigger, { value: "schema" }, "Data Schema")), /* @__PURE__ */ React7.createElement("div", { className: "w-100 h-full overflow-y-auto pb-5" }, /* @__PURE__ */ React7.createElement(TabsContent, { value: "web", className: "m-0 h-full" }, /* @__PURE__ */ React7.createElement(QueryResponseWebViewTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ React7.createElement(TabsContent, { value: "json", className: "m-0 h-full" }, /* @__PURE__ */ React7.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ React7.createElement(TabsContent, { value: "raw", className: "m-0 h-full" }, /* @__PURE__ */ React7.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ React7.createElement(TabsContent, { value: "schema", className: "m-0 h-full" }, /* @__PURE__ */ React7.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })))));
};

// src/index.js
var GenericDatasourceTestResultUI = ({ connectionResult }) => {
  let connectionResultClass = "bg-muted/40 border-border text-foreground";
  let connectionResultText = "Connection not tested";
  console.log("connectionResult", connectionResult);
  if (connectionResult === true || connectionResult?.ok === true) {
    connectionResultClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    connectionResultText = connectionResult?.statusText || "Connection successful";
  } else if (connectionResult === false || connectionResult?.ok === false) {
    connectionResultClass = "bg-destructive/10 border-destructive/30 text-destructive";
    connectionResultText = connectionResult?.error || "Connection failed";
  } else if (connectionResult === void 0) {
    connectionResultClass = "bg-muted/40 border-border text-foreground";
    connectionResultText = "Connection not tested";
  } else {
    connectionResultClass = "bg-amber-500/10 border-amber-500/30 text-amber-400";
    connectionResultText = "Error testing connection";
  }
  return React8.createElement(
    "div",
    { className: "p-3" },
    React8.createElement(
      "div",
      {
        className: `w-full flex flex-col justify-start items-start p-3 rounded-md border ${connectionResultClass}`
      },
      React8.createElement(
        "div",
        { className: "!flex !flex-row justify-start items-center" },
        React8.createElement("span", { className: "!text-sm !font-normal" }, connectionResultText)
      )
    )
  );
};
var createGenericDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return React8.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return React8.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var createWebUrlDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return React8.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return React8.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var DATASOURCE_UI_COMPONENTS = {
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
  [DATASOURCE_TYPES.EXCELCSV.value]: createGenericDatasourceUI()
};
export {
  DATASOURCE_UI_COMPONENTS
};
//# sourceMappingURL=index.mjs.map
