// src/index.js
import React16 from "react";
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
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
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
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
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
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
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

// src/components/excelcsv/ExcelCSVQueryBuilder.jsx
import React8, { useState as useState2, useCallback, useRef } from "react";
import {
  Input,
  Label,
  Button as Button2,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@jet-admin/ui";
import {
  Plus,
  Trash2,
  GripVertical,
  Database,
  Columns2,
  Filter as FilterIcon,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Info
} from "lucide-react";
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
  { id: "source", label: "Source", icon: Database },
  { id: "columns", label: "Columns", icon: Columns2 },
  { id: "filter", label: "Filter", icon: FilterIcon },
  { id: "sort", label: "Sort", icon: ArrowUpDown },
  { id: "settings", label: "Settings", icon: SlidersHorizontal }
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
  return /* @__PURE__ */ React8.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, children);
}
function InfoCallout({ children }) {
  return /* @__PURE__ */ React8.createElement("div", { className: "rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary/80 flex gap-2" }, /* @__PURE__ */ React8.createElement(Info, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ React8.createElement("span", null, children));
}
function Badge({ count }) {
  if (!count) return null;
  return /* @__PURE__ */ React8.createElement("span", { className: "ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, count);
}
function LogicChip({ value, onChange }) {
  return /* @__PURE__ */ React8.createElement(
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
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React8.createElement(InfoCallout, null, "Configure which sheet and header row to read. Leave Sheet Name blank to use the first available sheet."), /* @__PURE__ */ React8.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React8.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React8.createElement(Label, { htmlFor: "sheetName" }, "Sheet Name"), /* @__PURE__ */ React8.createElement(
    Input,
    {
      id: "sheetName",
      name: "sheetName",
      placeholder: "e.g. Sheet1",
      value: opts.sheetName,
      onChange: (e) => update({ sheetName: e.target.value })
    }
  ), /* @__PURE__ */ React8.createElement("p", { className: "text-xs text-muted-foreground" }, "Leave blank to read the first sheet.")), /* @__PURE__ */ React8.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React8.createElement(Label, { htmlFor: "headerRow" }, "Header Row"), /* @__PURE__ */ React8.createElement(
    Input,
    {
      id: "headerRow",
      name: "headerRow",
      type: "number",
      min: "1",
      placeholder: "1",
      value: opts.headerRow,
      onChange: (e) => update({ headerRow: Math.max(1, parseInt(e.target.value, 10) || 1) })
    }
  ), /* @__PURE__ */ React8.createElement("p", { className: "text-xs text-muted-foreground" }, "Row number (1-based) containing column headers."))));
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
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React8.createElement(InfoCallout, null, "Declare each column from your spreadsheet. Use ", /* @__PURE__ */ React8.createElement("strong", null, "Alias"), " ", "to rename it in query results. Leave empty to include all columns as-is."), columns.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "rounded-md border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ React8.createElement(Columns2, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ React8.createElement("p", { className: "text-sm text-muted-foreground text-center" }, "No columns declared \u2014 all spreadsheet columns will be returned."), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addColumn }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")) : /* @__PURE__ */ React8.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React8.createElement("div", { className: "grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ React8.createElement("span", null), /* @__PURE__ */ React8.createElement(MonoLabel, null, "Source Column"), /* @__PURE__ */ React8.createElement(MonoLabel, null, "Alias (optional)"), /* @__PURE__ */ React8.createElement(MonoLabel, null, "Type"), /* @__PURE__ */ React8.createElement("span", null), /* @__PURE__ */ React8.createElement("span", null), /* @__PURE__ */ React8.createElement("span", null)), columns.map((col, idx) => /* @__PURE__ */ React8.createElement(
    "div",
    {
      key: col.id,
      className: `grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center rounded-md border px-2 py-1.5 transition-colors ${col.enabled ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`
    },
    /* @__PURE__ */ React8.createElement(GripVertical, { className: "h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" }),
    /* @__PURE__ */ React8.createElement(
      Input,
      {
        placeholder: "e.g. Revenue",
        value: col.sourceName,
        onChange: (e) => patchColumn(col.id, { sourceName: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ React8.createElement(
      Input,
      {
        placeholder: "same as source",
        value: col.alias,
        onChange: (e) => patchColumn(col.id, { alias: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ React8.createElement(
      Select,
      {
        value: col.type || "auto",
        onValueChange: (val) => patchColumn(col.id, { type: val })
      },
      /* @__PURE__ */ React8.createElement(SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ React8.createElement(SelectValue, null)),
      /* @__PURE__ */ React8.createElement(SelectContent, null, COLUMN_TYPES.map((t) => /* @__PURE__ */ React8.createElement(SelectItem, { key: t.value, value: t.value, className: "text-xs" }, t.label)))
    ),
    /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => patchColumn(col.id, { enabled: !col.enabled }),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground transition-colors",
        title: col.enabled ? "Hide column" : "Show column"
      },
      col.enabled ? /* @__PURE__ */ React8.createElement(Eye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ React8.createElement(EyeOff, { className: "h-3.5 w-3.5" })
    ),
    /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ React8.createElement(MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, 1),
        disabled: idx === columns.length - 1,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ React8.createElement(MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeColumn(col.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ React8.createElement(Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addColumn, className: "w-full" }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")));
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
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React8.createElement(InfoCallout, null, "Filter rows after fetching. Multiple conditions are applied in order. Use the ", /* @__PURE__ */ React8.createElement("strong", null, "AND / OR"), " chip to control how each condition combines with the next."), filters.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "rounded-md border border-dashed border-border bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ React8.createElement(FilterIcon, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ React8.createElement("p", { className: "text-sm text-muted-foreground" }, "No filters applied \u2014 all rows will be returned."), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addFilter }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Filter")) : /* @__PURE__ */ React8.createElement("div", { className: "space-y-2" }, filters.map((filter, idx) => {
    const operatorDef = FILTER_OPERATORS.find((o) => o.value === filter.operator);
    const needsValue = operatorDef?.needsValue !== false;
    return /* @__PURE__ */ React8.createElement("div", { key: filter.id, className: "space-y-1" }, idx > 0 && /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-2 py-0.5 pl-1" }, /* @__PURE__ */ React8.createElement("div", { className: "h-px flex-1 bg-border" }), /* @__PURE__ */ React8.createElement(
      LogicChip,
      {
        value: filter.logic,
        onChange: (val) => patchFilter(filter.id, { logic: val })
      }
    ), /* @__PURE__ */ React8.createElement("div", { className: "h-px flex-1 bg-border" })), /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2" }, /* @__PURE__ */ React8.createElement(
      Input,
      {
        placeholder: "Column name",
        value: filter.column,
        onChange: (e) => patchFilter(filter.id, { column: e.target.value }),
        className: "h-7 text-xs flex-[2]",
        size: "sm"
      }
    ), /* @__PURE__ */ React8.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ React8.createElement(
      Select,
      {
        value: filter.operator,
        onValueChange: (val) => patchFilter(filter.id, { operator: val })
      },
      /* @__PURE__ */ React8.createElement(SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ React8.createElement(SelectValue, null)),
      /* @__PURE__ */ React8.createElement(SelectContent, null, FILTER_OPERATORS.map((op) => /* @__PURE__ */ React8.createElement(SelectItem, { key: op.value, value: op.value, className: "text-xs" }, op.label)))
    )), needsValue ? /* @__PURE__ */ React8.createElement(
      Input,
      {
        placeholder: "Value or {{inputs.param}}",
        value: filter.value,
        onChange: (e) => patchFilter(filter.id, { value: e.target.value }),
        className: "h-7 text-xs flex-[3] font-mono",
        size: "sm"
      }
    ) : /* @__PURE__ */ React8.createElement("div", { className: "flex-[3]" }), /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeFilter(filter.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ React8.createElement(Trash2, { className: "h-3.5 w-3.5" })
    )));
  }), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addFilter, className: "w-full" }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Condition")), filters.length > 0 && /* @__PURE__ */ React8.createElement("div", { className: "rounded-md border border-border bg-muted/30 p-3 space-y-1" }, /* @__PURE__ */ React8.createElement(MonoLabel, null, "Dynamic values"), /* @__PURE__ */ React8.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Use", " ", /* @__PURE__ */ React8.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono" }, "{{inputs.paramName}}"), " ", "in Value fields to inject runtime inputs from the query engine.")));
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
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React8.createElement(InfoCallout, null, "Sort rows after fetching and filtering. Rules are applied from top to bottom \u2014 the first rule is the primary sort key."), sort.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "rounded-md border border-dashed border-border bg-muted/30 py-8 flex flex-col items-center gap-2" }, /* @__PURE__ */ React8.createElement(ArrowUpDown, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ React8.createElement("p", { className: "text-sm text-muted-foreground" }, "No sort rules \u2014 rows returned in spreadsheet order."), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addSort }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")) : /* @__PURE__ */ React8.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React8.createElement("div", { className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ React8.createElement("span", null), /* @__PURE__ */ React8.createElement(MonoLabel, null, "#"), /* @__PURE__ */ React8.createElement(MonoLabel, null, "Column"), /* @__PURE__ */ React8.createElement(MonoLabel, null, "Direction"), /* @__PURE__ */ React8.createElement("span", null)), sort.map((rule, idx) => /* @__PURE__ */ React8.createElement(
    "div",
    {
      key: rule.id,
      className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center rounded-md border border-border bg-background px-2 py-1.5"
    },
    /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ React8.createElement(MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, 1),
        disabled: idx === sort.length - 1,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ React8.createElement(MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ React8.createElement(
      "span",
      {
        className: `inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${idx === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`
      },
      idx + 1
    ),
    /* @__PURE__ */ React8.createElement(
      Input,
      {
        placeholder: "Column name",
        value: rule.column,
        onChange: (e) => patchSort(rule.id, { column: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ React8.createElement(
      Select,
      {
        value: rule.direction,
        onValueChange: (val) => patchSort(rule.id, { direction: val })
      },
      /* @__PURE__ */ React8.createElement(SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ React8.createElement(SelectValue, null)),
      /* @__PURE__ */ React8.createElement(SelectContent, null, SORT_DIRECTIONS.map((d) => /* @__PURE__ */ React8.createElement(SelectItem, { key: d.value, value: d.value, className: "text-xs" }, d.label)))
    ),
    /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeSort(rule.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ React8.createElement(Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ React8.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: addSort, className: "w-full" }, /* @__PURE__ */ React8.createElement(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")));
}
function SettingsTab({ opts, update }) {
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React8.createElement(InfoCallout, null, "Advanced fetch settings. ", /* @__PURE__ */ React8.createElement("strong", null, "Range"), " limits which rows are read from the file itself (before any filters). ", /* @__PURE__ */ React8.createElement("strong", null, "Limit"), " ", "caps the final result count."), /* @__PURE__ */ React8.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React8.createElement(MonoLabel, null, "Row Range"), /* @__PURE__ */ React8.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React8.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React8.createElement(Label, { htmlFor: "range" }, "A1-Notation Range"), /* @__PURE__ */ React8.createElement(
    Input,
    {
      id: "range",
      name: "range",
      placeholder: "e.g. A1:Z500",
      value: opts.range,
      onChange: (e) => update({ range: e.target.value })
    }
  ), /* @__PURE__ */ React8.createElement("p", { className: "text-xs text-muted-foreground" }, "Restricts rows read from the spreadsheet at the file-parse level. Format:", " ", /* @__PURE__ */ React8.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "A1:Z100"), ". Leave blank for all rows.")), /* @__PURE__ */ React8.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React8.createElement(Label, { htmlFor: "limit" }, "Row Limit"), /* @__PURE__ */ React8.createElement(
    Input,
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
  ), /* @__PURE__ */ React8.createElement("p", { className: "text-xs text-muted-foreground" }, "Maximum rows returned after all filters and sorts are applied. Equivalent to", " ", /* @__PURE__ */ React8.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "rows.slice(0, limit)"), ".")))), /* @__PURE__ */ React8.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React8.createElement(MonoLabel, null, "Full Datasource Call Preview"), /* @__PURE__ */ React8.createElement("div", { className: "rounded-md bg-foreground text-background p-4 font-mono text-[11px] leading-relaxed overflow-x-auto" }, /* @__PURE__ */ React8.createElement("code", { className: "whitespace-pre" }, buildDatasourcePreview(opts)))));
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
var ExcelCSVQueryBuilder = ({ queryEditorForm }) => {
  const raw = queryEditorForm?.dataQueryOptions || {};
  const opts = normalise(raw);
  const [activeTab, setActiveTab] = useState2("source");
  const update = useCallback(
    (updates) => {
      queryEditorForm.setQueryOptions({
        ...opts,
        ...updates
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryEditorForm, JSON.stringify(opts)]
  );
  const badges = {
    columns: opts.columns.filter((c) => c.enabled && c.sourceName).length,
    filter: opts.filters.filter((f) => f.column).length,
    sort: opts.sort.filter((s) => s.column).length
  };
  return /* @__PURE__ */ React8.createElement("div", { className: "border-t border-border mt-4 pt-4 space-y-0" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-0.5 border-b border-border pb-0 -mb-px" }, TABS.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ React8.createElement(
      "button",
      {
        key: tab.id,
        type: "button",
        onClick: () => setActiveTab(tab.id),
        className: `inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`
      },
      /* @__PURE__ */ React8.createElement(Icon, { className: "h-3.5 w-3.5" }),
      tab.label,
      /* @__PURE__ */ React8.createElement(Badge, { count: badges[tab.id] })
    );
  })), /* @__PURE__ */ React8.createElement("div", { className: "pt-4 pb-2" }, activeTab === "source" && /* @__PURE__ */ React8.createElement(SourceTab, { opts, update }), activeTab === "columns" && /* @__PURE__ */ React8.createElement(ColumnsTab, { opts, update }), activeTab === "filter" && /* @__PURE__ */ React8.createElement(FilterTab, { opts, update }), activeTab === "sort" && /* @__PURE__ */ React8.createElement(SortTab, { opts, update }), activeTab === "settings" && /* @__PURE__ */ React8.createElement(SettingsTab, { opts, update })));
};

// src/components/googlesheets/GoogleSheetsDatasourceEditor.jsx
import React11, { useState as useState3, useCallback as useCallback2 } from "react";

// src/context/DatasourceEditorContext.js
import React9, { createContext, useContext } from "react";
var DatasourceEditorContext = createContext(null);
var useDatasourceEditorContext = () => {
  const ctx = useContext(DatasourceEditorContext);
  if (!ctx) {
    throw new Error(
      "useDatasourceEditorContext() must be used inside a <DatasourceEditorContext.Provider>. This provider is wired in the frontend app's DatasourceEditor component."
    );
  }
  return ctx;
};

// src/primitives/EditorPrimitives.jsx
import React10 from "react";
import { Info as Info2 } from "lucide-react";
function MonoLabel2({ children }) {
  return /* @__PURE__ */ React10.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, children);
}
function InfoCallout2({ children }) {
  return /* @__PURE__ */ React10.createElement("div", { className: "rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] text-primary/80 flex gap-2" }, /* @__PURE__ */ React10.createElement(Info2, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ React10.createElement("span", null, children));
}
function LogicChip2({ value, onChange }) {
  return /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      onClick: () => onChange(value === "AND" ? "OR" : "AND"),
      className: `text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${value === "AND" ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-50 text-amber-600 border-amber-200"}`
    },
    value
  );
}
function EmptyState({ icon: Icon, message, action }) {
  return /* @__PURE__ */ React10.createElement("div", { className: "rounded-md border border-border border-dashed bg-muted/30 py-8 flex flex-col items-center gap-2" }, Icon && /* @__PURE__ */ React10.createElement(Icon, { className: "h-8 w-8 text-muted-foreground/40" }), /* @__PURE__ */ React10.createElement("p", { className: "text-sm text-muted-foreground text-center" }, message), action);
}

