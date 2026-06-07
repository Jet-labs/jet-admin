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
var import_react9 = __toESM(require("react"));
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

// src/components/excelcsv/ExcelCSVQueryBuilder.jsx
var import_react8 = __toESM(require("react"));
var import_ui6 = require("@jet-admin/ui");
var import_lucide_react = require("lucide-react");
var FILTER_OPERATORS = [
  { value: "eq", label: "equals", needsValue: true },
  { value: "neq", label: "not equals", needsValue: true },
  { value: "gt", label: "greater than", needsValue: true },
  { value: "gte", label: "greater than or equal", needsValue: true },
  { value: "lt", label: "less than", needsValue: true },
  { value: "lte", label: "less than or equal", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "not_contains", label: "does not contain", needsValue: true },
  { value: "starts_with", label: "starts with", needsValue: true },
  { value: "ends_with", label: "ends with", needsValue: true },
  { value: "is_empty", label: "is empty", needsValue: false },
  { value: "is_not_empty", label: "is not empty", needsValue: false }
];
var SORT_DIRECTIONS = [
  { value: "asc", label: "A \u2192 Z  (Ascending)" },
  { value: "desc", label: "Z \u2192 A  (Descending)" }
];
var COLUMN_TYPES = [
  { value: "auto", label: "Auto" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" }
];
var TABS = [
  { id: "source", label: "Source", icon: import_lucide_react.Database },
  { id: "columns", label: "Columns", icon: import_lucide_react.Columns2 },
  { id: "filter", label: "Filter", icon: import_lucide_react.Filter },
  { id: "sort", label: "Sort", icon: import_lucide_react.ArrowUpDown },
  { id: "settings", label: "Settings", icon: import_lucide_react.SlidersHorizontal }
];
var genId = () => `_${Math.random().toString(36).slice(2, 9)}`;
function normalise(opts = {}) {
  return {
    sheetName: opts.sheetName ?? "",
    headerRow: opts.headerRow ?? 1,
    range: opts.range ?? "",
    limit: opts.limit ?? "",
    columns: Array.isArray(opts.columns) ? opts.columns : [],
    filters: Array.isArray(opts.filters) ? opts.filters : [],
    sort: Array.isArray(opts.sort) ? opts.sort : []
  };
}
function MonoLabel({ children }) {
  return /* @__PURE__ */ import_react8.default.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, children);
}
function InfoCallout({ children }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary/80 flex gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Info, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ import_react8.default.createElement("span", null, children));
}
function Badge({ count }) {
  if (!count) return null;
  return /* @__PURE__ */ import_react8.default.createElement("span", { className: "ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, count);
}
function LogicChip({ value, onChange }) {
  return /* @__PURE__ */ import_react8.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onChange(value === "AND" ? "OR" : "AND"),
      className: `text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${value === "AND" ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-50 text-amber-600 border-amber-200"}`
    },
    value
  );
}
function SourceTab({ opts, update }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react8.default.createElement(InfoCallout, null, "Configure which sheet and header row to read. Leave Sheet Name blank to use the first available sheet."), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "sheetName" }, "Sheet Name"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "sheetName",
      name: "sheetName",
      placeholder: "e.g. Sheet1",
      value: opts.sheetName,
      onChange: (e) => update({ sheetName: e.target.value })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Leave blank to read the first sheet.")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "headerRow" }, "Header Row"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "headerRow",
      name: "headerRow",
      type: "number",
      min: "1",
      placeholder: "1",
      value: opts.headerRow,
      onChange: (e) => update({ headerRow: Math.max(1, parseInt(e.target.value, 10) || 1) })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Row number (1-based) containing column headers."))));
}
function ColumnsTab({ opts, update }) {
  const columns = opts.columns;
  const addColumn = () => update({
    columns: [
      ...columns,
      { id: genId(), sourceName: "", alias: "", type: "auto", enabled: true }
    ]
  });
  const removeColumn = (id) => update({ columns: columns.filter((c) => c.id !== id) });
  const patchColumn = (id, patch) => update({ columns: columns.map((c) => c.id === id ? { ...c, ...patch } : c) });
  const moveColumn = (index, direction) => {
    const next = [...columns];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ columns: next });
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react8.default.createElement(InfoCallout, null, "Declare each column from your spreadsheet. Use ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Alias"), " ", "to rename it in query results. Leave empty to include all columns as-is."), columns.length === 0 ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Columns2, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-sm text-muted-foreground text-center" }, "No columns declared \u2014 all spreadsheet columns will be returned."), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Source Column"), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Alias (optional)"), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Type"), /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement("span", null)), columns.map((col, idx) => /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      key: col.id,
      className: `grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center rounded-md border px-2 py-1.5 transition-colors ${col.enabled ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.GripVertical, { className: "h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" }),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "e.g. Revenue",
        value: col.sourceName,
        onChange: (e) => patchColumn(col.id, { sourceName: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "same as source",
        value: col.alias,
        onChange: (e) => patchColumn(col.id, { alias: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: col.type || "auto",
        onValueChange: (val) => patchColumn(col.id, { type: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, COLUMN_TYPES.map((t) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: t.value, value: t.value, className: "text-xs" }, t.label)))
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => patchColumn(col.id, { enabled: !col.enabled }),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground transition-colors",
        title: col.enabled ? "Hide column" : "Show column"
      },
      col.enabled ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Eye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.EyeOff, { className: "h-3.5 w-3.5" })
    ),
    /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, 1),
        disabled: idx === columns.length - 1,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeColumn(col.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")));
}
function FilterTab({ opts, update }) {
  const filters = opts.filters;
  const addFilter = () => update({
    filters: [
      ...filters,
      { id: genId(), column: "", operator: "eq", value: "", logic: "AND" }
    ]
  });
  const removeFilter = (id) => update({ filters: filters.filter((f) => f.id !== id) });
  const patchFilter = (id, patch) => update({ filters: filters.map((f) => f.id === id ? { ...f, ...patch } : f) });
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react8.default.createElement(InfoCallout, null, "Filter rows after fetching. Multiple conditions are applied in order. Use the ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "AND / OR"), " chip to control how each condition combines with the next."), filters.length === 0 ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md border border-dashed border-border bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Filter, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-sm text-muted-foreground" }, "No filters applied \u2014 all rows will be returned."), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addFilter }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Filter")) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, filters.map((filter, idx) => {
    const operatorDef = FILTER_OPERATORS.find((o) => o.value === filter.operator);
    const needsValue = operatorDef?.needsValue !== false;
    return /* @__PURE__ */ import_react8.default.createElement("div", { key: filter.id, className: "space-y-1" }, idx > 0 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 py-0.5 pl-1" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "h-px flex-1 bg-border" }), /* @__PURE__ */ import_react8.default.createElement(
      LogicChip,
      {
        value: filter.logic,
        onChange: (val) => patchFilter(filter.id, { logic: val })
      }
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "h-px flex-1 bg-border" })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2" }, /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Column name",
        value: filter.column,
        onChange: (e) => patchFilter(filter.id, { column: e.target.value }),
        className: "h-7 text-xs flex-[2]",
        size: "sm"
      }
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: filter.operator,
        onValueChange: (val) => patchFilter(filter.id, { operator: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, FILTER_OPERATORS.map((op) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: op.value, value: op.value, className: "text-xs" }, op.label)))
    )), needsValue ? /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Value or {{inputs.param}}",
        value: filter.value,
        onChange: (e) => patchFilter(filter.id, { value: e.target.value }),
        className: "h-7 text-xs flex-[3] font-mono",
        size: "sm"
      }
    ) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-[3]" }), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeFilter(filter.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )));
  }), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addFilter, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Condition")), filters.length > 0 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md border border-border bg-muted/30 p-3 space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Dynamic values"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Use", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono" }, "{{inputs.paramName}}"), " ", "in Value fields to inject runtime inputs from the query engine.")));
}
function SortTab({ opts, update }) {
  const sort = opts.sort;
  const addSort = () => update({
    sort: [...sort, { id: genId(), column: "", direction: "asc" }]
  });
  const removeSort = (id) => update({ sort: sort.filter((s) => s.id !== id) });
  const patchSort = (id, patch) => update({ sort: sort.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const moveSort = (index, direction) => {
    const next = [...sort];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ sort: next });
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react8.default.createElement(InfoCallout, null, "Sort rows after fetching and filtering. Rules are applied from top to bottom \u2014 the first rule is the primary sort key."), sort.length === 0 ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md border border-dashed border-border bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.ArrowUpDown, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-sm text-muted-foreground" }, "No sort rules \u2014 rows returned in spreadsheet order."), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addSort }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "#"), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Column"), /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Direction"), /* @__PURE__ */ import_react8.default.createElement("span", null)), sort.map((rule, idx) => /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      key: rule.id,
      className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center rounded-md border border-border bg-background px-2 py-1.5"
    },
    /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, 1),
        disabled: idx === sort.length - 1,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react8.default.createElement(
      "span",
      {
        className: `inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${idx === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`
      },
      idx + 1
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Column name",
        value: rule.column,
        onChange: (e) => patchSort(rule.id, { column: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: rule.direction,
        onValueChange: (val) => patchSort(rule.id, { direction: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, SORT_DIRECTIONS.map((d) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: d.value, value: d.value, className: "text-xs" }, d.label)))
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeSort(rule.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addSort, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")));
}
function SettingsTab({ opts, update }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ import_react8.default.createElement(InfoCallout, null, "Advanced fetch settings. ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Range"), " limits which rows are read from the file itself (before any filters). ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Limit"), " ", "caps the final result count."), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Row Range"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "range" }, "A1-Notation Range"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "range",
      name: "range",
      placeholder: "e.g. A1:Z500",
      value: opts.range,
      onChange: (e) => update({ range: e.target.value })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Restricts rows read from the spreadsheet at the file-parse level. Format:", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "A1:Z100"), ". Leave blank for all rows.")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "limit" }, "Row Limit"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "limit",
      name: "limit",
      type: "number",
      min: "1",
      placeholder: "No limit",
      value: opts.limit,
      onChange: (e) => update({
        limit: e.target.value === "" ? "" : parseInt(e.target.value, 10)
      })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Maximum rows returned after all filters and sorts are applied. Equivalent to", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "rows.slice(0, limit)"), ".")))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react8.default.createElement(MonoLabel, null, "Full Datasource Call Preview"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded-md bg-foreground text-background p-4 font-mono text-[11px] leading-relaxed overflow-x-auto" }, /* @__PURE__ */ import_react8.default.createElement("code", { className: "whitespace-pre" }, buildDatasourcePreview(opts)))));
}
function buildDatasourcePreview(opts) {
  const enabledCols = (opts.columns || []).filter((c) => c.enabled && c.sourceName);
  const activeFilters = (opts.filters || []).filter((f) => f.column);
  const activeSort = (opts.sort || []).filter((s) => s.column);
  const obj = {
    ...opts.sheetName ? { sheetName: opts.sheetName } : {},
    headerRow: opts.headerRow || 1,
    ...opts.range ? { range: opts.range } : {},
    ...opts.limit ? { limit: opts.limit } : {},
    ...enabledCols.length ? {
      columns: enabledCols.map((c) => ({
        sourceName: c.sourceName,
        ...c.alias ? { alias: c.alias } : {},
        ...c.type && c.type !== "auto" ? { type: c.type } : {}
      }))
    } : {},
    ...activeFilters.length ? { filters: activeFilters.map(({ id, ...rest }) => rest) } : {},
    ...activeSort.length ? { sort: activeSort.map(({ id, ...rest }) => rest) } : {}
  };
  return JSON.stringify(obj, null, 2);
}
var ExcelCSVQueryBuilder = ({ dataQueryEditorForm }) => {
  const raw = dataQueryEditorForm?.values?.dataQueryOptions || {};
  const opts = normalise(raw);
  const [activeTab, setActiveTab] = (0, import_react8.useState)("source");
  const update = (0, import_react8.useCallback)(
    (updates) => {
      dataQueryEditorForm.setFieldValue("dataQueryOptions", {
        ...opts,
        ...updates
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataQueryEditorForm, JSON.stringify(opts)]
  );
  const badges = {
    columns: opts.columns.filter((c) => c.enabled && c.sourceName).length,
    filter: opts.filters.filter((f) => f.column).length,
    sort: opts.sort.filter((s) => s.column).length
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "border-t border-border mt-4 pt-4 space-y-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-0.5 border-b border-border pb-0 -mb-px" }, TABS.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        key: tab.id,
        type: "button",
        onClick: () => setActiveTab(tab.id),
        className: `inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`
      },
      /* @__PURE__ */ import_react8.default.createElement(Icon, { className: "h-3.5 w-3.5" }),
      tab.label,
      /* @__PURE__ */ import_react8.default.createElement(Badge, { count: badges[tab.id] })
    );
  })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "pt-4 pb-2" }, activeTab === "source" && /* @__PURE__ */ import_react8.default.createElement(SourceTab, { opts, update }), activeTab === "columns" && /* @__PURE__ */ import_react8.default.createElement(ColumnsTab, { opts, update }), activeTab === "filter" && /* @__PURE__ */ import_react8.default.createElement(FilterTab, { opts, update }), activeTab === "sort" && /* @__PURE__ */ import_react8.default.createElement(SortTab, { opts, update }), activeTab === "settings" && /* @__PURE__ */ import_react8.default.createElement(SettingsTab, { opts, update })));
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
  return import_react9.default.createElement(
    "div",
    { className: "p-3" },
    import_react9.default.createElement(
      "div",
      {
        className: `w-full flex flex-col justify-start items-start p-3 rounded-md border ${connectionResultClass}`
      },
      import_react9.default.createElement(
        "div",
        { className: "!flex !flex-row justify-start items-center" },
        import_react9.default.createElement("span", { className: "!text-sm !font-normal" }, connectionResultText)
      )
    )
  );
};
var createGenericDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react9.default.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react9.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var createWebUrlDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react9.default.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react9.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
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
  [import_datasource_types.DATASOURCE_TYPES.EXCELCSV.value]: {
    ...createGenericDatasourceUI(),
    dedicatedQueryBuilder: function({ dataQueryEditorForm }) {
      return import_react9.default.createElement(ExcelCSVQueryBuilder, { dataQueryEditorForm });
    }
  }
};
//# sourceMappingURL=index.cjs.map
