var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_UI_COMPONENTS: () => DATASOURCE_UI_COMPONENTS
});
module.exports = __toCommonJS(index_exports);
var import_react8 = __toESM(require("react"));
var import_datasource_types = require("@jet-admin/datasource-types");

// src/components/common/queryResponseView.js
var import_ui4 = require("@jet-admin/ui");
var import_react5 = __toESM(require("react"));

// src/components/common/queryResponseJSONTab.js
var import_react = __toESM(require("react"));
var import_ui = require("@jet-admin/ui");
var import_prop_types = __toESM(require("prop-types"));
var QueryResponseJSONTab = ({ data }) => {
  QueryResponseJSONTab.propTypes = {
    data: import_prop_types.default.object
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto pb-5" }, /* @__PURE__ */ import_react.default.createElement(
    import_ui.CodeEditor,
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
var import_react2 = __toESM(require("react"));
var import_ui2 = require("@jet-admin/ui");
var import_prop_types2 = __toESM(require("prop-types"));
var QueryResponseRAWTab = ({ data }) => {
  QueryResponseRAWTab.propTypes = {
    data: import_prop_types2.default.object
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ import_react2.default.createElement(
    import_ui2.CodeEditor,
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
var import_react3 = __toESM(require("react"));
var import_ui3 = require("@jet-admin/ui");
var import_styles = require("react-data-grid/lib/styles.css");
var import_to_json_schema = __toESM(require("to-json-schema"));
var import_prop_types3 = __toESM(require("prop-types"));
var QueryResponseSchemaTab = ({ data }) => {
  QueryResponseSchemaTab.propTypes = {
    data: import_prop_types3.default.object
  };
  const dataSchema = (0, import_to_json_schema.default)(
    data ? data : { arrays: { mode: "all" } }
  );
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ import_react3.default.createElement(
    import_ui3.CodeEditor,
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
var import_material = require("@mui/material");
var import_react4 = __toESM(require("react"));
var import_x_data_grid = require("@mui/x-data-grid");
var import_to_json_schema2 = __toESM(require("to-json-schema"));
var import_prop_types4 = __toESM(require("prop-types"));
var QueryResponseTableTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseTableTab.propTypes = {
    data: import_prop_types4.default.array,
    className: import_prop_types4.default.string,
    height: import_prop_types4.default.string,
    width: import_prop_types4.default.string
  };
  const dataSchema = Array.isArray(data) && data.length > 0 ? (0, import_to_json_schema2.default)(data[0]) : null;
  const columns = (0, import_react4.useMemo)(() => {
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
  return /* @__PURE__ */ import_react4.default.createElement(
    import_material.Box,
    {
      sx: { width, height },
      className: `!flex !flex-col !justify-start !items-stretch ${className}`
    },
    !dataSchema ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex flex-col justify-center items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "Data schema not valid or no data available")) : !columns ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "Columns cannot be extracted or mapped")) : data && Array.isArray(data) && data.length && columns ? /* @__PURE__ */ import_react4.default.createElement(
      import_x_data_grid.DataGrid,
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
    ) : /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "No data"))
  );
};

// src/components/common/queryResponseView.js
var import_prop_types5 = __toESM(require("prop-types"));
var QueryResponseView = ({ queryResult }) => {
  const [tab, setTab] = (0, import_react5.useState)(0);
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col h-full overflow-hidden p-4" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center" }, ["Table", "JSON", "Raw", "Data Schema"].map((label, index) => /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      key: label,
      variant: "ghost",
      className: `px-4 mr-2 py-2 text-sm font-medium rounded-sm transition-colors ${index === tab ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"}`,
      onClick: () => setTab(index),
      type: "button"
    },
    label
  ))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background flex flex-col gap-2 overflow-y-auto flex-1" }, tab === 0 && /* @__PURE__ */ import_react5.default.createElement(QueryResponseTableTab, { data: queryResult ? queryResult : "" }), tab === 1 && /* @__PURE__ */ import_react5.default.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" }), tab === 2 && /* @__PURE__ */ import_react5.default.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" }), tab === 3 && /* @__PURE__ */ import_react5.default.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })));
};
QueryResponseView.propTypes = {
  queryResult: import_prop_types5.default.object
};

// src/components/common/webViewQueryResponseView.js
var import_react7 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));

// src/components/common/queryResponseWebViewTab.js
var import_react6 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var QueryResponseWebViewTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseWebViewTab.propTypes = {
    data: import_prop_types6.default.array,
    className: import_prop_types6.default.string,
    height: import_prop_types6.default.string,
    width: import_prop_types6.default.string
  };
  console.log("data", data);
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto pb-5" }, /* @__PURE__ */ import_react6.default.createElement(
    "iframe",
    {
      src: data.url,
      title: "Web View",
      className: "w-full h-full border-none"
    }
  ));
};

// src/components/common/webViewQueryResponseView.js
var import_ui5 = require("@jet-admin/ui");
var WebViewQueryResponseView = ({ queryResult }) => {
  WebViewQueryResponseView.propTypes = {
    queryResult: import_prop_types7.default.object
  };
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(import_ui5.Tabs, { defaultValue: "web", className: "w-full flex flex-col h-full" }, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsList, null, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "web" }, "Web View"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "json" }, "JSON"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "raw" }, "Raw"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "schema" }, "Data Schema")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-100 h-full overflow-y-auto pb-5" }, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "web", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseWebViewTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "json", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "raw", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "schema", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })))));
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
  return import_react8.default.createElement(
    "div",
    { className: "p-3" },
    import_react8.default.createElement(
      "div",
      {
        className: `w-full flex flex-col justify-start items-start p-3 rounded-md border ${connectionResultClass}`
      },
      import_react8.default.createElement(
        "div",
        { className: "!flex !flex-row justify-start items-center" },
        import_react8.default.createElement("span", { className: "!text-sm !font-normal" }, connectionResultText)
      )
    )
  );
};
var createGenericDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react8.default.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react8.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var createWebUrlDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react8.default.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react8.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var DATASOURCE_UI_COMPONENTS = {
  [import_datasource_types.DATASOURCE_TYPES.POSTGRESQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.RESTAPI.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.WEB_URL.value]: createWebUrlDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.FIRESTORE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MYSQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MONGODB.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.GOOGLESHEETS.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.GRAPHQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.RABBITMQ.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.KAFKA.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.REDIS.value]: createGenericDatasourceUI(),
  // Batch 1 datasources
  [import_datasource_types.DATASOURCE_TYPES.MSSQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SUPABASE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.BIGQUERY.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.AIRTABLE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.S3.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.ELASTICSEARCH.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.STRIPE.value]: createGenericDatasourceUI(),
  // Batch 2 datasources
  [import_datasource_types.DATASOURCE_TYPES.ORACLE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SQLITE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.COCKROACHDB.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NEO4J.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.TWILIO.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SENDGRID.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SLACK.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NOTION.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.JIRA.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.GOOGLEANALYTICS.value]: createGenericDatasourceUI(),
  // Listener-capable new datasources
  [import_datasource_types.DATASOURCE_TYPES.WEBHOOK.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MQTT.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.WEBSOCKET.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SSE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SYSLOG.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NATS.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.EXCELCSV.value]: createGenericDatasourceUI()
};
//# sourceMappingURL=index.cjs.map