// src/components/googlesheets/GoogleSheetsDatasourceEditor.jsx
import {
  KeyRound,
  Globe,
  Check,
  Loader2,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight
} from "lucide-react";
function StepIndicator({ steps, currentStep }) {
  return /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-1 mb-6" }, steps.map((step, i) => {
    const isActive = i === currentStep;
    const isComplete = i < currentStep;
    return /* @__PURE__ */ React11.createElement(React11.Fragment, { key: step.id }, i > 0 && /* @__PURE__ */ React11.createElement(ChevronRight, { className: `h-3.5 w-3.5 shrink-0 ${isComplete ? "text-primary" : "text-muted-foreground/30"}` }), /* @__PURE__ */ React11.createElement("div", { className: `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isActive ? "bg-muted text-foreground" : isComplete ? "bg-muted/50 text-foreground/70" : "text-muted-foreground/50"}` }, isComplete ? /* @__PURE__ */ React11.createElement(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ React11.createElement("span", { className: "h-4 w-4 flex items-center justify-center rounded-full border text-[10px] font-bold border-current" }, i + 1), step.label));
  }));
}
function AuthMethodCard({ icon: Icon, title, description, isSelected, onClick }) {
  return /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick,
      className: `flex items-start gap-3 p-4 rounded-md border-2 text-left transition-all w-full ${isSelected ? "border-foreground bg-muted/20 shadow-sm" : "border-border hover:border-muted-foreground/30 hover:bg-muted/10"}`
    },
    /* @__PURE__ */ React11.createElement("div", { className: `p-2 rounded-md shrink-0 border ${isSelected ? "bg-background text-foreground border-border shadow-sm" : "bg-muted text-muted-foreground border-transparent"}` }, /* @__PURE__ */ React11.createElement(Icon, { className: "h-5 w-5" })),
    /* @__PURE__ */ React11.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React11.createElement("p", { className: `text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}` }, title), /* @__PURE__ */ React11.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, description)),
    isSelected && /* @__PURE__ */ React11.createElement(Check, { className: "h-4 w-4 text-foreground shrink-0 ml-auto mt-1" })
  );
}
var STEPS = [
  { id: "auth", label: "Authentication" },
  { id: "config", label: "Configuration" }
];
var GoogleSheetsDatasourceEditor = ({ datasourceEditorForm }) => {
  const { oauth } = useDatasourceEditorContext();
  const options = datasourceEditorForm.datasourceOptions || {};
  const [currentStep, setCurrentStep] = useState3(
    options.authType && (options.serviceAccountKey || options.oauth2?.vaultCredentialID) ? 1 : 0
  );
  const authType = options.authType || "serviceAccount";
  const isOAuthConnected = !!options.oauth2?.vaultCredentialID;
  const hasServiceAccountKey = !!options.serviceAccountKey;
  const handleAuthTypeChange = useCallback2((type) => {
    datasourceEditorForm.patchDatasourceOptions({ authType: type });
  }, [datasourceEditorForm]);
  const handleOAuthConnect = useCallback2(() => {
    oauth.startOAuth(
      (vaultCredentialID) => {
        datasourceEditorForm.patchDatasourceOptions({
          oauth2: { vaultCredentialID }
        });
        setCurrentStep(1);
      }
    );
  }, [oauth, datasourceEditorForm]);
  const handleServiceAccountKeyChange = useCallback2((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      serviceAccountKey: e.target.value
    });
  }, [datasourceEditorForm]);
  const handleServiceAccountContinue = useCallback2(() => {
    if (hasServiceAccountKey) {
      setCurrentStep(1);
    }
  }, [hasServiceAccountKey]);
  const handleConnectionNameChange = useCallback2((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      connectionName: e.target.value
    });
  }, [datasourceEditorForm]);
  const handleDefaultSpreadsheetIdChange = useCallback2((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      defaultSpreadsheetId: e.target.value
    });
  }, [datasourceEditorForm]);
  return /* @__PURE__ */ React11.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React11.createElement(StepIndicator, { steps: STEPS, currentStep }), currentStep === 0 && /* @__PURE__ */ React11.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React11.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React11.createElement(
    AuthMethodCard,
    {
      icon: KeyRound,
      title: "Service Account",
      description: "Use a Google Cloud service account JSON key for server-to-server authentication.",
      isSelected: authType === "serviceAccount",
      onClick: () => handleAuthTypeChange("serviceAccount")
    }
  ), /* @__PURE__ */ React11.createElement(
    AuthMethodCard,
    {
      icon: Globe,
      title: "OAuth 2.0",
      description: "Connect your Google Account interactively. Best for accessing personal spreadsheets.",
      isSelected: authType === "oauth2",
      onClick: () => handleAuthTypeChange("oauth2")
    }
  )), authType === "serviceAccount" && /* @__PURE__ */ React11.createElement("div", { className: "space-y-3 pt-2" }, /* @__PURE__ */ React11.createElement("label", { className: "text-xs font-medium text-foreground" }, "Service Account JSON Key"), /* @__PURE__ */ React11.createElement(
    "textarea",
    {
      className: "w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y",
      placeholder: "Paste the entire JSON key content here...",
      value: options.serviceAccountKey || "",
      onChange: handleServiceAccountKeyChange
    }
  ), hasServiceAccountKey && /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-2 text-xs text-foreground" }, /* @__PURE__ */ React11.createElement(ShieldCheck, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ React11.createElement("span", null, "Key provided")), /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      disabled: !hasServiceAccountKey,
      onClick: handleServiceAccountContinue,
      className: "w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
    },
    "Continue",
    /* @__PURE__ */ React11.createElement(ChevronRight, { className: "h-4 w-4" })
  )), authType === "oauth2" && /* @__PURE__ */ React11.createElement("div", { className: "space-y-3 pt-2" }, isOAuthConnected ? /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-3 p-3 rounded-md border border-border bg-muted/30" }, /* @__PURE__ */ React11.createElement(ShieldCheck, { className: "h-5 w-5 text-foreground shrink-0" }), /* @__PURE__ */ React11.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React11.createElement("p", { className: "text-sm font-medium text-foreground" }, "Google Account Connected"), /* @__PURE__ */ React11.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Credential ID: ", options.oauth2.vaultCredentialID)), /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: handleOAuthConnect,
      className: "ml-auto text-xs text-foreground underline-offset-2 hover:underline shrink-0"
    },
    "Reconnect"
  )) : /* @__PURE__ */ React11.createElement(InfoCallout2, null, "You'll be redirected to Google to authorize access to your spreadsheets. Credentials are stored securely in the vault."), isOAuthConnected ? /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: () => setCurrentStep(1),
      className: "w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    },
    "Continue",
    /* @__PURE__ */ React11.createElement(ChevronRight, { className: "h-4 w-4" })
  ) : /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: handleOAuthConnect,
      disabled: oauth.loading,
      className: "w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
    },
    oauth.loading ? /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(Loader2, { className: "h-4 w-4 animate-spin" }), "Connecting...") : /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(Globe, { className: "h-4 w-4" }), "Connect Google Account")
  ))), currentStep === 1 && /* @__PURE__ */ React11.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: () => setCurrentStep(0),
      className: "text-xs text-muted-foreground hover:text-foreground transition-colors"
    },
    "\u2190 Back to authentication"
  ), /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-2 p-2.5 rounded-md border border-border bg-muted/30 text-xs" }, /* @__PURE__ */ React11.createElement(ShieldCheck, { className: "h-4 w-4 text-foreground shrink-0" }), /* @__PURE__ */ React11.createElement("span", { className: "text-foreground font-medium" }, authType === "oauth2" ? "OAuth 2.0" : "Service Account", " \u2014 Connected")), /* @__PURE__ */ React11.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React11.createElement("label", { className: "text-xs font-medium text-foreground", htmlFor: "gs-connectionName" }, "Connection Name"), /* @__PURE__ */ React11.createElement(
    "input",
    {
      id: "gs-connectionName",
      type: "text",
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      placeholder: "My Google Sheets",
      value: options.connectionName || "",
      onChange: handleConnectionNameChange
    }
  )), /* @__PURE__ */ React11.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React11.createElement("label", { className: "text-xs font-medium text-foreground", htmlFor: "gs-defaultSpreadsheetId" }, "Default Spreadsheet ID ", /* @__PURE__ */ React11.createElement("span", { className: "text-muted-foreground" }, "(optional)")), /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React11.createElement(FileSpreadsheet, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ React11.createElement(
    "input",
    {
      id: "gs-defaultSpreadsheetId",
      type: "text",
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      placeholder: "e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
      value: options.defaultSpreadsheetId || "",
      onChange: handleDefaultSpreadsheetIdChange
    }
  )), /* @__PURE__ */ React11.createElement("p", { className: "text-[11px] text-muted-foreground" }, "Found in the spreadsheet URL: docs.google.com/spreadsheets/d/", /* @__PURE__ */ React11.createElement("strong", null, "SPREADSHEET_ID"), "/edit"))));
};

// src/components/googlesheets/GoogleSheetsQueryEditor.jsx
import React14, { useState as useState4, useCallback as useCallback3, useEffect, useRef as useRef2 } from "react";

// src/context/QueryEditorContext.js
import React12, { createContext as createContext2, useContext as useContext2 } from "react";
var QueryEditorContext = createContext2(null);
var useQueryEditorContext = () => {
  const ctx = useContext2(QueryEditorContext);
  if (!ctx) {
    throw new Error(
      "useQueryEditorContext() must be used inside a <QueryEditorContext.Provider>. This provider is wired in the frontend app's DataQueryEditor component."
    );
  }
  return ctx;
};

// src/primitives/EditorTabBar.jsx
import React13 from "react";
function TabBadge({ count }) {
  if (!count) return null;
  return /* @__PURE__ */ React13.createElement("span", { className: "ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, count);
}
var EditorTabBar = ({ tabs, activeTab, onTabChange, badges = {} }) => {
  return /* @__PURE__ */ React13.createElement("div", { className: "flex items-center gap-0.5 border-b border-border pb-0 -mb-px" }, tabs.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ React13.createElement(
      "button",
      {
        key: tab.id,
        type: "button",
        onClick: () => onTabChange(tab.id),
        className: `inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`
      },
      Icon && /* @__PURE__ */ React13.createElement(Icon, { className: "h-3.5 w-3.5" }),
      tab.label,
      /* @__PURE__ */ React13.createElement(TabBadge, { count: badges[tab.id] })
    );
  }));
};

// src/components/googlesheets/GoogleSheetsQueryEditor.jsx
import {
  BookOpen,
  PenLine,
  Plus as Plus2,
  Trash2 as Trash22,
  Search,
  FileSpreadsheet as FileSpreadsheet2,
  Table2,
  Settings2,
  Loader2 as Loader22,
  ChevronRight as ChevronRight2,
  ExternalLink,
  Info as Info3,
  Eye as Eye2
} from "lucide-react";
var OPERATIONS = [
  { id: "read", label: "Read", icon: BookOpen, description: "Fetch data from a sheet range" },
  { id: "write", label: "Write", icon: PenLine, description: "Write data to a sheet range" },
  { id: "append", label: "Append", icon: Plus2, description: "Append rows to the end of a sheet" },
  { id: "update", label: "Update", icon: PenLine, description: "Update cells in a range" },
  { id: "clear", label: "Clear", icon: Trash22, description: "Clear data from a range" },
  { id: "getSpreadsheetInfo", label: "Get Info", icon: Info3, description: "Get spreadsheet metadata" }
];
var TABS2 = [
  { id: "source", label: "Source", icon: FileSpreadsheet2 },
  { id: "options", label: "Options", icon: Settings2 },
  { id: "preview", label: "Preview", icon: Eye2 }
];
function SpreadsheetSearch({ onSelect, selectedId, apiProxy }) {
  const [query, setQuery] = useState4("");
  const [results, setResults] = useState4([]);
  const [loading, setLoading] = useState4(false);
  const [nextPageToken, setNextPageToken] = useState4(null);
  const [searched, setSearched] = useState4(false);
  const debounceRef = useRef2(null);
  const doSearch = useCallback3(async (searchQuery, pageToken) => {
    setLoading(true);
    try {
      const res = await apiProxy.post("listSpreadsheets", {
        query: searchQuery,
        pageToken,
        pageSize: 10
      });
      if (pageToken) {
        setResults((prev) => [...prev, ...res.spreadsheets || []]);
      } else {
        setResults(res.spreadsheets || []);
      }
      setNextPageToken(res.nextPageToken || null);
      setSearched(true);
    } catch (err) {
      console.error("listSpreadsheets failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiProxy]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, null);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);
  return /* @__PURE__ */ React14.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React14.createElement("div", { className: "relative" }, /* @__PURE__ */ React14.createElement(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ React14.createElement(
    "input",
    {
      type: "text",
      className: "flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      placeholder: "Search spreadsheets...",
      value: query,
      onChange: (e) => setQuery(e.target.value)
    }
  ), loading && /* @__PURE__ */ React14.createElement(Loader22, { className: "absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground animate-spin" })), /* @__PURE__ */ React14.createElement("div", { className: "max-h-[240px] overflow-y-auto rounded-md border border-border" }, results.length === 0 && !loading && searched ? /* @__PURE__ */ React14.createElement("div", { className: "p-6 text-center text-sm text-muted-foreground" }, "No spreadsheets found") : /* @__PURE__ */ React14.createElement("div", { className: "divide-y divide-border" }, results.map((ss) => /* @__PURE__ */ React14.createElement(
    "button",
    {
      key: ss.id,
      type: "button",
      onClick: () => onSelect(ss),
      className: `w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${selectedId === ss.id ? "bg-muted/50 border-l-2 border-l-foreground" : "hover:bg-muted/30 border-l-2 border-l-transparent"}`
    },
    /* @__PURE__ */ React14.createElement(FileSpreadsheet2, { className: `h-4 w-4 shrink-0 ${selectedId === ss.id ? "text-foreground" : "text-muted-foreground"}` }),
    /* @__PURE__ */ React14.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React14.createElement("p", { className: "text-sm font-medium text-foreground truncate" }, ss.name), /* @__PURE__ */ React14.createElement("p", { className: "text-[11px] text-muted-foreground truncate" }, ss.owner && `${ss.owner} \xB7 `, ss.modifiedTime && new Date(ss.modifiedTime).toLocaleDateString())),
    ss.webViewLink && /* @__PURE__ */ React14.createElement(
      "a",
      {
        href: ss.webViewLink,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: (e) => e.stopPropagation(),
        className: "text-muted-foreground hover:text-foreground"
      },
      /* @__PURE__ */ React14.createElement(ExternalLink, { className: "h-3.5 w-3.5" })
    )
  )))), nextPageToken && !loading && /* @__PURE__ */ React14.createElement(
    "button",
    {
      type: "button",
      onClick: () => doSearch(query, nextPageToken),
      className: "w-full text-center text-xs text-foreground hover:underline py-1"
    },
    "Load more..."
  ));
}
function SheetSelector({ spreadsheetId, selectedSheet, onSelect, apiProxy }) {
  const [sheets, setSheets] = useState4([]);
  const [loading, setLoading] = useState4(false);
  const [spreadsheetTitle, setSpreadsheetTitle] = useState4("");
  useEffect(() => {
    if (!spreadsheetId) return;
    let cancelled = false;
    setLoading(true);
    apiProxy.post("listSheets", { spreadsheetId }).then((res) => {
      if (cancelled) return;
      setSheets(res.sheets || []);
      setSpreadsheetTitle(res.title || "");
      if (!selectedSheet && res.sheets?.length > 0) {
        onSelect(res.sheets[0].title);
      }
    }).catch((err) => {
      console.error("listSheets failed:", err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [spreadsheetId, apiProxy]);
  if (!spreadsheetId) return null;
  if (loading) {
    return /* @__PURE__ */ React14.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground p-2" }, /* @__PURE__ */ React14.createElement(Loader22, { className: "h-3.5 w-3.5 animate-spin" }), "Loading sheets...");
  }
  return /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, spreadsheetTitle && /* @__PURE__ */ React14.createElement("p", { className: "text-[11px] text-muted-foreground" }, "Sheets in ", /* @__PURE__ */ React14.createElement("strong", null, spreadsheetTitle)), /* @__PURE__ */ React14.createElement("div", { className: "flex flex-wrap gap-1.5" }, sheets.map((sheet) => /* @__PURE__ */ React14.createElement(
    "button",
    {
      key: sheet.sheetId,
      type: "button",
      onClick: () => onSelect(sheet.title),
      className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${selectedSheet === sheet.title ? "bg-muted text-foreground border-border" : "bg-muted/10 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground"}`
    },
    /* @__PURE__ */ React14.createElement(Table2, { className: "h-3 w-3" }),
    sheet.title
  ))));
}
function DataPreview({ spreadsheetId, sheetName, apiProxy }) {
  const [preview, setPreview] = useState4(null);
  const [loading, setLoading] = useState4(false);
  const fetchPreview = useCallback3(async () => {
    if (!spreadsheetId || !sheetName) return;
    setLoading(true);
    try {
      const res = await apiProxy.post("previewData", {
        spreadsheetId,
        sheetName,
        limit: 5
      });
      setPreview(res);
    } catch (err) {
      console.error("previewData failed:", err);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, sheetName, apiProxy]);
  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);
  if (!spreadsheetId || !sheetName) {
    return /* @__PURE__ */ React14.createElement(
      EmptyState,
      {
        icon: Eye2,
        message: "Select a spreadsheet and sheet to preview data."
      }
    );
  }
  if (loading) {
    return /* @__PURE__ */ React14.createElement("div", { className: "flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground" }, /* @__PURE__ */ React14.createElement(Loader22, { className: "h-4 w-4 animate-spin" }), "Loading preview...");
  }
  if (!preview || preview.headers.length === 0) {
    return /* @__PURE__ */ React14.createElement(EmptyState, { icon: Table2, message: "No data found in the selected range." });
  }
  return /* @__PURE__ */ React14.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React14.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React14.createElement("p", { className: "text-[11px] text-muted-foreground" }, "Showing ", preview.rows.length, " of ", preview.totalRows, " rows"), /* @__PURE__ */ React14.createElement(
    "button",
    {
      type: "button",
      onClick: fetchPreview,
      className: "text-[11px] text-foreground underline-offset-2 hover:underline"
    },
    "Refresh"
  )), /* @__PURE__ */ React14.createElement("div", { className: "overflow-x-auto rounded-md border border-border" }, /* @__PURE__ */ React14.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React14.createElement("thead", null, /* @__PURE__ */ React14.createElement("tr", { className: "bg-muted/50" }, preview.headers.map((h, i) => /* @__PURE__ */ React14.createElement("th", { key: i, className: "px-3 py-1.5 text-left font-semibold text-foreground whitespace-nowrap border-b border-border" }, h)))), /* @__PURE__ */ React14.createElement("tbody", null, preview.rows.map((row, ri) => /* @__PURE__ */ React14.createElement("tr", { key: ri, className: "border-b border-border last:border-0 hover:bg-muted/20" }, preview.headers.map((_, ci) => /* @__PURE__ */ React14.createElement("td", { key: ci, className: "px-3 py-1.5 text-foreground whitespace-nowrap max-w-[200px] truncate" }, row[ci] ?? ""))))))));
}
var GoogleSheetsQueryEditor = ({ queryEditorForm }) => {
  const { apiProxy } = useQueryEditorContext();
  const opts = queryEditorForm.dataQueryOptions || {};
  const [activeTab, setActiveTab] = useState4("source");
  const patch = useCallback3((updates) => {
    queryEditorForm.patchQueryOptions(updates);
  }, [queryEditorForm]);
  const operation = opts.operation || "read";
  const spreadsheetId = opts.spreadsheetId || "";
  const sheetName = opts.sheetName || "";
  useEffect(() => {
    if (!opts.operation) {
      patch({ operation: "read" });
    }
  }, [opts.operation, patch]);
  const badges = {
    source: spreadsheetId ? 1 : 0
  };
  return /* @__PURE__ */ React14.createElement("div", { className: "space-y-0" }, /* @__PURE__ */ React14.createElement("div", { className: "pb-4" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground mb-2 block" }, "Operation"), /* @__PURE__ */ React14.createElement("div", { className: "grid grid-cols-3 gap-1.5" }, OPERATIONS.map((op) => {
    const Icon = op.icon;
    const isSelected = operation === op.id;
    return /* @__PURE__ */ React14.createElement(
      "button",
      {
        key: op.id,
        type: "button",
        onClick: () => patch({ operation: op.id }),
        className: `flex items-center gap-2 p-2.5 rounded-md border text-left transition-all ${isSelected ? "border-foreground bg-muted/20 shadow-sm" : "border-border hover:border-muted-foreground/30 hover:bg-muted/10"}`
      },
      /* @__PURE__ */ React14.createElement(Icon, { className: `h-3.5 w-3.5 shrink-0 ${isSelected ? "text-foreground" : "text-muted-foreground"}` }),
      /* @__PURE__ */ React14.createElement("span", { className: `text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}` }, op.label)
    );
  }))), /* @__PURE__ */ React14.createElement(EditorTabBar, { tabs: TABS2, activeTab, onTabChange: setActiveTab, badges }), /* @__PURE__ */ React14.createElement("div", { className: "pt-4 pb-2" }, activeTab === "source" && /* @__PURE__ */ React14.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Spreadsheet ID"), /* @__PURE__ */ React14.createElement(
    "input",
    {
      type: "text",
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      placeholder: "Enter spreadsheet ID or search below...",
      value: spreadsheetId,
      onChange: (e) => patch({ spreadsheetId: e.target.value })
    }
  )), /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ React14.createElement(Search, { className: "h-3 w-3" }), "Or search your spreadsheets"), /* @__PURE__ */ React14.createElement(
    SpreadsheetSearch,
    {
      apiProxy,
      selectedId: spreadsheetId,
      onSelect: (ss) => patch({ spreadsheetId: ss.id })
    }
  )), spreadsheetId && /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5 pt-2 border-t border-border" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Sheet / Tab"), /* @__PURE__ */ React14.createElement(
    SheetSelector,
    {
      spreadsheetId,
      selectedSheet: sheetName,
      onSelect: (name) => patch({ sheetName: name }),
      apiProxy
    }
  )), spreadsheetId && (operation === "read" || operation === "write" || operation === "append" || operation === "update" || operation === "clear") && /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Range (A1 notation)"), /* @__PURE__ */ React14.createElement(
    "input",
    {
      type: "text",
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      placeholder: "A1:Z1000",
      value: opts.range || "",
      onChange: (e) => patch({ range: e.target.value })
    }
  ))), activeTab === "options" && /* @__PURE__ */ React14.createElement("div", { className: "space-y-4" }, operation === "read" && /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Major Dimension"), /* @__PURE__ */ React14.createElement(
    "select",
    {
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      value: opts.majorDimension || "ROWS",
      onChange: (e) => patch({ majorDimension: e.target.value })
    },
    /* @__PURE__ */ React14.createElement("option", { value: "ROWS" }, "Rows"),
    /* @__PURE__ */ React14.createElement("option", { value: "COLUMNS" }, "Columns")
  )), /* @__PURE__ */ React14.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React14.createElement(
    "input",
    {
      type: "checkbox",
      id: "gs-includeHeaders",
      checked: opts.includeHeaders !== false,
      onChange: (e) => patch({ includeHeaders: e.target.checked }),
      className: "h-4 w-4 rounded border-input"
    }
  ), /* @__PURE__ */ React14.createElement("label", { htmlFor: "gs-includeHeaders", className: "text-xs text-foreground" }, "Treat first row as headers"))), (operation === "write" || operation === "update" || operation === "append") && /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Data (JSON array of arrays)"), /* @__PURE__ */ React14.createElement(
    "textarea",
    {
      className: "w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y",
      placeholder: '[["Header1", "Header2"], ["Value1", "Value2"]]',
      value: opts.data || "",
      onChange: (e) => patch({ data: e.target.value })
    }
  )), /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Value Input Option"), /* @__PURE__ */ React14.createElement(
    "select",
    {
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      value: opts.valueInputOption || "USER_ENTERED",
      onChange: (e) => patch({ valueInputOption: e.target.value })
    },
    /* @__PURE__ */ React14.createElement("option", { value: "USER_ENTERED" }, "User Entered"),
    /* @__PURE__ */ React14.createElement("option", { value: "RAW" }, "Raw")
  ))), operation === "append" && /* @__PURE__ */ React14.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React14.createElement("label", { className: "text-xs font-medium text-foreground" }, "Insert Data Option"), /* @__PURE__ */ React14.createElement(
    "select",
    {
      className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      value: opts.insertDataOption || "INSERT_ROWS",
      onChange: (e) => patch({ insertDataOption: e.target.value })
    },
    /* @__PURE__ */ React14.createElement("option", { value: "INSERT_ROWS" }, "Insert Rows"),
    /* @__PURE__ */ React14.createElement("option", { value: "OVERWRITE" }, "Overwrite")
  )), operation === "getSpreadsheetInfo" && /* @__PURE__ */ React14.createElement(InfoCallout2, null, "This operation returns spreadsheet metadata including sheet names, row/column counts, and locale. No additional options required."), operation === "clear" && /* @__PURE__ */ React14.createElement(InfoCallout2, null, "This will clear all data in the specified range. The range is configured in the Source tab.")), activeTab === "preview" && /* @__PURE__ */ React14.createElement(
    DataPreview,
    {
      spreadsheetId,
      sheetName,
      apiProxy
    }
  )));
};

// src/components/common/genericDatasourceTestResultUI.js
import React15 from "react";
var GenericDatasourceTestResultUI = ({ connectionResult }) => {
  console.log("connectionResult", connectionResult);
  let status = "untested";
  let title = "Connection not tested";
  let details = null;
  if (connectionResult === true || connectionResult?.ok === true) {
    status = "success";
    title = connectionResult?.statusText || "Connection successful";
    if (connectionResult?.details) {
      details = connectionResult.details;
    } else if (typeof connectionResult === "object" && connectionResult !== null && connectionResult !== true) {
      const keys = Object.keys(connectionResult).filter((k) => k !== "ok" && k !== "statusText");
      if (keys.length > 0) {
        details = connectionResult;
      }
    }
  } else if (connectionResult === void 0 || connectionResult === null) {
    status = "untested";
    title = "Connection not tested";
  } else {
    const isError = !connectionResult?.ok;
    status = isError ? "error" : "warning";
    if (typeof connectionResult === "string") {
      title = connectionResult;
    } else {
      title = connectionResult?.message || connectionResult?.error || (isError ? "Connection failed" : "Error testing connection");
      if (connectionResult?.details) {
        details = connectionResult.details;
      } else if (connectionResult?.stack) {
        details = connectionResult.stack;
      } else if (connectionResult?.response?.data) {
        details = connectionResult.response.data;
      } else if (typeof connectionResult === "object") {
        const filtered = { ...connectionResult };
        delete filtered.ok;
        delete filtered.message;
        delete filtered.error;
        if (Object.keys(filtered).length > 0) {
          details = filtered;
        }
      }
    }
  }
  const styles = {
    success: {
      container: "bg-primary/5 border-primary/20 text-primary",
      badge: "bg-primary/10 text-primary border border-primary/20",
      badgeText: "Success",
      icon: /* @__PURE__ */ React15.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React15.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }))
    },
    error: {
      container: "bg-destructive/5 border-destructive/20 text-destructive",
      badge: "bg-destructive/10 text-destructive border border-destructive/20",
      badgeText: "Failed",
      icon: /* @__PURE__ */ React15.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React15.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }))
    },
    warning: {
      container: "bg-amber-500/5 border-amber-500/20 text-amber-500",
      badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      badgeText: "Warning",
      icon: /* @__PURE__ */ React15.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React15.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }))
    },
    untested: {
      container: "bg-muted/30 border-border text-muted-foreground",
      badge: "bg-muted/50 text-muted-foreground border border-border/50",
      badgeText: "Untested",
      icon: /* @__PURE__ */ React15.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React15.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }))
    }
  };
  const currentStyle = styles[status];
  const renderDetails = () => {
    if (!details) return null;
    let text = "";
    if (typeof details === "string") {
      text = details;
    } else {
      try {
        text = JSON.stringify(details, null, 2);
      } catch (e) {
        text = String(details);
      }
    }
    return /* @__PURE__ */ React15.createElement("div", { className: "mt-4 pt-4 border-t border-current/10 w-full space-y-2" }, /* @__PURE__ */ React15.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80" }, "Details / Logs"), /* @__PURE__ */ React15.createElement("div", { className: "rounded-md bg-foreground text-background p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-60 border border-border/50" }, /* @__PURE__ */ React15.createElement("code", null, text)));
  };
  return /* @__PURE__ */ React15.createElement("div", { className: "w-full" }, /* @__PURE__ */ React15.createElement("div", { className: `w-full flex flex-col justify-start items-start p-4 rounded-md border transition-all duration-200 ${currentStyle.container}` }, /* @__PURE__ */ React15.createElement("div", { className: "flex flex-row justify-between items-center w-full gap-4" }, /* @__PURE__ */ React15.createElement("div", { className: "flex flex-row justify-start items-center gap-3" }, currentStyle.icon, /* @__PURE__ */ React15.createElement("span", { className: "text-sm font-medium tracking-tight" }, title)), /* @__PURE__ */ React15.createElement("span", { className: `text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full ${currentStyle.badge}` }, currentStyle.badgeText)), renderDetails()));
};

// src/index.js
var createGenericDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return React16.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return React16.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var createWebUrlDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return React16.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return React16.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var DATASOURCE_UI_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.RESTAPI.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.WEB_URL.value]: createWebUrlDatasourceUI(),
  [DATASOURCE_TYPES.FIRESTORE.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MYSQL.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.MONGODB.value]: createGenericDatasourceUI(),
  [DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    ...createGenericDatasourceUI(),
    dedicatedDatasourceEditor: function({ datasourceEditorForm }) {
      return React16.createElement(GoogleSheetsDatasourceEditor, { datasourceEditorForm });
    },
    dedicatedQueryEditor: function({ queryEditorForm }) {
      return React16.createElement(GoogleSheetsQueryEditor, { queryEditorForm });
    }
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
    dedicatedQueryEditor: function({ queryEditorForm }) {
      return React16.createElement(ExcelCSVQueryBuilder, { queryEditorForm });
    }
  }
};
export {
  DATASOURCE_UI_COMPONENTS,
  DatasourceEditorContext,
  EditorTabBar,
  EmptyState,
  InfoCallout2 as InfoCallout,
  LogicChip2 as LogicChip,
  MonoLabel2 as MonoLabel,
  QueryEditorContext,
  useDatasourceEditorContext,
  useQueryEditorContext
};
//# sourceMappingURL=index.mjs.map
