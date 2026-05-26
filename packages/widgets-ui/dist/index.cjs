var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/vega/index.js
var vega_exports = {};
__export(vega_exports, {
  VegaWidget: () => VegaWidget,
  default: () => vega_default
});
var import_react, import_vega_embed, VegaWidget, vega_default;
var init_vega = __esm({
  "src/vega/index.js"() {
    import_react = __toESM(require("react"));
    import_vega_embed = __toESM(require("vega-embed"));
    VegaWidget = ({
      data,
      // Processed Vega/Vega-Lite spec from processor
      widgetConfig,
      // Widget-level config (showActions, renderer, theme)
      onSignal,
      // Callback for selections/interactions
      onError,
      // Error handler
      onWidgetInit,
      // Callback when widget initializes
      isLoadingWorkflows
      // Boolean indicating if a workflow is currently running
    }) => {
      const containerRef = (0, import_react.useRef)(null);
      const viewRef = (0, import_react.useRef)(null);
      const [error, setError] = (0, import_react.useState)(null);
      const [loading, setLoading] = (0, import_react.useState)(true);
      const onSignalRef = (0, import_react.useRef)(onSignal);
      const onWidgetInitRef = (0, import_react.useRef)(onWidgetInit);
      const onErrorRef = (0, import_react.useRef)(onError);
      (0, import_react.useEffect)(() => {
        onSignalRef.current = onSignal;
      }, [onSignal]);
      (0, import_react.useEffect)(() => {
        onWidgetInitRef.current = onWidgetInit;
      }, [onWidgetInit]);
      (0, import_react.useEffect)(() => {
        onErrorRef.current = onError;
      }, [onError]);
      const specKey = (0, import_react.useMemo)(() => {
        try {
          return data ? JSON.stringify(data) : null;
        } catch {
          return null;
        }
      }, [data]);
      const configKey = (0, import_react.useMemo)(() => {
        try {
          return widgetConfig ? JSON.stringify({
            showActions: widgetConfig?.showActions,
            renderer: widgetConfig?.renderer,
            theme: widgetConfig?.theme
          }) : null;
        } catch {
          return null;
        }
      }, [widgetConfig]);
      (0, import_react.useEffect)(() => {
        if (!containerRef.current) return;
        if (isLoadingWorkflows) {
          setLoading(true);
          setError(null);
          return;
        }
        if (!data || !data.$schema) {
          setLoading(false);
          setError("No visualization spec provided");
          return;
        }
        const renderChart = async () => {
          try {
            setLoading(true);
            setError(null);
            if (viewRef.current) {
              viewRef.current.finalize();
              viewRef.current = null;
            }
            const embedOptions = {
              actions: widgetConfig?.showActions ?? false,
              renderer: widgetConfig?.renderer ?? "svg",
              theme: widgetConfig?.theme ?? void 0,
              tooltip: { theme: "dark" },
              config: {
                background: "transparent",
                view: { stroke: "transparent" }
              }
            };
            const result = await (0, import_vega_embed.default)(containerRef.current, data, embedOptions);
            viewRef.current = result.view;
            setLoading(false);
            onWidgetInitRef.current?.(result.view);
            if (onSignalRef.current && data.params) {
              for (const param of data.params) {
                if (param.name) {
                  result.view.addSignalListener(param.name, (name, value) => {
                    onSignalRef.current?.(name, value);
                  });
                }
              }
            }
          } catch (err) {
            setError(err.message || "Visualization error");
            setLoading(false);
            onErrorRef.current?.(err);
          }
        };
        renderChart();
        return () => {
          if (viewRef.current) {
            viewRef.current.finalize();
            viewRef.current = null;
          }
        };
      }, [specKey, configKey, isLoadingWorkflows]);
      return /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, (loading || isLoadingWorkflows) && !error && /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            color: "#94a3b8",
            fontSize: "13px",
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(241, 245, 249, 0.9)"
        } }, /* @__PURE__ */ import_react.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { animation: "spin 1s linear infinite" } }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), /* @__PURE__ */ import_react.default.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`), "Loading visualization\u2026")
      ), error && !isLoadingWorkflows && /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            textAlign: "center",
            zIndex: 20,
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(254, 242, 242, 0.95)",
          color: "#dc2626",
          fontSize: "13px",
          border: "1px solid rgba(220, 38, 38, 0.2)"
        } }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u26A0"), /* @__PURE__ */ import_react.default.createElement("span", null, error))
      ), /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          ref: containerRef,
          style: {
            width: "100%",
            height: "100%",
            visibility: error || isLoadingWorkflows ? "hidden" : "visible"
          }
        }
      ));
    };
    vega_default = VegaWidget;
  }
});

// src/table/tableWidget.jsx
var import_react10, import_prop_types9, import_react_table, import_ui9, import_lucide_react6, exportToCSV, exportToJSON, EditableCell, TableWidget;
var init_tableWidget = __esm({
  "src/table/tableWidget.jsx"() {
    import_react10 = __toESM(require("react"));
    import_prop_types9 = __toESM(require("prop-types"));
    import_react_table = require("@tanstack/react-table");
    import_ui9 = require("@jet-admin/ui");
    import_lucide_react6 = require("lucide-react");
    exportToCSV = (columns, rows, filename = "export.csv") => {
      const headers = columns.map((c) => `"${(c.label || c.key || c.id).replace(/"/g, '""')}"`).join(",");
      const body = rows.map(
        (r) => columns.map((c) => {
          const val = r[c.key || c.id];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        }).join(",")
      ).join("\n");
      const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    exportToJSON = (columns, rows, filename = "export.json") => {
      const keys = columns.map((c) => c.key || c.id);
      const data = rows.map((r) => {
        const obj = {};
        keys.forEach((k) => {
          obj[k] = r[k] ?? null;
        });
        return obj;
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    EditableCell = ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = (0, import_react10.useState)(initialValue);
      const inputRef = (0, import_react10.useRef)(null);
      (0, import_react10.useEffect)(() => {
        setValue(initialValue);
      }, [initialValue]);
      (0, import_react10.useEffect)(() => {
        if (inputRef.current) inputRef.current.focus();
      }, []);
      const onBlur = () => {
        table.options.meta?.updateCellData(row.index, column.id, value);
      };
      return /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Input,
        {
          ref: inputRef,
          value: value ?? "",
          onChange: (e) => setValue(e.target.value),
          onBlur,
          onClick: (e) => e.stopPropagation(),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              onBlur();
              e.target.blur();
            }
            if (e.key === "Escape") {
              setValue(initialValue);
              e.target.blur();
            }
            if (e.key === "Tab") {
              onBlur();
            }
          },
          className: "h-7 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 rounded w-full"
        }
      );
    };
    TableWidget = ({
      widgetConfig,
      data: processedData,
      runWorkflow,
      isLoadingWorkflows,
      onWidgetInit,
      refreshData,
      fireWidgetEvent,
      widgetState,
      setWidgetState,
      onRowSelect
    }) => {
      const tableData = (0, import_react10.useMemo)(() => {
        if (processedData && typeof processedData === "object" && !Array.isArray(processedData)) return processedData;
        if (Array.isArray(processedData)) return { data: processedData, columns: [], pagination: { enabled: false } };
        return { data: [], columns: [], pagination: { enabled: false } };
      }, [processedData]);
      const rows = tableData.data || [];
      const configColumns = (0, import_react10.useMemo)(() => {
        const cols = tableData.columns?.length ? tableData.columns : widgetConfig?.columns?.length ? widgetConfig.columns : [];
        if (cols.length > 0) return cols;
        if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
          return Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
        }
        return [];
      }, [tableData.columns, widgetConfig?.columns, rows]);
      const paginationConfig = tableData.pagination?.enabled ? tableData.pagination : widgetConfig?.pagination?.enabled ? widgetConfig.pagination : null;
      const searchConfig = tableData.search || widgetConfig?.search || { enabled: false };
      const exportConfig = tableData.export || widgetConfig?.export || { enabled: false };
      const editingConfig = tableData.editing || widgetConfig?.editing || { enabled: false };
      const multiSelectConfig = tableData.multiSelect || widgetConfig?.multiSelect || { enabled: false };
      const bulkEditConfig = tableData.bulkEdit || widgetConfig?.bulkEdit || { enabled: false };
      const [globalFilter, setGlobalFilter] = (0, import_react10.useState)("");
      const [editingRowId, setEditingRowId] = (0, import_react10.useState)(null);
      const [rowDraft, setRowDraft] = (0, import_react10.useState)({});
      const [pendingEdits, setPendingEdits] = (0, import_react10.useState)({});
      const [editingCell, setEditingCell] = (0, import_react10.useState)(null);
      const [rowSelection, setRowSelection] = (0, import_react10.useState)({});
      const [pagination, setPagination] = (0, import_react10.useState)({ pageIndex: 0, pageSize: 10 });
      const clickTimeoutRef = (0, import_react10.useRef)(null);
      (0, import_react10.useEffect)(() => {
        return () => {
          if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        };
      }, []);
      (0, import_react10.useEffect)(() => {
        if (!searchConfig.enabled || !searchConfig.serverSide) return;
        const timer = setTimeout(() => {
          if (fireWidgetEvent) fireWidgetEvent("onSearch", { searchTerm: globalFilter });
        }, 300);
        return () => clearTimeout(timer);
      }, [globalFilter, searchConfig.serverSide, searchConfig.enabled, fireWidgetEvent]);
      (0, import_react10.useEffect)(() => {
        if (!setWidgetState) return;
        const selectedIndices = Object.keys(rowSelection).filter((k) => rowSelection[k]).map(Number);
        setWidgetState((prev) => ({
          ...prev,
          searchTerm: globalFilter,
          selectedRowIndices: selectedIndices,
          selectedRows: selectedIndices.map((i) => rows[i]).filter(Boolean),
          pendingEdits
        }));
      }, [globalFilter, rowSelection, rows, pendingEdits, setWidgetState]);
      const columnDefs = (0, import_react10.useMemo)(() => {
        const defs = [];
        if (multiSelectConfig.enabled) {
          defs.push({
            id: "_select",
            header: ({ table: table2 }) => multiSelectConfig.showSelectAll ? /* @__PURE__ */ import_react10.default.createElement(
              import_ui9.Checkbox,
              {
                checked: table2.getIsAllPageRowsSelected(),
                onCheckedChange: (v) => table2.toggleAllPageRowsSelected(!!v),
                "aria-label": "Select all",
                className: "h-3.5 w-3.5"
              }
            ) : null,
            cell: ({ row }) => /* @__PURE__ */ import_react10.default.createElement(
              import_ui9.Checkbox,
              {
                checked: row.getIsSelected(),
                onCheckedChange: (v) => row.toggleSelected(!!v),
                "aria-label": "Select row",
                className: "h-3.5 w-3.5",
                onClick: (e) => e.stopPropagation()
              }
            ),
            size: 40,
            enableSorting: false,
            enableGlobalFilter: false
          });
        }
        configColumns.forEach((col) => {
          defs.push({
            id: col.key,
            accessorKey: col.key,
            header: () => /* @__PURE__ */ import_react10.default.createElement("span", { className: "flex items-center gap-1" }, col.label || col.key, col.editable && (editingConfig.enabled || bulkEditConfig.enabled) && /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.Pencil, { className: "w-3 h-3 opacity-40" })),
            cell: ({ getValue, row, column, table: table2 }) => {
              const rowIdx = row.index;
              const colId = column.id;
              const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
              const isCellEditing = bulkEditConfig.enabled && editingCell?.rowIdx === rowIdx && editingCell?.colId === colId;
              const pendingVal = pendingEdits[rowIdx]?.[colId];
              const hasPending = pendingVal !== void 0;
              if (isRowEditing && col.editable) {
                return /* @__PURE__ */ import_react10.default.createElement(
                  import_ui9.Input,
                  {
                    value: rowDraft[colId] ?? "",
                    onChange: (e) => setRowDraft((prev) => ({ ...prev, [colId]: e.target.value })),
                    className: "h-7 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 rounded",
                    onClick: (e) => e.stopPropagation()
                  }
                );
              }
              if (isCellEditing && col.editable) {
                return /* @__PURE__ */ import_react10.default.createElement(EditableCell, { getValue, row, column, table: table2 });
              }
              const displayVal = hasPending ? pendingVal : getValue();
              return /* @__PURE__ */ import_react10.default.createElement("span", { className: hasPending ? "text-primary font-medium" : "" }, displayVal != null ? String(displayVal) : "\u2014", hasPending && /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.Pencil, { className: "inline-block w-3 h-3 ml-1 text-primary/60" }));
            },
            meta: { editable: col.editable }
          });
        });
        if (editingConfig.enabled) {
          defs.push({
            id: "_actions",
            header: () => null,
            cell: ({ row }) => {
              const rowIdx = row.index;
              const isEditing = editingRowId === rowIdx;
              if (isEditing) {
                return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-end gap-1", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react10.default.createElement(
                  import_ui9.Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6 text-primary hover:bg-primary/10",
                    onClick: () => handleSaveRow(rowIdx, row.original)
                  },
                  /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.Check, { className: "h-3.5 w-3.5" })
                ), /* @__PURE__ */ import_react10.default.createElement(
                  import_ui9.Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6 text-muted-foreground hover:text-foreground",
                    onClick: () => setEditingRowId(null)
                  },
                  /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.X, { className: "h-3.5 w-3.5" })
                ));
              }
              return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex justify-end", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react10.default.createElement(
                import_ui9.Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-6 w-6 text-muted-foreground/50 hover:text-foreground",
                  onClick: () => {
                    setEditingRowId(rowIdx);
                    setRowDraft({ ...row.original });
                  }
                },
                /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.Pencil, { className: "h-3.5 w-3.5" })
              ));
            },
            size: 70,
            enableSorting: false,
            enableGlobalFilter: false
          });
        }
        return defs;
      }, [configColumns, multiSelectConfig, editingConfig, bulkEditConfig, editingRowId, rowDraft, editingCell, pendingEdits]);
      const table = (0, import_react_table.useReactTable)({
        data: rows,
        columns: columnDefs,
        state: {
          globalFilter: searchConfig.enabled && !searchConfig.serverSide ? globalFilter : void 0,
          rowSelection,
          pagination: paginationConfig ? void 0 : pagination
        },
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: (0, import_react_table.getCoreRowModel)(),
        getFilteredRowModel: searchConfig.enabled && !searchConfig.serverSide ? (0, import_react_table.getFilteredRowModel)() : void 0,
        getPaginationRowModel: !paginationConfig ? (0, import_react_table.getPaginationRowModel)() : void 0,
        enableRowSelection: multiSelectConfig.enabled,
        meta: {
          updateCellData: (rowIdx, colId, value) => {
            setPendingEdits((prev) => ({
              ...prev,
              [rowIdx]: { ...prev[rowIdx] || {}, [colId]: value }
            }));
            setEditingCell(null);
          }
        }
      });
      const [serverPage, setServerPage] = (0, import_react10.useState)(1);
      const serverPageSize = paginationConfig && rows.length > 0 ? rows.length : 10;
      const serverTotalRows = paginationConfig?.totalRows ?? rows.length;
      const serverTotalPages = paginationConfig ? Math.max(1, Math.ceil(serverTotalRows / serverPageSize)) : 1;
      const handleServerPageChange = (0, import_react10.useCallback)((newPage) => {
        if (newPage < 1 || newPage > serverTotalPages) return;
        setServerPage(newPage);
        const offset = (newPage - 1) * serverPageSize;
        if (fireWidgetEvent) fireWidgetEvent("onPageChange", { page: newPage, pageSize: serverPageSize, offset });
      }, [serverTotalPages, serverPageSize, fireWidgetEvent]);
      const handleExport = (0, import_react10.useCallback)(() => {
        const format = exportConfig.format || "csv";
        if (exportConfig.serverSide) {
          if (fireWidgetEvent) fireWidgetEvent("onExport", { format, rowCount: rows.length });
          return;
        }
        const visibleRows = table.getFilteredRowModel().rows.map((r) => r.original);
        if (format === "json") exportToJSON(configColumns, visibleRows, `export-${Date.now()}.json`);
        else exportToCSV(configColumns, visibleRows, `export-${Date.now()}.csv`);
      }, [exportConfig, fireWidgetEvent, rows, table, configColumns]);
      const handleSaveRow = (0, import_react10.useCallback)((idx, originalRow) => {
        const changes = {};
        configColumns.forEach((c) => {
          if (c.editable && String(originalRow[c.key]) !== String(rowDraft[c.key])) {
            changes[c.key] = rowDraft[c.key];
          }
        });
        if (fireWidgetEvent) fireWidgetEvent("onRowSave", { rowIndex: idx, originalRow, updatedRow: { ...rowDraft }, changes });
        setEditingRowId(null);
      }, [configColumns, rowDraft, fireWidgetEvent]);
      const handleSaveBulkEdits = (0, import_react10.useCallback)(() => {
        const edits = Object.entries(pendingEdits).map(([rIdx, changes]) => ({
          rowIndex: Number(rIdx),
          originalRow: rows[Number(rIdx)],
          changes
        }));
        if (fireWidgetEvent) fireWidgetEvent("onBulkEdit", { edits });
        setPendingEdits({});
      }, [pendingEdits, rows, fireWidgetEvent]);
      const handleBulkAction = (0, import_react10.useCallback)((actionKey) => {
        const selectedIndices = Object.keys(rowSelection).filter((k) => rowSelection[k]).map(Number);
        const selectedRows = selectedIndices.map((i) => rows[i]);
        if (actionKey === "delete") {
          if (fireWidgetEvent) fireWidgetEvent("onBulkDelete", { selectedRows, selectedRowIndices: selectedIndices });
        } else if (actionKey === "export") {
          if (fireWidgetEvent) fireWidgetEvent("onBulkExport", { selectedRows, format: "csv" });
        } else {
          if (fireWidgetEvent) fireWidgetEvent("onBulkAction", { actionKey, selectedRows });
        }
      }, [rowSelection, rows, fireWidgetEvent]);
      const handleRowSelect = (0, import_react10.useCallback)((rowOriginal, rowIdx) => {
        if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedRowIndex: rowIdx, selectedRow: rowOriginal }));
        if (onRowSelect) onRowSelect(rowOriginal, rowIdx);
        if (fireWidgetEvent) fireWidgetEvent("onRowSelect", { row: rowOriginal, rowIndex: rowIdx });
      }, [setWidgetState, onRowSelect, fireWidgetEvent]);
      (0, import_react10.useEffect)(() => {
        if (onWidgetInit) {
          onWidgetInit({
            refresh: () => {
              if (runWorkflow) runWorkflow();
              if (refreshData) refreshData();
            },
            setSelectedRow: (index) => {
              const i = Number(index);
              if (!isNaN(i) && i >= 0 && i < rows.length) {
                if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedRowIndex: i, selectedRow: rows[i] }));
                if (onRowSelect) onRowSelect(rows[i], i);
              }
            }
          });
        }
      }, [onWidgetInit, runWorkflow, refreshData, rows, setWidgetState, onRowSelect]);
      const showToolbar = searchConfig.enabled || exportConfig.enabled;
      const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;
      const pendingEditCount = Object.values(pendingEdits).reduce((s, c) => s + Object.keys(c).length, 0);
      const displayRowModels = paginationConfig ? table.getCoreRowModel().rows : table.getRowModel().rows;
      if (!rows.length) {
        return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6" }, isLoadingWorkflows ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm shadow-sm border border-border" }, /* @__PURE__ */ import_react10.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react10.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Loading data...") : /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement("p", null, "No data available."), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-xs mt-1" }, "Ensure the data array template resolves to a non-empty array.")));
      }
      return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col w-full h-full min-h-0 overflow-hidden relative" }, isLoadingWorkflows && /* @__PURE__ */ import_react10.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react10.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react10.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), showToolbar && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 gap-3 flex-shrink-0" }, searchConfig.enabled ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "relative flex-1 max-w-xs" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" }), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Input,
        {
          value: globalFilter ?? "",
          onChange: (e) => setGlobalFilter(e.target.value),
          placeholder: searchConfig.placeholder || "Search...",
          className: "h-7 text-xs pl-8 bg-background border-border rounded"
        }
      )) : /* @__PURE__ */ import_react10.default.createElement("div", null), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, exportConfig.enabled && /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: handleExport }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.FileDown, { className: "h-3.5 w-3.5 mr-1.5" }), exportConfig.buttonLabel || "Export"))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1 overflow-auto min-h-0" }, /* @__PURE__ */ import_react10.default.createElement("table", { className: "w-full text-sm border-collapse" }, /* @__PURE__ */ import_react10.default.createElement("thead", { className: "sticky top-0 z-10 bg-muted/50 backdrop-blur-sm" }, table.getHeaderGroups().map((hg) => /* @__PURE__ */ import_react10.default.createElement("tr", { key: hg.id }, hg.headers.map((header) => /* @__PURE__ */ import_react10.default.createElement(
        "th",
        {
          key: header.id,
          className: "text-left px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap select-none",
          style: header.column.getSize() ? { width: header.column.getSize() } : void 0
        },
        header.isPlaceholder ? null : (0, import_react_table.flexRender)(header.column.columnDef.header, header.getContext())
      ))))), /* @__PURE__ */ import_react10.default.createElement("tbody", null, displayRowModels.map((row) => {
        const rowIdx = row.index;
        const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
        const hasPendingEdits = !!pendingEdits[rowIdx];
        const isRowSelected = row.getIsSelected();
        return /* @__PURE__ */ import_react10.default.createElement(
          "tr",
          {
            key: row.id,
            className: `border-b border-border/50 last:border-b-0 cursor-pointer transition-colors ${isRowSelected ? "bg-primary/5" : isRowEditing ? "bg-primary/5" : hasPendingEdits ? "bg-primary/[0.03]" : widgetState?.selectedRowIndex === rowIdx ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`
          },
          row.getVisibleCells().map((cell) => {
            const isEditable = cell.column.columnDef.meta?.editable;
            const colId = cell.column.id;
            const isSpecialCol = colId === "_select" || colId === "_actions";
            return /* @__PURE__ */ import_react10.default.createElement(
              "td",
              {
                key: cell.id,
                className: "px-3 py-2 text-sm text-foreground whitespace-nowrap",
                onClick: (e) => {
                  if (isSpecialCol) return;
                  if (bulkEditConfig.enabled && isEditable) {
                    e.stopPropagation();
                    if (clickTimeoutRef.current) {
                      clearTimeout(clickTimeoutRef.current);
                    }
                    clickTimeoutRef.current = setTimeout(() => {
                      handleRowSelect(row.original, rowIdx);
                      clickTimeoutRef.current = null;
                    }, 220);
                  } else {
                    handleRowSelect(row.original, rowIdx);
                  }
                },
                onDoubleClick: (e) => {
                  if (isSpecialCol) return;
                  if (bulkEditConfig.enabled && isEditable) {
                    e.stopPropagation();
                    if (clickTimeoutRef.current) {
                      clearTimeout(clickTimeoutRef.current);
                      clickTimeoutRef.current = null;
                    }
                    setEditingCell({ rowIdx, colId });
                  }
                }
              },
              (0, import_react_table.flexRender)(cell.column.columnDef.cell, cell.getContext())
            );
          })
        );
      })))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "absolute bottom-12 left-0 right-0 px-4 flex flex-col gap-2 pointer-events-none z-30" }, multiSelectConfig.enabled && selectedCount > 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between bg-card border border-border shadow-md rounded-lg p-3 pointer-events-auto" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs font-medium text-foreground px-2" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-primary font-medium" }, selectedCount), " row", selectedCount !== 1 ? "s" : "", " selected"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, (multiSelectConfig.actions || []).map((act, i) => /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Button,
        {
          key: i,
          size: "sm",
          variant: act.variant === "destructive" ? "destructive" : "outline",
          className: "h-7 text-xs",
          onClick: () => handleBulkAction(act.actionKey)
        },
        act.label
      )))), bulkEditConfig.enabled && pendingEditCount > 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between bg-card border border-primary/30 shadow-md rounded-lg p-3 pointer-events-auto" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs font-medium text-foreground px-2" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-primary font-medium" }, pendingEditCount), " unsaved change", pendingEditCount !== 1 ? "s" : ""), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { size: "sm", variant: "ghost", className: "h-7 text-xs text-muted-foreground", onClick: () => setPendingEdits({}) }, "Discard"), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { size: "sm", className: "h-7 text-xs", onClick: handleSaveBulkEdits }, bulkEditConfig.saveLabel || "Save All Changes")))), paginationConfig ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground" }, serverTotalRows, " total row", serverTotalRows !== 1 ? "s" : ""), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground mr-2" }, "Page ", serverPage, " of ", serverTotalPages), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(1), disabled: serverPage === 1 || isLoadingWorkflows }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverPage - 1), disabled: serverPage === 1 || isLoadingWorkflows }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverPage + 1), disabled: serverPage >= serverTotalPages || isLoadingWorkflows }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronRight, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverTotalPages), disabled: serverPage >= serverTotalPages || isLoadingWorkflows }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsRight, { className: "h-4 w-4" })))) : rows.length > 10 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground" }, table.getFilteredRowModel().rows.length, " total row", table.getFilteredRowModel().rows.length !== 1 ? "s" : ""), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground mr-2" }, "Page ", table.getState().pagination.pageIndex + 1, " of ", table.getPageCount()), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage() }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.nextPage(), disabled: !table.getCanNextPage() }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronRight, { className: "h-4 w-4" })), /* @__PURE__ */ import_react10.default.createElement(import_ui9.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsRight, { className: "h-4 w-4" })))));
    };
    TableWidget.propTypes = {
      widgetConfig: import_prop_types9.default.object,
      data: import_prop_types9.default.oneOfType([import_prop_types9.default.array, import_prop_types9.default.object]),
      runWorkflow: import_prop_types9.default.func,
      isLoadingWorkflows: import_prop_types9.default.bool,
      onWidgetInit: import_prop_types9.default.func,
      refreshData: import_prop_types9.default.func,
      widgetState: import_prop_types9.default.object,
      setWidgetState: import_prop_types9.default.func,
      onRowSelect: import_prop_types9.default.func,
      fireWidgetEvent: import_prop_types9.default.func
    };
  }
});

// src/table/tableConfigEditor.jsx
var import_react11, import_prop_types10, import_ui10, import_lucide_react7, TemplateAutocompleteInput, collectArrayPaths3, isScalarNumeric, collectScalarPaths, resolvePath, TableConfigEditor;
var init_tableConfigEditor = __esm({
  "src/table/tableConfigEditor.jsx"() {
    import_react11 = __toESM(require("react"));
    import_prop_types10 = __toESM(require("prop-types"));
    import_ui10 = require("@jet-admin/ui");
    import_lucide_react7 = require("lucide-react");
    TemplateAutocompleteInput = ({ value, onChange, placeholder, suggestions }) => {
      const [showSuggestions, setShowSuggestions] = import_react11.default.useState(false);
      const handleFocus = () => {
        if (suggestions.length > 0) setShowSuggestions(true);
      };
      const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
      };
      const handleChange = (e) => {
        onChange(e.target.value);
        setShowSuggestions(true);
      };
      const handleSelect = (path) => {
        onChange(path);
        setShowSuggestions(false);
      };
      const filteredSuggestions = suggestions.filter(
        (s) => !value || s.value.toLowerCase().includes(value.toLowerCase()) || value === "{{"
      );
      return /* @__PURE__ */ import_react11.default.createElement("div", { className: "relative flex flex-col gap-1" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          type: "text",
          className: "text-xs font-mono h-8 w-full",
          value: value || "",
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          placeholder
        }
      ), showSuggestions && filteredSuggestions.length > 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "absolute z-50 top-full left-0 right-0 mt-1 bg-brand-dark border border-border rounded-md shadow-lg max-h-48 overflow-auto" }, filteredSuggestions.map((s, idx) => /* @__PURE__ */ import_react11.default.createElement(
        "div",
        {
          key: idx,
          onMouseDown: (e) => e.preventDefault(),
          onClick: () => handleSelect(s.value),
          className: "w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors"
        },
        /* @__PURE__ */ import_react11.default.createElement("span", { className: "font-mono text-foreground" }, s.label),
        s.detail && /* @__PURE__ */ import_react11.default.createElement("span", { className: "text-[10px] text-muted-foreground" }, s.detail)
      ))));
    };
    collectArrayPaths3 = (obj, prefix = "", depth = 0, maxDepth = 4) => {
      const results = [];
      if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
      for (const key of Object.keys(obj)) {
        if (key.startsWith("__")) continue;
        const val = obj[key];
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
          results.push({
            path: fullPath,
            label: fullPath,
            sampleKeys: Object.keys(val[0]),
            rowCount: val.length
          });
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          results.push(...collectArrayPaths3(val, fullPath, depth + 1, maxDepth));
        }
      }
      return results;
    };
    isScalarNumeric = (val) => {
      if (typeof val === "number") return true;
      if (typeof val === "string") {
        const trimmed = val.trim();
        return trimmed !== "" && !isNaN(Number(trimmed)) && !isNaN(parseFloat(trimmed));
      }
      return false;
    };
    collectScalarPaths = (obj, prefix = "", depth = 0, maxDepth = 4) => {
      const results = [];
      if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
      for (const key of Object.keys(obj)) {
        if (key.startsWith("__")) continue;
        const val = obj[key];
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (isScalarNumeric(val)) {
          results.push({ path: fullPath, label: fullPath, value: val });
        } else if (val && typeof val === "object") {
          if (Array.isArray(val)) {
            if (val.length > 0 && typeof val[0] === "object") {
              results.push(...collectScalarPaths(val[0], `${fullPath}[0]`, depth + 1, maxDepth));
            }
          } else {
            results.push(...collectScalarPaths(val, fullPath, depth + 1, maxDepth));
          }
        }
      }
      return results;
    };
    resolvePath = (obj, path) => {
      if (!obj || !path) return void 0;
      const parts = path.split(".");
      let current = obj;
      for (const part of parts) {
        if (current == null) return void 0;
        current = current[part];
      }
      return current;
    };
    TableConfigEditor = ({ widgetEditorForm, dataSourceResults }) => {
      const config = widgetEditorForm.values.widgetConfig || {};
      const dataSources = config.dataSources || [];
      const columns = config.columns || [];
      const pagination = config.pagination || {
        enabled: false,
        pageParam: "page",
        pageSizeParam: "limit",
        totalTemplate: ""
      };
      const search = config.search || { enabled: false, serverSide: false, placeholder: "Search..." };
      const exportConfig = config.export || { enabled: false, format: "csv", serverSide: false, buttonLabel: "Export" };
      const editing = config.editing || { enabled: false };
      const multiSelect = config.multiSelect || { enabled: false, showSelectAll: true, actions: [] };
      const bulkEdit = config.bulkEdit || { enabled: false, saveLabel: "Save All Changes" };
      const aliasSuggestions = (0, import_react11.useMemo)(() => {
        const suggestions = [];
        if (!dataSourceResults) return suggestions;
        if (dataSourceResults.queries) {
          Object.keys(dataSourceResults.queries).forEach((alias) => suggestions.push(`queries.${alias}`));
        }
        if (dataSourceResults.workflows) {
          Object.keys(dataSourceResults.workflows).forEach((alias) => suggestions.push(`workflows.${alias}`));
        }
        return suggestions;
      }, [dataSourceResults]);
      const arrayPaths = (0, import_react11.useMemo)(() => {
        const paths = [];
        if (dataSourceResults) {
          paths.push(...collectArrayPaths3(dataSourceResults));
        }
        if (paths.length === 0 && aliasSuggestions.length > 0) {
          for (const alias of aliasSuggestions) {
            paths.push({
              path: `${alias}.data`,
              label: `${alias}.data`,
              sampleKeys: [],
              rowCount: 0,
              isSuggestion: true
            });
            paths.push({
              path: `${alias}.data`,
              label: `${alias}.data`,
              sampleKeys: [],
              rowCount: 0,
              isSuggestion: true
            });
          }
        }
        return paths;
      }, [dataSourceResults, aliasSuggestions]);
      const scalarPaths = (0, import_react11.useMemo)(() => {
        const paths = [];
        if (dataSourceResults) {
          paths.push(...collectScalarPaths(dataSourceResults));
        }
        if (paths.length === 0 && aliasSuggestions.length > 0) {
          for (const alias of aliasSuggestions) {
            paths.push({
              path: `${alias}.total`,
              label: `${alias}.total`,
              value: null,
              isSuggestion: true
            });
          }
        }
        return paths;
      }, [dataSourceResults, aliasSuggestions]);
      const arraySuggestions = (0, import_react11.useMemo)(() => {
        return arrayPaths.map((arr) => ({
          label: `{{ ${arr.path} }}`,
          value: `{{ ${arr.path} }}`,
          detail: arr.isSuggestion ? "suggested" : `${arr.rowCount} rows`
        }));
      }, [arrayPaths]);
      const scalarSuggestions = (0, import_react11.useMemo)(() => {
        return scalarPaths.map((s) => ({
          label: `{{ ${s.path} }}`,
          value: `{{ ${s.path} }}`,
          detail: s.isSuggestion ? "" : `= ${s.value}`
        }));
      }, [scalarPaths]);
      const dataArrayPathStr = config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "";
      const dataArrayPath = dataArrayPathStr.replace(/^{{\s*/, "").replace(/\s*}}$/, "");
      const discoveredColumns = (0, import_react11.useMemo)(() => {
        if (!dataSourceResults || !dataArrayPath) return [];
        const resolved = resolvePath(dataSourceResults, dataArrayPath);
        if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === "object") {
          return Object.keys(resolved[0]).map((key) => ({
            key,
            label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            type: typeof resolved[0][key]
          }));
        }
        return [];
      }, [dataSourceResults, dataArrayPath]);
      const availableKeys = (0, import_react11.useMemo)(() => {
        return discoveredColumns.map((c) => c.key);
      }, [discoveredColumns]);
      const handleAddColumn = (0, import_react11.useCallback)(() => {
        widgetEditorForm.setFieldValue("widgetConfig.columns", [
          ...columns,
          { label: "New Column", key: "" }
        ]);
      }, [widgetEditorForm, columns]);
      const handleAutoPopulateColumns = (0, import_react11.useCallback)(() => {
        if (discoveredColumns.length === 0) return;
        const newColumns = discoveredColumns.map((col) => ({
          label: col.label,
          key: col.key
        }));
        widgetEditorForm.setFieldValue("widgetConfig.columns", newColumns);
      }, [widgetEditorForm, discoveredColumns]);
      const handleUpdateColumn = (0, import_react11.useCallback)(
        (index, field, value) => {
          const updated = [...columns];
          updated[index] = { ...updated[index], [field]: value };
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleRemoveColumn = (0, import_react11.useCallback)(
        (index) => {
          const updated = [...columns];
          updated.splice(index, 1);
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleMoveColumn = (0, import_react11.useCallback)(
        (index, direction) => {
          const newIndex = index + direction;
          if (newIndex < 0 || newIndex >= columns.length) return;
          const updated = [...columns];
          const [moved] = updated.splice(index, 1);
          updated.splice(newIndex, 0, moved);
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleAddBulkAction = (0, import_react11.useCallback)(() => {
        const currentActions = multiSelect.actions || [];
        widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", [
          ...currentActions,
          { label: "New Action", actionKey: `action_${currentActions.length + 1}`, variant: "default" }
        ]);
      }, [widgetEditorForm, multiSelect]);
      const handleUpdateBulkAction = (0, import_react11.useCallback)((index, field, value) => {
        const updated = [...multiSelect.actions || []];
        updated[index] = { ...updated[index], [field]: value };
        widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", updated);
      }, [widgetEditorForm, multiSelect]);
      const handleRemoveBulkAction = (0, import_react11.useCallback)((index) => {
        const updated = [...multiSelect.actions || []];
        updated.splice(index, 1);
        widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", updated);
      }, [widgetEditorForm, multiSelect]);
      const handlePaginationToggle = (checked) => {
        widgetEditorForm.setFieldValue("widgetConfig.pagination", {
          ...pagination,
          enabled: checked
        });
      };
      const handleConfigChange = (field, value) => {
        widgetEditorForm.setFieldValue(`widgetConfig.${field}`, value);
      };
      const handlePaginationChange = (field, value) => {
        widgetEditorForm.setFieldValue("widgetConfig.pagination", {
          ...pagination,
          [field]: value
        });
      };
      return /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Data Array Template"), /* @__PURE__ */ import_react11.default.createElement(
        TemplateAutocompleteInput,
        {
          value: config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "",
          onChange: (val) => handleConfigChange("dataArrayTemplate", val),
          placeholder: "e.g. {{ queries.my_query.data }}",
          suggestions: arraySuggestions
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.65rem] text-muted-foreground" }, "Mustache template evaluating to an array of objects.")), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Total Count Template ", /* @__PURE__ */ import_react11.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react11.default.createElement(
        TemplateAutocompleteInput,
        {
          value: pagination.totalTemplate || config.dataMapping?.totalCountPath || "",
          onChange: (val) => handlePaginationChange("totalTemplate", val),
          placeholder: "e.g. {{ queries.my_query.total }}",
          suggestions: scalarSuggestions
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Used for server-side pagination. Leave empty to use array length."))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Table Columns"), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex gap-1" }, discoveredColumns.length > 0 && /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAutoPopulateColumns,
          className: "h-7 text-xs px-2",
          title: "Auto-detect columns from data"
        },
        /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Sparkles, { className: "mr-1 text-amber-500" }),
        " Auto-detect"
      ), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAddColumn,
          className: "h-7 text-xs px-2"
        },
        /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Plus, { className: "mr-1" }),
        " Add"
      ))), discoveredColumns.length > 0 && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Zap, { className: "w-3.5 h-3.5 shrink-0" }), /* @__PURE__ */ import_react11.default.createElement("span", null, /* @__PURE__ */ import_react11.default.createElement("strong", null, discoveredColumns.length), " fields detected from loaded data. Click ", /* @__PURE__ */ import_react11.default.createElement("strong", null, "Auto-detect"), " to populate columns.")), !dataArrayPath && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs" }, "Configure a Data Array Template above first, then come back here to set up columns."), dataArrayPath && discoveredColumns.length === 0 && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs leading-relaxed" }, "No columns detected from ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "font-mono bg-muted px-1 py-0.5 rounded text-primary" }, dataArrayPath), ".", /* @__PURE__ */ import_react11.default.createElement("br", null), /* @__PURE__ */ import_react11.default.createElement("br", null), "Make sure the expression points to an array of objects and that you have executed the data source in the App Page Editor, or add columns manually."), columns.length > 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2" }, columns.map((col, idx) => /* @__PURE__ */ import_react11.default.createElement(
        "div",
        {
          key: idx,
          className: "flex flex-col gap-2 p-2 border rounded-md bg-muted/30"
        },
        /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-end gap-1.5" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex flex-col gap-0.5 pb-0.5" }, /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, -1),
            disabled: idx === 0,
            title: "Move up"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.ArrowUp, { className: "h-3.5 w-3.5" })
        ), /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, 1),
            disabled: idx === columns.length - 1,
            title: "Move down"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.ArrowDown, { className: "h-3.5 w-3.5" })
        )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Header Label"), /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Input,
          {
            value: col.label,
            onChange: (e) => handleUpdateColumn(idx, "label", e.target.value),
            className: "h-7 text-xs",
            placeholder: "User Name"
          }
        )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Data Key"), availableKeys.length > 0 ? /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Select,
          {
            value: col.key || "",
            onValueChange: (val) => handleUpdateColumn(idx, "key", val)
          },
          /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, { placeholder: "Select field\u2026" })),
          /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, availableKeys.map((key) => /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { key, value: key }, key)))
        ) : /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Input,
          {
            value: col.key,
            onChange: (e) => handleUpdateColumn(idx, "key", e.target.value),
            className: "h-7 text-xs font-mono",
            placeholder: "user_name"
          }
        )), /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10",
            onClick: () => handleRemoveColumn(idx),
            title: "Remove column"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Trash2, { className: "h-4 w-4" })
        )),
        /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center pl-8" }, /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Checkbox,
          {
            id: `col-edit-${idx}`,
            checked: !!col.editable,
            onCheckedChange: (val) => handleUpdateColumn(idx, "editable", !!val),
            className: "h-3.5 w-3.5"
          }
        ), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { htmlFor: `col-edit-${idx}`, className: "text-[10px] ml-1.5 text-muted-foreground cursor-pointer" }, "Editable Column"))
      )))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Pagination"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: pagination.enabled,
          onCheckedChange: handlePaginationToggle
        }
      )), pagination.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2 bg-muted/30 p-3 rounded-md border mt-1" }, /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Configure pagination actions in the ", /* @__PURE__ */ import_react11.default.createElement("strong", null, "Events"), " tab using the ", /* @__PURE__ */ import_react11.default.createElement("strong", null, "On Page Change"), " event. Event data: ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-[10px]" }, "{{ event.page }}"), ",", " ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-[10px]" }, "{{ event.offset }}"), ",", " ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-[10px]" }, "{{ event.pageSize }}")))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "grid grid-cols-2 gap-4 border-t pt-4" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Search Box"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: search.enabled,
          onCheckedChange: (v) => handleConfigChange("search", { ...search, enabled: v })
        }
      )), search.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Checkbox,
        {
          id: "search-server",
          checked: search.serverSide,
          onCheckedChange: (v) => handleConfigChange("search", { ...search, serverSide: !!v })
        }
      ), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { htmlFor: "search-server", className: "text-[10px] cursor-pointer" }, "Server-side (fires onSearch)")), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: search.placeholder || "",
          onChange: (e) => handleConfigChange("search", { ...search, placeholder: e.target.value }),
          placeholder: "Search placeholder...",
          className: "h-7 text-xs"
        }
      ))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Export Data"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: exportConfig.enabled,
          onCheckedChange: (v) => handleConfigChange("export", { ...exportConfig, enabled: v })
        }
      )), exportConfig.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Checkbox,
        {
          id: "export-server",
          checked: exportConfig.serverSide,
          onCheckedChange: (v) => handleConfigChange("export", { ...exportConfig, serverSide: !!v })
        }
      ), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { htmlFor: "export-server", className: "text-[10px] cursor-pointer" }, "Server-side (fires onExport)")), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: exportConfig.buttonLabel || "",
          onChange: (e) => handleConfigChange("export", { ...exportConfig, buttonLabel: e.target.value }),
          placeholder: "Button Label",
          className: "h-7 text-xs flex-1"
        }
      ), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Select,
        {
          value: exportConfig.format || "csv",
          onValueChange: (v) => handleConfigChange("export", { ...exportConfig, format: v })
        },
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "h-7 text-xs w-[70px]" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, null)),
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "csv" }, "CSV"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "json" }, "JSON"))
      ))))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3 border-t pt-4" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Multi-Row Selection"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: multiSelect.enabled,
          onCheckedChange: (v) => handleConfigChange("multiSelect", { ...multiSelect, enabled: v })
        }
      )), multiSelect.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2 bg-muted/30 p-3 rounded border" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center gap-2 pb-2 border-b" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Checkbox,
        {
          id: "ms-select-all",
          checked: multiSelect.showSelectAll,
          onCheckedChange: (v) => handleConfigChange("multiSelect", { ...multiSelect, showSelectAll: !!v })
        }
      ), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { htmlFor: "ms-select-all", className: "text-[10px] cursor-pointer" }, 'Show "Select All" Checkbox')), /* @__PURE__ */ import_react11.default.createElement("div", { className: "pt-1" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex justify-between items-center mb-2" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[10px] font-medium" }, "Bulk Actions"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Button, { type: "button", variant: "outline", size: "sm", onClick: handleAddBulkAction, className: "h-6 text-[10px] px-2" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Plus, { className: "mr-1 h-3 w-3" }), " Add Action")), (!multiSelect.actions || multiSelect.actions.length === 0) && /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[10px] text-muted-foreground italic" }, "No bulk actions configured. Selection will be tracked in widgetState."), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1.5" }, (multiSelect.actions || []).map((act, idx) => /* @__PURE__ */ import_react11.default.createElement("div", { key: idx, className: "flex items-center gap-1.5 bg-background p-1.5 rounded border" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: act.label,
          onChange: (e) => handleUpdateBulkAction(idx, "label", e.target.value),
          placeholder: "Label",
          className: "h-6 text-[10px] w-24"
        }
      ), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: act.actionKey,
          onChange: (e) => handleUpdateBulkAction(idx, "actionKey", e.target.value),
          placeholder: "actionKey",
          className: "h-6 text-[10px] font-mono flex-1"
        }
      ), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Select, { value: act.variant || "default", onValueChange: (v) => handleUpdateBulkAction(idx, "variant", v) }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "h-6 text-[10px] w-20" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, null)), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "destructive" }, "Danger"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "outline" }, "Outline"))), /* @__PURE__ */ import_react11.default.createElement(import_ui10.Button, { type: "button", variant: "ghost", size: "icon", onClick: () => handleRemoveBulkAction(idx), className: "h-6 w-6 text-destructive shrink-0" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Trash2, { className: "h-3 w-3" })))))))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "grid grid-cols-2 gap-4 border-t pt-4" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Inline Row Editing"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: editing.enabled,
          onCheckedChange: (v) => {
            handleConfigChange("editing", { ...editing, enabled: v });
            if (v && bulkEdit.enabled) handleConfigChange("bulkEdit", { ...bulkEdit, enabled: false });
          }
        }
      )), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[9.5px] text-muted-foreground leading-tight" }, "Adds an Edit button to each row. Fires ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "bg-background px-1 border rounded" }, "onRowSave"), ".")), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Excel-Style Bulk Edit"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: bulkEdit.enabled,
          onCheckedChange: (v) => {
            handleConfigChange("bulkEdit", { ...bulkEdit, enabled: v });
            if (v && editing.enabled) handleConfigChange("editing", { ...editing, enabled: false });
          }
        }
      )), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[9.5px] text-muted-foreground leading-tight" }, "Double-click cells to edit. Fires ", /* @__PURE__ */ import_react11.default.createElement("code", { className: "bg-background px-1 border rounded" }, "onBulkEdit"), " on save."), bulkEdit.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1 bg-muted/30 p-2 rounded border mt-2" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[10px]" }, "Save Button Label"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: bulkEdit.saveLabel || "Save All Changes",
          onChange: (e) => handleConfigChange("bulkEdit", { ...bulkEdit, saveLabel: e.target.value }),
          className: "h-7 text-xs"
        }
      )))));
    };
    TableConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types10.default.object.isRequired,
      dataSourceResults: import_prop_types10.default.object
    };
  }
});

// src/button/buttonConfigEditor.jsx
var import_react12, import_prop_types11, import_ui11, ButtonConfigEditor;
var init_buttonConfigEditor = __esm({
  "src/button/buttonConfigEditor.jsx"() {
    import_react12 = __toESM(require("react"));
    import_prop_types11 = __toESM(require("prop-types"));
    import_ui11 = require("@jet-admin/ui");
    ButtonConfigEditor = ({ widgetEditorForm }) => {
      return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Button Text"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Input,
        {
          type: "text",
          className: "text-sm",
          value: widgetEditorForm.values.widgetConfig?.text || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.text", e.target.value),
          placeholder: "Click Me"
        }
      )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Variant"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Select,
        {
          value: widgetEditorForm.values.widgetConfig?.variant || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
        },
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectValue, { placeholder: "Select variant" })),
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "destructive" }, "Destructive"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "outline" }, "Outline"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "secondary" }, "Secondary"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "ghost" }, "Ghost"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "link" }, "Link"))
      )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Select,
        {
          value: widgetEditorForm.values.widgetConfig?.size || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
        },
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectValue, { placeholder: "Select size" })),
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "icon" }, "Icon"))
      ))));
    };
    ButtonConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types11.default.object.isRequired
    };
  }
});

// src/button/buttonWidget.jsx
var import_react19, import_prop_types18, import_ui18, ButtonWidget;
var init_buttonWidget = __esm({
  "src/button/buttonWidget.jsx"() {
    import_react19 = __toESM(require("react"));
    import_prop_types18 = __toESM(require("prop-types"));
    import_ui18 = require("@jet-admin/ui");
    ButtonWidget = ({
      widgetTitle,
      // Title of the widget (optional usage here)
      widgetType,
      // Type of widget (e.g., 'button')
      widgetConfig,
      // Widget-level config (text, variant, size)
      onClick,
      // Callback to execute the attached event/workflow
      isLoadingWorkflows
      // Loading state of the workflow
    }) => {
      const [loading, setLoading] = (0, import_react19.useState)(false);
      const text = widgetConfig?.text || "Click Me";
      const variant = widgetConfig?.variant || "default";
      const size = widgetConfig?.size || "default";
      const handleClick = async (e) => {
        if (onClick) {
          setLoading(true);
          try {
            await onClick(e);
          } finally {
            setLoading(false);
          }
        }
      };
      return /* @__PURE__ */ import_react19.default.createElement(
        import_ui18.Button,
        {
          variant,
          size,
          onClick: handleClick,
          disabled: loading || isLoadingWorkflows,
          className: "!w-full !h-full rounded-none flex items-center justify-center text-center px-4 border-0"
        },
        (loading || isLoadingWorkflows) && /* @__PURE__ */ import_react19.default.createElement(import_ui18.Spinner, { className: "mr-2 h-4 w-4" }),
        text
      );
    };
    ButtonWidget.propTypes = {
      widgetTitle: import_prop_types18.default.string,
      widgetType: import_prop_types18.default.string,
      widgetConfig: import_prop_types18.default.object,
      onClick: import_prop_types18.default.func,
      isLoadingWorkflows: import_prop_types18.default.bool
    };
  }
});

// src/button/index.js
var button_exports = {};
__export(button_exports, {
  ButtonConfigEditor: () => ButtonConfigEditor,
  ButtonWidget: () => ButtonWidget
});
var init_button = __esm({
  "src/button/index.js"() {
    init_buttonWidget();
    init_buttonConfigEditor();
  }
});

// src/table/index.js
var table_exports = {};
__export(table_exports, {
  TableConfigEditor: () => TableConfigEditor,
  TableWidget: () => TableWidget
});
var init_table = __esm({
  "src/table/index.js"() {
    init_tableWidget();
    init_tableConfigEditor();
  }
});

// src/text/textWidget.jsx
var import_react20, import_prop_types19, parseMarkdown, inlineFormat, TextWidget;
var init_textWidget = __esm({
  "src/text/textWidget.jsx"() {
    import_react20 = __toESM(require("react"));
    import_prop_types19 = __toESM(require("prop-types"));
    parseMarkdown = (md) => {
      if (!md) return "";
      let html = md;
      html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="jet-md-pre"><code class="jet-md-code${lang ? ` language-${lang}` : ""}">${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()}</code></pre>`;
      });
      const lines = html.split("\n");
      const output = [];
      let inList = null;
      let listBuffer = [];
      const flushList = () => {
        if (inList && listBuffer.length > 0) {
          output.push(`<${inList} class="jet-md-list">${listBuffer.join("")}</${inList}>`);
          listBuffer = [];
          inList = null;
        }
      };
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("<pre")) {
          flushList();
          output.push(line);
          continue;
        }
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          flushList();
          const level = headingMatch[1].length;
          output.push(`<h${level} class="jet-md-h${level}">${inlineFormat(headingMatch[2])}</h${level}>`);
          continue;
        }
        if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
          flushList();
          output.push('<hr class="jet-md-hr" />');
          continue;
        }
        if (line.match(/^>\s*/)) {
          flushList();
          const text = line.replace(/^>\s*/, "");
          output.push(`<blockquote class="jet-md-blockquote">${inlineFormat(text)}</blockquote>`);
          continue;
        }
        const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
        if (ulMatch) {
          if (inList !== "ul") {
            flushList();
            inList = "ul";
          }
          listBuffer.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
          continue;
        }
        const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
        if (olMatch) {
          if (inList !== "ol") {
            flushList();
            inList = "ol";
          }
          listBuffer.push(`<li>${inlineFormat(olMatch[1])}</li>`);
          continue;
        }
        flushList();
        if (line.trim() === "") {
          continue;
        }
        output.push(`<p class="jet-md-p">${inlineFormat(line)}</p>`);
      }
      flushList();
      return output.join("\n");
    };
    inlineFormat = (text) => {
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="jet-md-img" />');
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="jet-md-link">$1</a>');
      text = text.replace(/`([^`]+)`/g, '<code class="jet-md-inline-code">$1</code>');
      text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
      text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
      text = text.replace(/_(.+?)_/g, "<em>$1</em>");
      text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
      return text;
    };
    TextWidget = ({
      widgetConfig,
      data
    }) => {
      const content = widgetConfig?.content || "";
      const format = widgetConfig?.format || "markdown";
      const textAlign = widgetConfig?.textAlign || "left";
      const fontSize = widgetConfig?.fontSize || "sm";
      const renderedHTML = (0, import_react20.useMemo)(() => {
        if (format === "plain") {
          return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
        }
        return parseMarkdown(content);
      }, [content, format]);
      const fontSizeClass = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl"
      }[fontSize] || "text-sm";
      return /* @__PURE__ */ import_react20.default.createElement(
        "div",
        {
          className: `jet-md-root w-full h-full overflow-auto p-3 ${fontSizeClass}`,
          style: { textAlign }
        },
        /* @__PURE__ */ import_react20.default.createElement("style", null, `
        .jet-md-root { color: var(--foreground, hsl(0 0% 98%)); line-height: 1.65; }
        .jet-md-h1 { font-size: 1.5em; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .jet-md-h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.25em; color: var(--foreground); }
        .jet-md-h3 { font-size: 1.15em; font-weight: 600; margin: 0.4em 0 0.2em; color: var(--foreground); }
        .jet-md-h4, .jet-md-h5, .jet-md-h6 { font-size: 1em; font-weight: 600; margin: 0.3em 0 0.15em; color: var(--foreground); }
        .jet-md-p { margin: 0.35em 0; }
        .jet-md-pre { background: hsl(var(--muted)); border-radius: 6px; padding: 0.75em 1em; margin: 0.5em 0; overflow-x: auto; }
        .jet-md-code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; font-size: 0.85em; }
        .jet-md-inline-code { background: hsl(var(--muted)); padding: 0.15em 0.4em; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.85em; }
        .jet-md-link { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .jet-md-link:hover { opacity: 0.8; }
        .jet-md-blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 0.75em; margin: 0.5em 0; color: hsl(var(--muted-foreground)); font-style: italic; }
        .jet-md-hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 0.75em 0; }
        .jet-md-list { padding-left: 1.5em; margin: 0.35em 0; }
        .jet-md-list li { margin: 0.15em 0; }
        .jet-md-img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
      `),
        /* @__PURE__ */ import_react20.default.createElement("div", { dangerouslySetInnerHTML: { __html: renderedHTML } })
      );
    };
    TextWidget.propTypes = {
      widgetConfig: import_prop_types19.default.object,
      data: import_prop_types19.default.any
    };
  }
});

// src/text/index.js
var text_exports = {};
__export(text_exports, {
  TextWidget: () => TextWidget
});
var init_text = __esm({
  "src/text/index.js"() {
    init_textWidget();
  }
});

// src/stat/statWidget.jsx
var import_react21, import_prop_types20, import_lucide_react9, StatWidget;
var init_statWidget = __esm({
  "src/stat/statWidget.jsx"() {
    import_react21 = __toESM(require("react"));
    import_prop_types20 = __toESM(require("prop-types"));
    import_lucide_react9 = require("lucide-react");
    StatWidget = ({
      widgetConfig,
      data
    }) => {
      const label = widgetConfig?.label || "Metric";
      const rawValue = widgetConfig?.valueTemplate ?? "";
      const prefix = widgetConfig?.prefix || "";
      const suffix = widgetConfig?.suffix || "";
      const rawTrend = widgetConfig?.trendTemplate ?? "";
      const trendDirection = widgetConfig?.trendDirection || "up-is-good";
      const align = widgetConfig?.textAlign || "center";
      const displayValue = (0, import_react21.useMemo)(() => {
        if (rawValue === "" || rawValue === null || rawValue === void 0) return "\u2014";
        const num = Number(rawValue);
        if (!isNaN(num) && typeof rawValue !== "boolean") {
          return num.toLocaleString(void 0, { maximumFractionDigits: 2 });
        }
        return String(rawValue);
      }, [rawValue]);
      const trend = (0, import_react21.useMemo)(() => {
        if (rawTrend === "" || rawTrend === null || rawTrend === void 0) return null;
        const num = parseFloat(rawTrend);
        if (isNaN(num)) return { value: rawTrend, direction: "neutral" };
        return {
          value: `${num >= 0 ? "+" : ""}${num.toLocaleString(void 0, { maximumFractionDigits: 1 })}%`,
          direction: num > 0 ? "up" : num < 0 ? "down" : "neutral"
        };
      }, [rawTrend]);
      const trendColor = (0, import_react21.useMemo)(() => {
        if (!trend) return "";
        const { direction } = trend;
        if (direction === "neutral") return "text-muted-foreground";
        if (trendDirection === "up-is-good") {
          return direction === "up" ? "text-emerald-500" : "text-red-500";
        }
        return direction === "down" ? "text-emerald-500" : "text-red-500";
      }, [trend, trendDirection]);
      const TrendIcon = trend?.direction === "up" ? import_lucide_react9.TrendingUp : trend?.direction === "down" ? import_lucide_react9.TrendingDown : import_lucide_react9.Minus;
      return /* @__PURE__ */ import_react21.default.createElement(
        "div",
        {
          className: "flex flex-col items-center justify-center w-full h-full p-4 gap-1",
          style: { textAlign: align, alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }
        },
        /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none" }, label),
        /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-baseline gap-1" }, prefix && /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-lg font-medium text-muted-foreground" }, prefix), /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-3xl font-bold text-foreground tabular-nums tracking-tight" }, displayValue), suffix && /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-lg font-medium text-muted-foreground" }, suffix)),
        trend && /* @__PURE__ */ import_react21.default.createElement("div", { className: `flex items-center gap-1 mt-0.5 ${trendColor}` }, /* @__PURE__ */ import_react21.default.createElement(TrendIcon, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-xs font-semibold" }, trend.value))
      );
    };
    StatWidget.propTypes = {
      widgetConfig: import_prop_types20.default.object,
      data: import_prop_types20.default.any
    };
  }
});

// src/stat/index.js
var stat_exports = {};
__export(stat_exports, {
  StatWidget: () => StatWidget
});
var init_stat = __esm({
  "src/stat/index.js"() {
    init_statWidget();
  }
});

// src/alert/alertWidget.jsx
var import_react22, import_prop_types21, import_lucide_react10, import_ui19, AlertWidget;
var init_alertWidget = __esm({
  "src/alert/alertWidget.jsx"() {
    import_react22 = __toESM(require("react"));
    import_prop_types21 = __toESM(require("prop-types"));
    import_lucide_react10 = require("lucide-react");
    import_ui19 = require("@jet-admin/ui");
    AlertWidget = ({
      widgetConfig,
      fireWidgetEvent
    }) => {
      const [dismissed, setDismissed] = (0, import_react22.useState)(false);
      const message = widgetConfig?.message || "Something requires your attention.";
      const title = widgetConfig?.title || "";
      const variant = widgetConfig?.variant || "info";
      const dismissible = widgetConfig?.dismissible ?? true;
      if (dismissed) return null;
      const handleDismiss = () => {
        setDismissed(true);
        if (fireWidgetEvent) {
          fireWidgetEvent("onDismiss");
        }
      };
      const IconMap = {
        info: import_lucide_react10.Info,
        success: import_lucide_react10.CheckCircle,
        warning: import_lucide_react10.AlertTriangle,
        error: import_lucide_react10.AlertCircle
      };
      const Icon = IconMap[variant] || import_lucide_react10.Info;
      const styles = {
        info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        error: "bg-rose-500/10 border-rose-500/20 text-rose-400"
      }[variant] || "bg-blue-500/10 border-blue-500/20 text-blue-400";
      return /* @__PURE__ */ import_react22.default.createElement(
        "div",
        {
          className: `flex items-start gap-3 p-3.5 border rounded-none w-full h-full min-h-0 overflow-auto relative ${styles}`
        },
        /* @__PURE__ */ import_react22.default.createElement(Icon, { className: "h-5 w-5 shrink-0 mt-0.5" }),
        /* @__PURE__ */ import_react22.default.createElement("div", { className: "flex-1 min-w-0" }, title && /* @__PURE__ */ import_react22.default.createElement("h5", { className: "text-sm font-semibold mb-1 leading-none text-current" }, title), /* @__PURE__ */ import_react22.default.createElement("p", { className: "text-xs leading-relaxed text-current/80" }, message)),
        dismissible && /* @__PURE__ */ import_react22.default.createElement(
          import_ui19.Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-current hover:bg-current/10 -mt-1 -mr-1",
            onClick: handleDismiss,
            "aria-label": "Dismiss alert"
          },
          /* @__PURE__ */ import_react22.default.createElement(import_lucide_react10.X, { className: "h-4 w-4" })
        )
      );
    };
    AlertWidget.propTypes = {
      widgetConfig: import_prop_types21.default.object,
      fireWidgetEvent: import_prop_types21.default.func
    };
  }
});

// src/alert/index.js
var alert_exports = {};
__export(alert_exports, {
  AlertWidget: () => AlertWidget
});
var init_alert = __esm({
  "src/alert/index.js"() {
    init_alertWidget();
  }
});

// src/form/formWidget.jsx
var import_react23, import_prop_types22, import_ui20, FormWidget;
var init_formWidget = __esm({
  "src/form/formWidget.jsx"() {
    import_react23 = __toESM(require("react"));
    import_prop_types22 = __toESM(require("prop-types"));
    import_ui20 = require("@jet-admin/ui");
    FormWidget = ({
      widgetConfig,
      fireWidgetEvent
    }) => {
      const fields = widgetConfig?.fields || [];
      const submitLabel = widgetConfig?.submitLabel || "Submit";
      const size = widgetConfig?.size || "default";
      const showReset = widgetConfig?.showReset ?? false;
      const [formData, setFormData] = (0, import_react23.useState)({});
      (0, import_react23.useEffect)(() => {
        const defaults = {};
        fields.forEach((field) => {
          if (field.key) {
            defaults[field.key] = field.defaultValue !== void 0 ? field.defaultValue : "";
          }
        });
        setFormData(defaults);
      }, [widgetConfig?.fields]);
      const handleFieldChange = (key, value) => {
        const nextData = { ...formData, [key]: value };
        setFormData(nextData);
        if (fireWidgetEvent) {
          fireWidgetEvent("onFieldChange", {
            field: key,
            value,
            formData: nextData
          });
        }
      };
      const handleSubmit = (e) => {
        e.preventDefault();
        if (fireWidgetEvent) {
          fireWidgetEvent("onSubmit", {
            formData
          });
        }
      };
      const handleReset = () => {
        const defaults = {};
        fields.forEach((field) => {
          if (field.key) {
            defaults[field.key] = field.defaultValue !== void 0 ? field.defaultValue : "";
          }
        });
        setFormData(defaults);
      };
      if (fields.length === 0) {
        return /* @__PURE__ */ import_react23.default.createElement("div", { className: "flex items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs text-center" }, "No fields configured in form properties.");
      }
      const formSizeClass = {
        sm: "space-y-2.5 p-3 text-xs",
        default: "space-y-4 p-4 text-sm",
        lg: "space-y-5.5 p-5 text-base"
      }[size] || "space-y-4 p-4 text-sm";
      return /* @__PURE__ */ import_react23.default.createElement(
        "form",
        {
          onSubmit: handleSubmit,
          className: `w-full h-full overflow-auto flex flex-col justify-between ${formSizeClass}`
        },
        /* @__PURE__ */ import_react23.default.createElement("div", { className: "space-y-3.5" }, fields.map((field, idx) => {
          if (!field.key) return null;
          const fieldType = field.type || "text";
          const inputId = `form-field-${field.key}-${idx}`;
          return /* @__PURE__ */ import_react23.default.createElement("div", { key: idx, className: "space-y-1.5" }, fieldType !== "checkbox" && /* @__PURE__ */ import_react23.default.createElement(import_ui20.Label, { htmlFor: inputId, className: "text-xs font-semibold text-foreground" }, field.label || field.key, field.required && /* @__PURE__ */ import_react23.default.createElement("span", { className: "text-rose-500 ml-0.5" }, "*")), fieldType === "select" ? /* @__PURE__ */ import_react23.default.createElement(
            import_ui20.Select,
            {
              value: String(formData[field.key] ?? ""),
              onValueChange: (val) => handleFieldChange(field.key, val)
            },
            /* @__PURE__ */ import_react23.default.createElement(import_ui20.SelectTrigger, { id: inputId, className: "w-full text-xs" }, /* @__PURE__ */ import_react23.default.createElement(import_ui20.SelectValue, { placeholder: field.placeholder || "Select option..." })),
            /* @__PURE__ */ import_react23.default.createElement(import_ui20.SelectContent, null, (field.options || []).map((opt, oIdx) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const lbl = typeof opt === "object" ? opt.label : opt;
              return /* @__PURE__ */ import_react23.default.createElement(import_ui20.SelectItem, { key: oIdx, value: String(val) }, lbl);
            }))
          ) : fieldType === "checkbox" ? /* @__PURE__ */ import_react23.default.createElement("div", { className: "flex items-center gap-2 py-1" }, /* @__PURE__ */ import_react23.default.createElement(
            import_ui20.Checkbox,
            {
              id: inputId,
              checked: !!formData[field.key],
              onCheckedChange: (checked) => handleFieldChange(field.key, !!checked)
            }
          ), /* @__PURE__ */ import_react23.default.createElement(import_ui20.Label, { htmlFor: inputId, className: "text-xs text-muted-foreground cursor-pointer" }, field.label || field.key, field.required && /* @__PURE__ */ import_react23.default.createElement("span", { className: "text-rose-500 ml-0.5" }, "*"))) : /* @__PURE__ */ import_react23.default.createElement(
            import_ui20.Input,
            {
              id: inputId,
              type: fieldType,
              className: "text-xs h-8 bg-background border border-input focus:border-primary w-full",
              placeholder: field.placeholder || "",
              required: field.required,
              value: formData[field.key] ?? "",
              onChange: (e) => handleFieldChange(field.key, e.target.value)
            }
          ));
        })),
        /* @__PURE__ */ import_react23.default.createElement("div", { className: "flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-4" }, showReset && /* @__PURE__ */ import_react23.default.createElement(
          import_ui20.Button,
          {
            type: "button",
            variant: "outline",
            className: "h-8 text-xs font-semibold px-4",
            onClick: handleReset
          },
          "Reset"
        ), /* @__PURE__ */ import_react23.default.createElement(
          import_ui20.Button,
          {
            type: "submit",
            className: "h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
          },
          submitLabel
        ))
      );
    };
    FormWidget.propTypes = {
      widgetConfig: import_prop_types22.default.object,
      fireWidgetEvent: import_prop_types22.default.func
    };
  }
});

// src/form/index.js
var form_exports = {};
__export(form_exports, {
  FormWidget: () => FormWidget
});
var init_form = __esm({
  "src/form/index.js"() {
    init_formWidget();
  }
});

// src/image/imageWidget.jsx
var import_react24, import_prop_types23, import_lucide_react11, ImageWidget;
var init_imageWidget = __esm({
  "src/image/imageWidget.jsx"() {
    import_react24 = __toESM(require("react"));
    import_prop_types23 = __toESM(require("prop-types"));
    import_lucide_react11 = require("lucide-react");
    ImageWidget = ({
      widgetConfig,
      fireWidgetEvent
    }) => {
      const src = widgetConfig?.src || "";
      const alt = widgetConfig?.alt || "Image content";
      const objectFit = widgetConfig?.objectFit || "cover";
      const borderRadius = widgetConfig?.borderRadius || "none";
      const handleImageClick = (e) => {
        if (fireWidgetEvent) {
          fireWidgetEvent("onClick", { event: e });
        }
      };
      if (!src) {
        return /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5" }, /* @__PURE__ */ import_react24.default.createElement(import_lucide_react11.Image, { className: "h-5 w-5 opacity-60" }), /* @__PURE__ */ import_react24.default.createElement("span", null, "No image URL configured"));
      }
      const radiusClass = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full"
      }[borderRadius] || "rounded-none";
      return /* @__PURE__ */ import_react24.default.createElement("div", { className: "w-full h-full relative overflow-hidden flex items-center justify-center p-1 bg-transparent" }, /* @__PURE__ */ import_react24.default.createElement(
        "img",
        {
          src,
          alt,
          className: `w-full h-full select-none cursor-pointer transition-all duration-200 hover:opacity-95 ${radiusClass}`,
          style: { objectFit },
          onClick: handleImageClick
        }
      ));
    };
    ImageWidget.propTypes = {
      widgetConfig: import_prop_types23.default.object,
      fireWidgetEvent: import_prop_types23.default.func
    };
  }
});

// src/image/index.js
var image_exports = {};
__export(image_exports, {
  ImageWidget: () => ImageWidget
});
var init_image = __esm({
  "src/image/index.js"() {
    init_imageWidget();
  }
});

// src/iframe/iframeWidget.jsx
var import_react25, import_prop_types24, import_lucide_react12, IframeWidget;
var init_iframeWidget = __esm({
  "src/iframe/iframeWidget.jsx"() {
    import_react25 = __toESM(require("react"));
    import_prop_types24 = __toESM(require("prop-types"));
    import_lucide_react12 = require("lucide-react");
    IframeWidget = ({
      widgetConfig
    }) => {
      const url = widgetConfig?.url || "";
      const allowSameOrigin = widgetConfig?.allowSameOrigin ?? false;
      const allowScripts = widgetConfig?.allowScripts ?? true;
      const allowForms = widgetConfig?.allowForms ?? true;
      const allowPopups = widgetConfig?.allowPopups ?? false;
      if (!url) {
        return /* @__PURE__ */ import_react25.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5" }, /* @__PURE__ */ import_react25.default.createElement(import_lucide_react12.Globe, { className: "h-5 w-5 opacity-60" }), /* @__PURE__ */ import_react25.default.createElement("span", null, "No iframe URL configured"));
      }
      const sandboxTokens = [];
      if (allowSameOrigin) sandboxTokens.push("allow-same-origin");
      if (allowScripts) sandboxTokens.push("allow-scripts");
      if (allowForms) sandboxTokens.push("allow-forms");
      if (allowPopups) sandboxTokens.push("allow-popups");
      const sandboxValue = sandboxTokens.join(" ");
      return /* @__PURE__ */ import_react25.default.createElement("div", { className: "w-full h-full p-0 bg-background overflow-hidden relative" }, /* @__PURE__ */ import_react25.default.createElement(
        "iframe",
        {
          src: url,
          className: "w-full h-full border-0 bg-white",
          sandbox: sandboxValue || void 0,
          referrerPolicy: "no-referrer-when-downgrade",
          title: "Embedded Content"
        }
      ));
    };
    IframeWidget.propTypes = {
      widgetConfig: import_prop_types24.default.object
    };
  }
});

// src/iframe/index.js
var iframe_exports = {};
__export(iframe_exports, {
  IframeWidget: () => IframeWidget
});
var init_iframe = __esm({
  "src/iframe/index.js"() {
    init_iframeWidget();
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  AlertConfigEditor: () => AlertConfigEditor,
  AlertWidget: () => AlertWidget,
  FormConfigEditor: () => FormConfigEditor,
  FormWidget: () => FormWidget,
  IframeConfigEditor: () => IframeConfigEditor,
  IframeWidget: () => IframeWidget,
  ImageConfigEditor: () => ImageConfigEditor,
  ImageWidget: () => ImageWidget,
  StatConfigEditor: () => StatConfigEditor,
  StatWidget: () => StatWidget,
  TableConfigEditor: () => TableConfigEditor,
  TableWidget: () => TableWidget,
  TextConfigEditor: () => TextConfigEditor,
  TextWidget: () => TextWidget,
  VegaConfigEditor: () => VegaConfigEditor,
  VegaWidget: () => VegaWidget,
  WIDGETS_MAP: () => WIDGETS_MAP,
  getDemoData: () => getDemoData,
  registerWidgets: () => registerWidgets
});
module.exports = __toCommonJS(index_exports);
init_vega();

// src/vega/vegaConfigEditor.jsx
var import_react9 = __toESM(require("react"));
var import_prop_types8 = __toESM(require("prop-types"));

// src/vega/chartSpecParser.js
var MARK_TO_CHART_TYPE = {
  bar: "bar",
  line: "line",
  area: "area",
  arc: "pie",
  // refined by innerRadius check
  point: "scatter",
  rect: "heatmap",
  boxplot: "boxplot",
  tick: "tick"
};
var parseVegaLiteSpec = (spec) => {
  const warnings = [];
  if (!spec || !spec.$schema) {
    return {
      success: false,
      config: null,
      warnings: ["Not a valid Vega-Lite spec (missing $schema)"]
    };
  }
  if (spec.$schema.includes("/vega/") && !spec.$schema.includes("/vega-lite/")) {
    return {
      success: false,
      config: null,
      warnings: ["This is a full Vega spec, not Vega-Lite. Visual builder only supports Vega-Lite."]
    };
  }
  try {
    const config = {};
    const markResult = parseMark(spec.mark);
    config.chartType = markResult.chartType;
    if (markResult.warning) warnings.push(markResult.warning);
    config.data = parseData(spec.data);
    config.encoding = parseEncoding(spec.encoding, config.chartType);
    config.style = parseStyle(spec);
    if (spec.transform) warnings.push("Transforms detected \u2014 these are not editable in visual mode");
    if (spec.layer) warnings.push("Layer composition detected \u2014 not supported in visual mode");
    if (spec.concat || spec.hconcat || spec.vconcat) warnings.push("Multi-view composition \u2014 not supported in visual mode");
    if (spec.selection || spec.params) warnings.push("Interactive selections \u2014 preserved but not editable in visual mode");
    if (spec.repeat) warnings.push("Repeat encoding \u2014 not supported in visual mode");
    return {
      success: true,
      config,
      warnings
    };
  } catch (err) {
    return {
      success: false,
      config: null,
      warnings: [`Parse error: ${err.message}`]
    };
  }
};
var parseMark = (mark) => {
  if (!mark) {
    return { chartType: "bar", warning: "No mark found, defaulting to bar" };
  }
  const markType = typeof mark === "string" ? mark : mark.type;
  let chartType = MARK_TO_CHART_TYPE[markType] || "bar";
  if (markType === "arc" && typeof mark === "object" && mark.innerRadius > 0) {
    chartType = "donut";
  }
  if (!MARK_TO_CHART_TYPE[markType]) {
    return { chartType, warning: `Unknown mark type "${markType}", defaulting to bar` };
  }
  return { chartType };
};
var parseData = (data) => {
  if (!data) {
    return { source: "", inlineValues: null };
  }
  if (data.values) {
    if (typeof data.values === "string") {
      return { source: data.values, inlineValues: null };
    }
    if (Array.isArray(data.values)) {
      return { source: "", inlineValues: data.values };
    }
  }
  if (data.url) {
    return { source: data.url, inlineValues: null };
  }
  return { source: "", inlineValues: null };
};
var parseEncoding = (encoding, chartType) => {
  if (!encoding) {
    return { x: null, y: null, color: null, size: null, tooltip: [] };
  }
  const result = {
    x: null,
    y: null,
    color: null,
    size: null,
    tooltip: []
  };
  if (chartType === "pie" || chartType === "donut") {
    if (encoding.theta) {
      result.y = parseChannel(encoding.theta);
    }
    if (encoding.color) {
      result.x = parseChannel(encoding.color);
    }
  } else {
    if (encoding.x) {
      result.x = parseChannel(encoding.x);
    }
    if (encoding.y) {
      result.y = parseChannel(encoding.y);
    }
    if (encoding.color) {
      result.color = parseChannel(encoding.color);
    }
  }
  if (encoding.size) {
    result.size = parseChannel(encoding.size);
  }
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      result.tooltip = encoding.tooltip.map((t) => ({
        field: t.field,
        type: t.type,
        title: t.title
      }));
    } else if (encoding.tooltip.field) {
      result.tooltip = [{ field: encoding.tooltip.field, type: encoding.tooltip.type }];
    }
  }
  return result;
};
var parseChannel = (channel) => {
  if (!channel) return null;
  return {
    field: channel.field || "",
    type: channel.type || "nominal",
    title: channel.title || "",
    aggregate: channel.aggregate || "none",
    sort: channel.sort || null,
    bin: channel.bin || null,
    timeUnit: channel.timeUnit || null
  };
};
var parseStyle = (spec) => {
  const style = {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  };
  if (spec.title) {
    if (typeof spec.title === "string") {
      style.title = spec.title;
    } else if (spec.title.text) {
      style.title = spec.title.text;
    }
  }
  if (spec.width) style.width = spec.width;
  if (spec.height) style.height = spec.height;
  if (spec.encoding) {
    const colorScale = spec.encoding.color?.scale;
    if (colorScale?.scheme) {
      style.colorScheme = colorScale.scheme;
    }
  }
  return style;
};

// src/vega/vegaConfigEditor.jsx
var import_ui8 = require("@jet-admin/ui");

// src/vega/vegaSpecEditor.jsx
var import_react3 = __toESM(require("react"));
var import_prop_types2 = __toESM(require("prop-types"));

// src/vega/variableExplorer.jsx
var import_react2 = __toESM(require("react"));
var import_prop_types = __toESM(require("prop-types"));
var import_ui = require("@jet-admin/ui");
var import_lucide_react = require("lucide-react");
var getCategoryIcon = (category) => {
  switch (category) {
    case "input":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ArrowRightToLine, { className: "w-3.5 h-3.5 text-emerald-500" });
    case "nodeOutput":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.GitMerge, { className: "w-3.5 h-3.5 text-primary" });
    case "workflowOutput":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ArrowRightFromLine, { className: "w-3.5 h-3.5 text-purple-500" });
    default:
      return null;
  }
};
var VariableItem = ({ variable, onSelect, isSelected }) => {
  const [copied, setCopied] = (0, import_react2.useState)(false);
  const handleCopy = (0, import_react2.useCallback)((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [variable.path]);
  const handleClick = (0, import_react2.useCallback)(() => {
    if (onSelect) onSelect(variable.path, variable);
  }, [onSelect, variable]);
  return /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      onClick: handleClick,
      className: `
        flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-sm text-xs group
        transition-colors
        ${isSelected ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted text-foreground"}
      `
    },
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium truncate flex-1" }, variable.name),
    variable.nodeTitle && /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[10px] truncate max-w-[80px] text-muted-foreground" }, variable.nodeTitle),
    /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        onClick: handleCopy,
        variant: "ghost",
        size: "icon",
        className: "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
        title: "Copy path",
        type: "button"
      },
      copied ? /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Check, { className: "w-3 h-3 text-emerald-500" }) : /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Copy, { className: "w-3 h-3 text-muted-foreground" })
    )
  );
};
VariableItem.propTypes = {
  variable: import_prop_types.default.shape({
    path: import_prop_types.default.string.isRequired,
    name: import_prop_types.default.string.isRequired,
    type: import_prop_types.default.string,
    description: import_prop_types.default.string
  }).isRequired,
  onSelect: import_prop_types.default.func,
  isSelected: import_prop_types.default.bool
};
var VariableCategory = ({
  category,
  title,
  variables,
  onSelect,
  selectedPath,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = (0, import_react2.useState)(defaultExpanded);
  if (!variables || variables.length === 0) return null;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mb-1" }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      onClick: () => setIsExpanded(!isExpanded),
      className: "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm cursor-pointer bg-muted/50 border border-border hover:bg-muted transition-colors"
    },
    isExpanded ? /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ChevronDown, { className: "w-3 h-3 text-muted-foreground" }) : /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
    getCategoryIcon(category),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[11px] font-medium uppercase tracking-wide flex-1 text-muted-foreground" }, title),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded-sm bg-brand-dark border border-border text-muted-foreground" }, variables.length)
  ), isExpanded && /* @__PURE__ */ import_react2.default.createElement("div", { className: "ml-3 mt-1 pl-2 border-l border-border" }, variables.map((variable) => /* @__PURE__ */ import_react2.default.createElement(
    VariableItem,
    {
      key: variable.path,
      variable,
      onSelect,
      isSelected: selectedPath === variable.path
    }
  ))));
};
VariableCategory.propTypes = {
  category: import_prop_types.default.string.isRequired,
  title: import_prop_types.default.string.isRequired,
  variables: import_prop_types.default.array.isRequired,
  onSelect: import_prop_types.default.func,
  selectedPath: import_prop_types.default.string,
  defaultExpanded: import_prop_types.default.bool
};
var extractWorkflowSchema = (workflow) => {
  if (!workflow) return { inputs: [], nodeOutputs: [], workflowOutputs: [] };
  const schema = { inputs: [], nodeOutputs: [], workflowOutputs: [] };
  const args = workflow.workflowOptions?.args || workflow.inputs || [];
  schema.inputs = args.map((arg) => ({
    path: `{{ctx.input.${arg.name}}}`,
    name: arg.name,
    type: arg.type || "string",
    description: arg.description || `Workflow input parameter: ${arg.name}`,
    category: "input",
    required: arg.required || false,
    defaultValue: arg.defaultValue
  }));
  const nodes = workflow.nodes || [];
  for (const node of nodes) {
    const hasOutput = node.hasOutput !== void 0 ? node.hasOutput : node.outputVariable && node.type !== "start" && node.type !== "end";
    if (hasOutput) {
      const outputVar = node.outputVariable || node.data?.outputVariable;
      const nodeTitle = node.title || node.data?.title || node.type;
      schema.nodeOutputs.push({
        path: `{{ctx.${outputVar}}}`,
        name: outputVar,
        type: getNodeOutputType(node.type),
        description: `Output from ${nodeTitle} node`,
        category: "nodeOutput",
        nodeType: node.type,
        nodeTitle,
        nodeID: node.id
      });
    }
  }
  const outputs = workflow.outputs || [];
  const endNode = nodes.find((n) => n.isEnd || n.type === "end");
  const endOutputs = outputs.length > 0 ? outputs : endNode?.data?.outputs || [];
  for (const output of endOutputs) {
    if (output.name) {
      schema.workflowOutputs.push({
        path: `{{ctx.output.${output.name}}}`,
        name: output.name,
        type: output.type || "any",
        description: `Workflow output: ${output.name}`,
        category: "workflowOutput",
        sourceVariable: output.value
      });
    }
  }
  if (schema.workflowOutputs.length === 0 && schema.nodeOutputs.length > 0) {
    schema.workflowOutputs.push({
      path: `{{ctx.output}}`,
      name: "output",
      type: "any",
      description: "Final workflow output (from end node)",
      category: "workflowOutput"
    });
  }
  return schema;
};
var getNodeOutputType = (nodeType) => {
  switch (nodeType) {
    case "dataQuery":
      return "object";
    case "javascript":
      return "any";
    case "condition":
      return "boolean";
    case "restapi":
      return "object";
    case "loop":
      return "array";
    default:
      return "any";
  }
};
var VariableExplorer = ({
  workflow,
  context,
  onSelect,
  selectedPath = null,
  title = "Workflow Variables",
  showSearch = true,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = (0, import_react2.useState)("");
  const schema = (0, import_react2.useMemo)(() => extractWorkflowSchema(workflow), [workflow]);
  const allVariables = (0, import_react2.useMemo)(() => ({
    inputs: [...schema.inputs],
    nodeOutputs: [...schema.nodeOutputs],
    workflowOutputs: [...schema.workflowOutputs]
  }), [schema]);
  const filteredVariables = (0, import_react2.useMemo)(() => {
    if (!searchQuery) return allVariables;
    const q = searchQuery.toLowerCase();
    return {
      inputs: allVariables.inputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)),
      nodeOutputs: allVariables.nodeOutputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.nodeTitle?.toLowerCase().includes(q)),
      workflowOutputs: allVariables.workflowOutputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
    };
  }, [allVariables, searchQuery]);
  const hasVariables = schema.inputs.length > 0 || schema.nodeOutputs.length > 0 || schema.workflowOutputs.length > 0;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: `flex flex-col rounded-md border border-border bg-brand-dark ${className}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 rounded-t-lg border-b border-border bg-muted/50" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "text-xs font-medium text-muted-foreground" }, title)), showSearch && hasVariables && /* @__PURE__ */ import_react2.default.createElement("div", { className: "px-2 py-2 border-b border-border" }, /* @__PURE__ */ import_react2.default.createElement(
    import_ui.Input,
    {
      type: "text",
      placeholder: "Search variables...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full text-xs"
    }
  )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 overflow-auto max-h-64 py-2 px-1" }, !hasVariables ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "text-center py-4 text-xs text-muted-foreground" }, /* @__PURE__ */ import_react2.default.createElement("p", null, "No variables defined"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mt-1 text-[10px]" }, "Add workflow inputs or nodes with output variables")) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
    VariableCategory,
    {
      category: "input",
      title: "Workflow Inputs",
      variables: filteredVariables.inputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
    VariableCategory,
    {
      category: "nodeOutput",
      title: "Node Outputs",
      variables: filteredVariables.nodeOutputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
    VariableCategory,
    {
      category: "workflowOutput",
      title: "Workflow Outputs",
      variables: filteredVariables.workflowOutputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ))));
};
VariableExplorer.propTypes = {
  workflow: import_prop_types.default.object,
  context: import_prop_types.default.object,
  onSelect: import_prop_types.default.func,
  selectedPath: import_prop_types.default.string,
  title: import_prop_types.default.string,
  showSearch: import_prop_types.default.bool,
  className: import_prop_types.default.string
};

// src/vega/vegaSpecEditor.jsx
var import_ui2 = require("@jet-admin/ui");
var import_lucide_react2 = require("lucide-react");
var VEGA_TEMPLATES = {
  empty: {
    name: "Empty",
    icon: import_lucide_react2.Code,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Custom visualization",
      data: { values: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }] },
      mark: "point",
      encoding: {
        x: { field: "x", type: "quantitative" },
        y: { field: "y", type: "quantitative" }
      }
    }
  },
  bar: {
    name: "Bar",
    icon: import_lucide_react2.BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Electronics", value: 450 },
          { category: "Clothing", value: 320 },
          { category: "Food", value: 280 },
          { category: "Books", value: 190 },
          { category: "Sports", value: 230 }
        ]
      },
      mark: "bar",
      encoding: {
        x: { field: "category", type: "nominal", axis: { labelAngle: -45 } },
        y: { field: "value", type: "quantitative", title: "Sales" },
        color: { field: "category", type: "nominal", legend: null }
      }
    }
  },
  line: {
    name: "Line",
    icon: import_lucide_react2.LineChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { date: "2024-01-01", value: 100 },
          { date: "2024-02-01", value: 150 },
          { date: "2024-03-01", value: 120 },
          { date: "2024-04-01", value: 200 },
          { date: "2024-05-01", value: 180 },
          { date: "2024-06-01", value: 250 }
        ]
      },
      mark: { type: "line", point: true },
      encoding: {
        x: { field: "date", type: "temporal", title: "Date" },
        y: { field: "value", type: "quantitative", title: "Value" }
      }
    }
  },
  pie: {
    name: "Pie",
    icon: import_lucide_react2.PieChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Desktop", value: 45 },
          { category: "Mobile", value: 35 },
          { category: "Tablet", value: 15 },
          { category: "Other", value: 5 }
        ]
      },
      mark: { type: "arc", innerRadius: 50 },
      encoding: {
        theta: { field: "value", type: "quantitative" },
        color: { field: "category", type: "nominal", title: "Device" }
      }
    }
  },
  scatter: {
    name: "Scatter",
    icon: import_lucide_react2.ScatterChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { x: 10, y: 28, size: 5, category: "A" },
          { x: 25, y: 55, size: 8, category: "B" },
          { x: 40, y: 43, size: 12, category: "A" },
          { x: 55, y: 91, size: 6, category: "C" },
          { x: 70, y: 81, size: 10, category: "B" },
          { x: 85, y: 53, size: 15, category: "C" }
        ]
      },
      mark: "circle",
      encoding: {
        x: { field: "x", type: "quantitative", title: "X Axis" },
        y: { field: "y", type: "quantitative", title: "Y Axis" },
        size: { field: "size", type: "quantitative" },
        color: { field: "category", type: "nominal" }
      }
    }
  },
  heatmap: {
    name: "Heatmap",
    icon: import_lucide_react2.BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { row: "Mon", column: "Morning", value: 10 },
          { row: "Mon", column: "Afternoon", value: 25 },
          { row: "Mon", column: "Evening", value: 15 },
          { row: "Tue", column: "Morning", value: 20 },
          { row: "Tue", column: "Afternoon", value: 30 },
          { row: "Tue", column: "Evening", value: 22 },
          { row: "Wed", column: "Morning", value: 15 },
          { row: "Wed", column: "Afternoon", value: 28 },
          { row: "Wed", column: "Evening", value: 18 }
        ]
      },
      mark: "rect",
      encoding: {
        x: { field: "column", type: "ordinal", title: "Time" },
        y: { field: "row", type: "ordinal", title: "Day" },
        color: {
          field: "value",
          type: "quantitative",
          scale: { scheme: "blues" },
          title: "Activity"
        }
      }
    }
  }
};
var getNestedKeys = (obj, prefix = "", maxDepth = 4, depth = 0) => {
  if (!obj || typeof obj !== "object" || depth >= maxDepth) return [];
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const full = prefix ? `${prefix}.${key}` : key;
    keys.push(full);
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(
        ...Array.isArray(obj[key]) && obj[key].length > 0 ? getNestedKeys(obj[key][0], `${full}[0]`, maxDepth, depth + 1) : getNestedKeys(obj[key], full, maxDepth, depth + 1)
      );
    }
  }
  return keys;
};
var getValueByPath = (obj, path) => {
  if (!obj || !path) return void 0;
  let cur = obj;
  for (const part of path.split(".")) {
    const m = part.match(/^(.+)\[(\d+)\]$/);
    cur = m ? cur?.[m[1]]?.[parseInt(m[2])] : cur?.[part];
    if (cur === void 0) break;
  }
  return cur;
};
var getValuePreview = (obj, path) => {
  const v = getValueByPath(obj, path);
  if (v === void 0) return "undefined";
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") {
    const k = Object.keys(v).slice(0, 3);
    return `{${k.join(", ")}${Object.keys(v).length > 3 ? "\u2026" : ""}}`;
  }
  if (typeof v === "string") return `"${v.slice(0, 30)}${v.length > 30 ? "\u2026" : ""}"`;
  return String(v);
};
var S = {
  // header bar
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)",
    borderRadius: "6px 6px 0 0",
    flexWrap: "wrap",
    minHeight: 34
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    minWidth: 0
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0
  },
  // tiny pill badges
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "1px 6px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    color: color === "green" ? "#15803d" : color === "red" ? "#dc2626" : "var(--we-text-accent)",
    background: color === "green" ? "#f0fdf4" : color === "red" ? "#fef2f2" : "var(--we-bg-accent-light)",
    border: `1px solid ${color === "green" ? "#bbf7d0" : color === "red" ? "#fecaca" : "var(--we-border-accent)"}`
  }),
  // compressed icon button
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    padding: 0,
    border: "1px solid #d1d5db",
    borderRadius: 5,
    background: "#fff",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: 11,
    transition: "all 0.12s",
    flexShrink: 0
  },
  // compressed text button
  textBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "0 8px",
    border: "1px solid transparent",
    borderRadius: 4,
    background: "transparent",
    color: "hsl(var(--muted-foreground))",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    transition: "all 0.12s",
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  // template grid
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 4,
    padding: "6px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)"
  },
  templateBtn: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "5px 4px",
    border: `1px solid ${active ? "var(--we-bg-accent, #6366f1)" : "#e2e4e9"}`,
    borderRadius: 6,
    background: active ? "var(--we-bg-accent-light, #eef2ff)" : "#fff",
    color: active ? "var(--we-text-accent, #4f46e5)" : "#6b7280",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 500,
    transition: "all 0.12s",
    lineHeight: 1.2
  }),
  // error strip
  errorStrip: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    padding: "5px 8px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    fontSize: 11,
    color: "#dc2626",
    borderRadius: "0 0 6px 6px"
  },
  // ctx hint
  ctxHint: {
    position: "absolute",
    bottom: 6,
    right: 8,
    padding: "2px 7px",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(4px)",
    border: "1px solid #e5e7eb",
    borderRadius: 5,
    fontSize: 10,
    color: "#9ca3af",
    pointerEvents: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    zIndex: 10
  }
};
var VegaSpecEditor = ({
  value,
  onChange,
  onError,
  workflowContext = null,
  workflow = null,
  disabled = false
}) => {
  const [showTemplates, setShowTemplates] = (0, import_react3.useState)(false);
  const [parseError, setParseError] = (0, import_react3.useState)(null);
  const monacoRef = (0, import_react3.useRef)(null);
  const valueRef = (0, import_react3.useRef)(value);
  const isInternalChange = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    valueRef.current = value;
  }, [value]);
  const toJson = (v) => {
    if (!v) return "";
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return "";
    }
  };
  const valueString = (0, import_react3.useMemo)(() => toJson(value), [value]);
  const handleEditorChange = (0, import_react3.useCallback)((newValue) => {
    isInternalChange.current = true;
    if (!newValue?.trim()) {
      setParseError(null);
      onChange(null);
      isInternalChange.current = false;
      return;
    }
    try {
      const parsed = JSON.parse(newValue);
      setParseError(null);
      onChange(parsed);
    } catch (err) {
      setParseError(err.message);
      if (onError) onError(err);
    }
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onChange, onError]);
  (0, import_react3.useEffect)(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;
    const schema = workflow ? extractWorkflowSchema(workflow) : null;
    const disposable = monaco.languages.registerCompletionItemProvider("json", {
      triggerCharacters: [".", "{"],
      provideCompletionItems: (model, position) => {
        const lineText = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [];
        const bracketMatch = lineText.match(/\{\{([a-zA-Z0-9_]*)$/);
        if (bracketMatch) {
          const partial = bracketMatch[1].toLowerCase();
          if ("ctx".startsWith(partial)) {
            suggestions.push({
              label: "ctx",
              kind: monaco.languages.CompletionItemKind.Module,
              detail: "Workflow Context (Runtime)",
              insertText: "ctx.",
              range
            });
          }
          if ("queries".startsWith(partial)) {
            suggestions.push({
              label: "queries",
              kind: monaco.languages.CompletionItemKind.Module,
              detail: "Page Queries",
              insertText: "queries.",
              range
            });
          }
          if ("workflows".startsWith(partial)) {
            suggestions.push({
              label: "workflows",
              kind: monaco.languages.CompletionItemKind.Module,
              detail: "Page Workflows",
              insertText: "workflows.",
              range
            });
          }
          if (schema) {
            const add = (items, kind, pfx) => items.forEach((item) => {
              const p = item.path.replace(/\{\{|\}\}/g, "");
              if (p.toLowerCase().includes(partial))
                suggestions.push({
                  label: item.name,
                  kind,
                  detail: `${pfx}: ${item.type}${item.nodeTitle ? ` (${item.nodeTitle})` : ""}`,
                  insertText: p,
                  range
                });
            });
            add(schema.inputs, monaco.languages.CompletionItemKind.Property, "Input");
            add(schema.nodeOutputs, monaco.languages.CompletionItemKind.Variable, "Node Output");
            add(schema.workflowOutputs, monaco.languages.CompletionItemKind.Event, "Workflow Output");
          }
        }
        if (workflowContext) {
          const ctxMatch = lineText.match(/\{\{ctx\.([a-zA-Z0-9_\[\].]*)$/);
          if (ctxMatch) {
            const partial = ctxMatch[1];
            getNestedKeys(workflowContext, "", 4).filter((k) => k.toLowerCase().includes(partial.toLowerCase())).forEach(
              (k) => suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: getValuePreview(workflowContext, k),
                insertText: k,
                range,
                documentation: `Value: ${getValuePreview(workflowContext, k)}`
              })
            );
          }
          const queriesMatch = lineText.match(/\{\{queries\.([a-zA-Z0-9_\[\].]*)$/);
          if (queriesMatch && workflowContext.queries) {
            const partial = queriesMatch[1];
            getNestedKeys(workflowContext.queries, "", 4).filter((k) => k.toLowerCase().includes(partial.toLowerCase())).forEach(
              (k) => suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: getValuePreview(workflowContext.queries, k),
                insertText: k,
                range,
                documentation: `Value: ${getValuePreview(workflowContext.queries, k)}`
              })
            );
          }
          const workflowsMatch = lineText.match(/\{\{workflows\.([a-zA-Z0-9_\[\].]*)$/);
          if (workflowsMatch && workflowContext.workflows) {
            const partial = workflowsMatch[1];
            getNestedKeys(workflowContext.workflows, "", 4).filter((k) => k.toLowerCase().includes(partial.toLowerCase())).forEach(
              (k) => suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: getValuePreview(workflowContext.workflows, k),
                insertText: k,
                range,
                documentation: `Value: ${getValuePreview(workflowContext.workflows, k)}`
              })
            );
          }
        }
        return { suggestions };
      }
    });
    return () => disposable.dispose();
  }, [workflowContext, workflow]);
  const applyTemplate = (0, import_react3.useCallback)((key) => {
    const t = VEGA_TEMPLATES[key];
    if (t) {
      onChange(t.spec);
      setParseError(null);
    }
  }, [onChange]);
  const contextVarCount = workflowContext ? Object.keys(workflowContext).length : 0;
  const hasError = Boolean(parseError);
  const headerExtra = /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      style: {
        ...S.textBtn,
        ...showTemplates ? { background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" } : {}
      },
      className: "hover:bg-muted hover:text-foreground",
      onClick: () => setShowTemplates((v) => !v)
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.BarChart, { size: 9 }),
    "Templates"
  );
  const headerLeft = contextVarCount > 0 ? /* @__PURE__ */ import_react3.default.createElement("span", { style: S.badge("accent") }, contextVarCount, " ctx vars") : null;
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col" }, showTemplates && /* @__PURE__ */ import_react3.default.createElement("div", { style: S.templateGrid, className: "border border-b-0 rounded-t-md" }, Object.entries(VEGA_TEMPLATES).map(([key, tpl]) => {
    const Icon = tpl.icon;
    return /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        key,
        type: "button",
        style: S.templateBtn(false),
        onClick: () => {
          applyTemplate(key);
          setShowTemplates(false);
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "var(--we-bg-accent, #6366f1)";
          e.currentTarget.style.background = "var(--we-bg-accent-light, #eef2ff)";
          e.currentTarget.style.color = "var(--we-text-accent, #4f46e5)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = "#e2e4e9";
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#6b7280";
        }
      },
      /* @__PURE__ */ import_react3.default.createElement(Icon, { size: 14 }),
      tpl.name
    );
  })), /* @__PURE__ */ import_react3.default.createElement(
    import_ui2.CodeEditor,
    {
      value: valueString,
      onChange: handleEditorChange,
      language: "json",
      disabled,
      title: "Vega-Lite",
      titleIcon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Code, { style: { color: "var(--we-bg-accent, #6366f1)", fontSize: 13 } }),
      status: hasError ? "error" : "valid",
      statusMessage: parseError ? `Parse error: ${parseError}` : null,
      headerLeft,
      headerExtra,
      className: showTemplates ? "rounded-t-none" : "",
      onMount: (e, m) => {
        monacoRef.current = m;
      },
      footerHint: workflowContext ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, "Type ", /* @__PURE__ */ import_react3.default.createElement("code", { className: "font-mono bg-muted px-1 rounded-sm" }, "{{"), " to autocomplete data sources or context") : null
    }
  ));
};
VegaSpecEditor.propTypes = {
  value: import_prop_types2.default.object,
  onChange: import_prop_types2.default.func.isRequired,
  onError: import_prop_types2.default.func,
  workflowContext: import_prop_types2.default.object,
  workflow: import_prop_types2.default.object,
  placeholder: import_prop_types2.default.string,
  disabled: import_prop_types2.default.bool,
  theme: import_prop_types2.default.oneOf(["light", "dark"])
};

// src/vega/shelfBuilder.jsx
var import_react8 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));

// src/vega/dataFieldPanel.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types4 = __toESM(require("prop-types"));

// src/vega/fieldPill.jsx
var import_react4 = __toESM(require("react"));
var import_prop_types3 = __toESM(require("prop-types"));

// src/vega/chartSpecGenerator.js
var MARK_TYPES = {
  bar: { type: "bar", tooltip: true },
  line: { type: "line", tooltip: true, point: true },
  area: { type: "area", tooltip: true, line: true, opacity: 0.7 },
  point: { type: "point", tooltip: true, filled: true, opacity: 0.7 },
  circle: { type: "circle", tooltip: true, opacity: 0.7 },
  square: { type: "square", tooltip: true },
  arc: { type: "arc", tooltip: true },
  rect: { type: "rect", tooltip: true },
  tick: { type: "tick", tooltip: true },
  text: { type: "text" }
};
var MARK_ALIASES = {
  scatter: "point",
  pie: "arc",
  donut: "arc",
  heatmap: "rect",
  histogram: "bar"
};
var POSITIONAL_CHANNELS = ["x", "y", "row", "column"];
var RETINAL_CHANNELS = ["color", "size", "shape", "opacity", "strokeDash", "detail"];
var TEXT_CHANNELS = ["text", "tooltip"];
var ALL_CHANNELS = [...POSITIONAL_CHANNELS, ...RETINAL_CHANNELS, ...TEXT_CHANNELS];
var FIELD_TYPES = ["nominal", "ordinal", "quantitative", "temporal"];
var AGGREGATE_TYPES = [
  "count",
  "sum",
  "mean",
  "median",
  "min",
  "max",
  "variance",
  "stdev",
  "distinct",
  "valid",
  "missing"
];
var COLOR_SCHEMES = [
  "tableau10",
  "category10",
  "category20",
  "accent",
  "dark2",
  "paired",
  "set1",
  "set2",
  "set3",
  "pastel1",
  "pastel2",
  "blues",
  "greens",
  "oranges",
  "reds",
  "purples",
  "greys",
  "viridis",
  "magma",
  "inferno",
  "plasma",
  "spectral"
];
var inferMarkType = (encoding) => {
  const xType = encoding?.x?.type;
  const yType = encoding?.y?.type;
  const hasX = !!encoding?.x?.field;
  const hasY = !!encoding?.y?.field;
  const hasColor = !!encoding?.color?.field;
  const hasSize = !!encoding?.size?.field;
  if (!hasX && !hasY) return "bar";
  if (hasX && !hasY) {
    if (xType === "quantitative") return "bar";
    return "bar";
  }
  if (!hasX && hasY) {
    if (yType === "quantitative") return "bar";
    return "bar";
  }
  const isXCat = xType === "nominal" || xType === "ordinal";
  const isYCat = yType === "nominal" || yType === "ordinal";
  const isXQuant = xType === "quantitative";
  const isYQuant = yType === "quantitative";
  const isXTemp = xType === "temporal";
  const isYTemp = yType === "temporal";
  if (isXTemp && isYQuant || isYTemp && isXQuant) return "line";
  if (isXCat && isYQuant || isYCat && isXQuant) return "bar";
  if (isXQuant && isYQuant) return "point";
  if (isXCat && isYCat && hasColor) return "rect";
  return "bar";
};
var generateVegaLiteSpec = (shelfSpec) => {
  if (!shelfSpec) return getEmptySpec();
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json"
  };
  const encoding = shelfSpec.encoding || {};
  const config = shelfSpec.config || {};
  if (config.title) {
    spec.title = {
      text: config.title,
      anchor: "start",
      fontSize: 14,
      fontWeight: 600,
      offset: 12
    };
  }
  spec.width = config.width === "container" ? "container" : config.width || "container";
  spec.height = config.height || 300;
  spec.autosize = { type: "fit", contains: "padding" };
  spec.data = buildDataSection(shelfSpec.dataSource, shelfSpec.inlineValues);
  const resolvedMark = shelfSpec.mark === "auto" || !shelfSpec.mark ? inferMarkType(encoding) : MARK_ALIASES[shelfSpec.mark] || shelfSpec.mark;
  const markDef = MARK_TYPES[resolvedMark] || MARK_TYPES.bar;
  if (shelfSpec.mark === "donut") {
    spec.mark = { ...markDef, innerRadius: 50 };
  } else {
    spec.mark = { ...markDef };
  }
  spec.encoding = buildEncoding(encoding, resolvedMark, config);
  spec.config = buildThemeConfig(config);
  return spec;
};
var buildDataSection = (dataSource, inlineValues) => {
  if (inlineValues && Array.isArray(inlineValues) && inlineValues.length > 0) {
    return { values: inlineValues };
  }
  if (dataSource) {
    return { values: dataSource };
  }
  return { values: [] };
};
var buildEncoding = (encoding, markType, config) => {
  const enc = {};
  const isArc = markType === "arc";
  if (isArc) {
    if (encoding.y?.field) {
      enc.theta = buildChannel(encoding.y);
    }
    if (encoding.x?.field) {
      enc.color = buildChannel(encoding.x, config?.colorScheme);
    }
  } else {
    if (encoding.x?.field) enc.x = buildChannel(encoding.x);
    if (encoding.y?.field) enc.y = buildChannel(encoding.y);
  }
  if (encoding.row?.field) enc.row = buildChannel(encoding.row);
  if (encoding.column?.field) enc.column = buildChannel(encoding.column);
  if (!isArc && encoding.color?.field) enc.color = buildChannel(encoding.color, config?.colorScheme);
  if (encoding.size?.field) enc.size = buildChannel(encoding.size);
  if (encoding.shape?.field) enc.shape = buildChannel(encoding.shape);
  if (encoding.opacity?.field) enc.opacity = buildChannel(encoding.opacity);
  if (encoding.strokeDash?.field) enc.strokeDash = buildChannel(encoding.strokeDash);
  if (encoding.detail?.field) enc.detail = buildChannel(encoding.detail);
  if (encoding.text?.field) enc.text = buildChannel(encoding.text);
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      const tooltips = encoding.tooltip.filter((t) => t?.field);
      if (tooltips.length > 0) {
        enc.tooltip = tooltips.map((t) => ({
          field: t.field,
          ...t.type && { type: t.type },
          ...t.title && { title: t.title }
        }));
      }
    } else if (encoding.tooltip?.field) {
      enc.tooltip = { field: encoding.tooltip.field, type: encoding.tooltip.type };
    }
  }
  return enc;
};
var buildChannel = (channel, colorScheme) => {
  if (!channel || !channel.field) return void 0;
  const enc = {
    field: channel.field,
    type: channel.type || "nominal"
  };
  if (channel.title) enc.title = channel.title;
  if (channel.aggregate && channel.aggregate !== "none") enc.aggregate = channel.aggregate;
  if (channel.sort) enc.sort = channel.sort;
  if (channel.bin) enc.bin = channel.bin === true ? true : { maxbins: channel.bin };
  if (channel.timeUnit) enc.timeUnit = channel.timeUnit;
  if (channel.axis !== void 0) enc.axis = channel.axis;
  if (colorScheme) enc.scale = { scheme: colorScheme };
  return enc;
};
var buildThemeConfig = (config) => ({
  background: "transparent",
  view: { stroke: "transparent" },
  axis: {
    labelFontSize: 11,
    titleFontSize: 12,
    titlePadding: 8,
    grid: true,
    gridOpacity: 0.15
  },
  legend: {
    labelFontSize: 11,
    titleFontSize: 12
  }
});
var getEmptySpec = () => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "Drag fields onto encoding shelves to build a chart",
  data: { values: [] },
  mark: "bar",
  encoding: {},
  width: "container",
  height: 300
});
var getDefaultShelfSpec = () => ({
  mark: "auto",
  dataSource: "",
  inlineValues: null,
  encoding: {
    x: null,
    y: null,
    color: null,
    size: null,
    shape: null,
    row: null,
    column: null,
    detail: null,
    text: null,
    opacity: null,
    strokeDash: null,
    tooltip: []
  },
  config: {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  }
});
var inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  if (typeof sample !== "object" || sample === null) return [];
  return Object.keys(sample).map((key) => {
    const value = sample[key];
    const type = inferFieldType(value, key, data);
    return {
      name: key,
      type,
      icon: getFieldTypeIcon(type)
    };
  });
};
var inferFieldType = (value, key, data) => {
  if (value === null || value === void 0) {
    for (const row of data.slice(1, 10)) {
      if (row[key] !== null && row[key] !== void 0) {
        return inferFieldType(row[key], key, []);
      }
    }
    return "nominal";
  }
  if (typeof value === "number") return "quantitative";
  if (typeof value === "string") {
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || !isNaN(Date.parse(value))) {
      return "temporal";
    }
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return "quantitative";
    }
    return "nominal";
  }
  if (value instanceof Date) return "temporal";
  if (typeof value === "boolean") return "nominal";
  return "nominal";
};
var getFieldTypeIcon = (type) => {
  switch (type) {
    case "quantitative":
      return "#";
    case "temporal":
      return "T";
    case "ordinal":
      return "\u2195";
    case "nominal":
    default:
      return "Abc";
  }
};

// src/vega/fieldPill.jsx
var import_ui3 = require("@jet-admin/ui");
var getTypeClass = (type) => {
  switch (type) {
    case "quantitative":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "temporal":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ordinal":
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    case "nominal":
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};
var FieldPill = ({
  field,
  // { name, type, icon? }
  onRemove,
  // called when × is clicked (shelf mode)
  onClick,
  // called when pill is clicked
  isDragging = false,
  isCompact = false,
  className = ""
}) => {
  const icon = field.icon || getFieldTypeIcon(field.type);
  const typeClass = getTypeClass(field.type);
  const handleDragStart = (0, import_react4.useCallback)((e) => {
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  }, [field]);
  const handleDragEnd = (0, import_react4.useCallback)((e) => {
    e.currentTarget.style.opacity = "1";
  }, []);
  return /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onClick,
      className: `flex items-center gap-1.5 rounded-sm font-medium cursor-grab shadow-sm border transition-shadow hover:shadow-md ${typeClass} ${isCompact ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1.5 text-xs"} ${isDragging ? "opacity-50" : ""} ${className}`,
      title: `${field.name} (${field.type})`
    },
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "opacity-70 font-mono scale-90" }, icon),
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "truncate" }, field.name),
    field.aggregate && field.aggregate !== "none" && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[9px] uppercase tracking-wider bg-brand-black/50 px-1 rounded-sm ml-1 font-bold", title: `Aggregate: ${field.aggregate}` }, field.aggregate.slice(0, 3)),
    onRemove && /* @__PURE__ */ import_react4.default.createElement(
      import_ui3.Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "ml-auto h-4 w-4 rounded-full hover:bg-black/10 text-xs text-muted-foreground",
        title: "Remove"
      },
      "\xD7"
    )
  );
};
FieldPill.propTypes = {
  field: import_prop_types3.default.shape({
    name: import_prop_types3.default.string.isRequired,
    type: import_prop_types3.default.string.isRequired,
    icon: import_prop_types3.default.string,
    aggregate: import_prop_types3.default.string
  }).isRequired,
  onRemove: import_prop_types3.default.func,
  onClick: import_prop_types3.default.func,
  isDragging: import_prop_types3.default.bool,
  isCompact: import_prop_types3.default.bool,
  className: import_prop_types3.default.string
};

// src/vega/dataFieldPanel.jsx
var import_ui4 = require("@jet-admin/ui");
var import_lucide_react3 = require("lucide-react");
var collectArrayPaths = (obj, prefix = "", depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      results.push({
        path: `{{${fullPath}}}`,
        label: fullPath,
        sampleKeys: Object.keys(val[0]),
        rowCount: val.length
      });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectArrayPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};
var DataFieldPanel = ({
  workflowContext,
  queryResults,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = (0, import_react5.useState)("");
  const [manualField, setManualField] = (0, import_react5.useState)("");
  const [showManualAdd, setShowManualAdd] = (0, import_react5.useState)(false);
  const [showSuggestions, setShowSuggestions] = (0, import_react5.useState)(false);
  const suggestionsRef = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const schemaSuggestions = (0, import_react5.useMemo)(() => {
    if (!workflow) return [];
    const schema = extractWorkflowSchema(workflow);
    const suggestions = [];
    for (const nodeOut of schema.nodeOutputs) {
      suggestions.push({
        path: nodeOut.path,
        label: nodeOut.name,
        description: nodeOut.description,
        category: "node",
        nodeTitle: nodeOut.nodeTitle,
        nodeType: nodeOut.nodeType
      });
    }
    for (const wfOut of schema.workflowOutputs) {
      suggestions.push({
        path: wfOut.path,
        label: wfOut.name,
        description: wfOut.description,
        category: "output"
      });
    }
    return suggestions;
  }, [workflow]);
  const ctxArrayPaths = (0, import_react5.useMemo)(() => {
    if (!workflowContext) return [];
    return collectArrayPaths(workflowContext);
  }, [workflowContext]);
  const queryResultPaths = (0, import_react5.useMemo)(() => {
    if (!queryResults) return [];
    return collectArrayPaths(queryResults);
  }, [queryResults]);
  const allSuggestions = (0, import_react5.useMemo)(() => {
    const seen = /* @__PURE__ */ new Set();
    const combined = [];
    for (const arr of ctxArrayPaths) {
      if (!seen.has(arr.path)) {
        seen.add(arr.path);
        combined.push({
          ...arr,
          source: "runtime",
          description: `${arr.rowCount} rows, fields: ${arr.sampleKeys.slice(0, 4).join(", ")}${arr.sampleKeys.length > 4 ? "..." : ""}`
        });
      }
    }
    if (queryResults) {
      for (const alias of Object.keys(queryResults)) {
        const data = queryResults[alias];
        const isArray = Array.isArray(data);
        const arrayData = isArray ? data : data?.data && Array.isArray(data.data) ? data.data : null;
        if (arrayData && arrayData.length > 0) {
          const path = isArray ? `{{${alias}}}` : `{{${alias}.data}}`;
          if (!seen.has(path)) {
            seen.add(path);
            combined.push({
              path,
              label: `${alias} (Data Source)`,
              sampleKeys: Object.keys(arrayData[0]),
              rowCount: arrayData.length,
              source: "datasource",
              description: `${arrayData.length} rows, fields: ${Object.keys(arrayData[0]).slice(0, 4).join(", ")}`
            });
          }
        }
      }
    }
    for (const s of schemaSuggestions) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        combined.push({ ...s, source: "schema" });
      }
    }
    return combined;
  }, [ctxArrayPaths, queryResultPaths, schemaSuggestions, queryResults]);
  const fields = (0, import_react5.useMemo)(() => {
    if (!dataSource) return [];
    const match = dataSource.match(/\{\{([^}]+)\}\}/);
    if (!match) return [];
    const rawPath = match[1];
    const cleanPath = rawPath.startsWith("ctx.") ? rawPath.slice(4) : rawPath;
    const resolvePath2 = (root, pathStr) => {
      const parts = pathStr.split(".");
      let current = root;
      for (const part of parts) {
        if (current === void 0 || current === null) return void 0;
        const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
        if (arrMatch) {
          current = current[arrMatch[1]]?.[parseInt(arrMatch[2])];
        } else {
          current = current[part];
        }
      }
      return current;
    };
    const toFields = (data) => {
      if (Array.isArray(data) && data.length > 0) {
        return inferFieldsFromData(data);
      }
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return Object.keys(data).map((key) => ({
          name: key,
          type: typeof data[key] === "number" ? "quantitative" : "nominal",
          icon: typeof data[key] === "number" ? "#" : "Abc"
        }));
      }
      return null;
    };
    if (workflowContext) {
      const resolved = resolvePath2(workflowContext, cleanPath);
      const result = toFields(resolved);
      if (result) return result;
    }
    if (queryResults && queryResults !== workflowContext) {
      const resolved = resolvePath2(queryResults, rawPath);
      const result = toFields(resolved);
      if (result) return result;
    }
    return [];
  }, [workflowContext, queryResults, dataSource]);
  const filteredFields = (0, import_react5.useMemo)(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter((f) => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);
  const quantFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "quantitative"), [filteredFields]);
  const catFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "nominal" || f.type === "ordinal"), [filteredFields]);
  const tempFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "temporal"), [filteredFields]);
  const handleSelectSuggestion = (0, import_react5.useCallback)((suggestion) => {
    onDataSourceChange?.(suggestion.path);
    setShowSuggestions(false);
  }, [onDataSourceChange]);
  const handleAddManualField = (0, import_react5.useCallback)(() => {
    if (!manualField.trim()) return;
    if (onFieldClick) {
      onFieldClick({ name: manualField.trim(), type: "nominal", icon: "Abc" });
    }
    setManualField("");
    setShowManualAdd(false);
  }, [manualField, onFieldClick]);
  const getCategoryIcon2 = (cat) => {
    switch (cat) {
      case "node":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.GitMerge, { className: "w-3 h-3 shrink-0 text-emerald-600" });
      case "output":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.ArrowRightFromLine, { className: "w-3 h-3 shrink-0 text-fuchsia-600" });
      case "runtime":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Zap, { className: "w-3 h-3 shrink-0 text-amber-600" });
      case "datasource":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-blue-600" });
      default:
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-brand-text-primary" });
    }
  };
  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return /* @__PURE__ */ import_react5.default.createElement("div", { className: "mb-4" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: `text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${colorClass}` }, label, " (", groupFields.length, ")"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col gap-1.5 px-1" }, groupFields.map((field) => /* @__PURE__ */ import_react5.default.createElement(
      FieldPill,
      {
        key: field.name,
        field,
        onClick: () => onFieldClick?.(field),
        className: "w-full justify-start hover:scale-[1.02] transition-transform"
      }
    ))));
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: `flex flex-col h-full bg-brand-dark ${className}` }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "p-2.5 border-b border-border bg-muted/30" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ import_react5.default.createElement("span", null, "Data Source")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative", ref: suggestionsRef }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: dataSource || "",
      onChange: (e) => onDataSourceChange?.(e.target.value),
      onFocus: () => setShowSuggestions(true),
      placeholder: "Select or type a data path...",
      className: "w-full text-xs font-mono",
      title: "Workflow data source path"
    }
  ), showSuggestions && allSuggestions.length > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute left-0 right-0 top-full mt-1 bg-brand-dark border border-border rounded-md shadow-xl z-50 max-h-60 overflow-y-auto w-80" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted sticky top-0" }, "Available Variables (", allSuggestions.length, ")"), allSuggestions.map((s, i) => /* @__PURE__ */ import_react5.default.createElement(
    "div",
    {
      key: `${s.path}-${i}`,
      onClick: () => handleSelectSuggestion(s),
      className: `w-full text-left px-3 py-1.5 text-xs border-b border-border/50 flex items-start gap-2 transition-colors cursor-pointer ${dataSource === s.path ? "bg-primary/5 border-l-2 border-l-primary" : "bg-brand-dark hover:bg-muted"}`
    },
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-0.5" }, getCategoryIcon2(s.source || s.category)),
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[11px] font-medium text-foreground font-mono truncate" }, s.label), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[10px] text-muted-foreground truncate mt-0.5", title: s.description }, s.description), s.nodeTitle && /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[9px] text-emerald-600 mt-1 uppercase tracking-wider font-semibold" }, "from: ", s.nodeTitle)),
    s.source === "runtime" && /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0" }, "LIVE")
  )))), dataSource && fields.length > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm w-fit border border-emerald-100" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Zap, { className: "w-3 h-3" }), fields.length, " fields detected")), fields.length > 5 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-2.5 py-1.5 border-b border-border bg-brand-dark" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 bg-muted/50 border border-border rounded-sm px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Search, { className: "w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Filter fields...",
      className: "flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 h-6 p-0"
    }
  ))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 overflow-y-auto p-2.5 min-h-0" }, fields.length > 0 ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, renderFieldGroup(quantFields, "Measures", "text-emerald-600"), renderFieldGroup(catFields, "Dimensions", "text-blue-600"), renderFieldGroup(tempFields, "Temporal", "text-amber-600")) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col items-center justify-center h-full py-6 text-center px-3" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-8 h-8 mb-2 text-muted-foreground/30" }), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3" }, dataSource ? "Run the workflow to detect fields from the data" : "Choose a data source above or type a ctx path"), !dataSource && allSuggestions.length > 0 && /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      size: "sm",
      onClick: () => setShowSuggestions(true),
      className: "h-7 px-3 text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 uppercase tracking-wider"
    },
    "Browse ",
    allSuggestions.length,
    " Variables"
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-3" }, showManualAdd ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: manualField,
      onChange: (e) => setManualField(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleAddManualField(),
      placeholder: "Type field_name & press Enter...",
      className: "w-full text-xs font-mono",
      autoFocus: true
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 justify-end" }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: () => setShowManualAdd(false),
      className: "h-6 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
    },
    "Cancel"
  ), /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      size: "sm",
      onClick: handleAddManualField,
      className: "h-6 px-2 text-xs font-semibold"
    },
    "Add Field"
  ))) : /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      variant: "outline",
      onClick: () => setShowManualAdd(true),
      className: "w-full h-auto py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 border-dashed border-border hover:bg-muted hover:text-foreground"
    },
    /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Plus, { className: "w-3.5 h-3.5 mr-1" }),
    /* @__PURE__ */ import_react5.default.createElement("span", null, "Add Field Manually")
  ))));
};
DataFieldPanel.propTypes = {
  workflowContext: import_prop_types4.default.object,
  queryResults: import_prop_types4.default.object,
  dataSource: import_prop_types4.default.string,
  onDataSourceChange: import_prop_types4.default.func,
  onFieldClick: import_prop_types4.default.func,
  workflow: import_prop_types4.default.object,
  className: import_prop_types4.default.string
};

// src/vega/encodingShelf.jsx
var import_react6 = __toESM(require("react"));
var import_prop_types5 = __toESM(require("prop-types"));
var import_ui5 = require("@jet-admin/ui");
var CHANNEL_LABELS = {
  x: "X Axis",
  y: "Y Axis",
  color: "Color",
  size: "Size",
  shape: "Shape",
  opacity: "Opacity",
  row: "Row",
  column: "Column",
  detail: "Detail",
  text: "Text",
  strokeDash: "Dash"
};
var CHANNEL_ICONS = {
  x: "\u2194",
  y: "\u2195",
  color: "\u{1F3A8}",
  size: "\u25C9",
  shape: "\u25C6",
  opacity: "\u25D0",
  row: "\u25A6",
  column: "\u25A5",
  detail: "\u2299",
  text: "T",
  strokeDash: "\u254C"
};
var EncodingShelf = ({
  channel,
  value,
  onChange,
  onRemove,
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = (0, import_react6.useState)(false);
  const dropRef = (0, import_react6.useRef)(null);
  const label = CHANNEL_LABELS[channel] || channel;
  const icon = CHANNEL_ICONS[channel] || "\u2022";
  const handleDragOver = (0, import_react6.useCallback)((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);
  const handleDragLeave = (0, import_react6.useCallback)(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = (0, import_react6.useCallback)((e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data && data.name) {
        let defaultAggregate = void 0;
        if ((channel === "y" || channel === "size" || channel === "opacity") && data.type === "quantitative") {
          defaultAggregate = "sum";
        }
        onChange({
          field: data.name,
          type: data.type || "nominal",
          aggregate: defaultAggregate,
          title: "",
          sort: null
        });
      }
    } catch (err) {
    }
  }, [channel, onChange]);
  const handleTypeChange = (0, import_react6.useCallback)((newType) => {
    if (value) onChange({ ...value, type: newType });
  }, [value, onChange]);
  const handleAggChange = (0, import_react6.useCallback)((newAgg) => {
    if (value) onChange({ ...value, aggregate: newAgg === "none" ? void 0 : newAgg });
  }, [value, onChange]);
  const handleSortToggle = (0, import_react6.useCallback)(() => {
    if (!value) return;
    const sortStates = [null, "ascending", "descending"];
    const current = sortStates.indexOf(value.sort);
    const next = sortStates[(current + 1) % sortStates.length];
    onChange({ ...value, sort: next });
  }, [value, onChange]);
  const isEmpty = !value || !value.field;
  const shelfClass = [
    "flex items-center w-full min-h-[36px] bg-brand-dark border border-border rounded-md p-1 gap-2 transition-colors",
    isEmpty ? "border-dashed border-border bg-muted/30" : "",
    isDragOver ? "border-primary bg-primary/5 shadow-inner" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      ref: dropRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: shelfClass
    },
    /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-start w-24 shrink-0 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-2 border-r border-border" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-muted-foreground/50 text-sm" }, icon), /* @__PURE__ */ import_react6.default.createElement("span", { className: "truncate" }, label)),
    /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex-1 flex flex-wrap items-center gap-2 min-w-0 pr-1" }, isEmpty ? /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-xs text-muted-foreground italic px-2" }, isDragOver ? "Release to assign" : "Drop a field here") : /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement(
      FieldPill,
      {
        field: { ...value, name: value.field },
        onRemove,
        isCompact: true
      }
    ), /* @__PURE__ */ import_react6.default.createElement(import_ui5.Select, { value: value.type || "nominal", onValueChange: (val) => handleTypeChange(val) }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Data type" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectValue, { placeholder: "Select type" })), /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectContent, { className: "z-[200]" }, FIELD_TYPES.map((t) => /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { key: t, value: t }, t.charAt(0).toUpperCase() + t.slice(1))))), (value.type === "quantitative" || value.aggregate) && /* @__PURE__ */ import_react6.default.createElement(import_ui5.Select, { value: value.aggregate || "none", onValueChange: (val) => handleAggChange(val) }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Aggregation" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectValue, { placeholder: "Select agg" })), /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { value: "none" }, "no agg"), AGGREGATE_TYPES.map((a) => /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { key: a, value: a }, a)))), /* @__PURE__ */ import_react6.default.createElement(
      import_ui5.Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: handleSortToggle,
        className: "ml-auto h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5 text-xs",
        title: `Sort: ${value.sort || "default"}`
      },
      value.sort === "ascending" ? "\u2191" : value.sort === "descending" ? "\u2193" : "\u2195"
    )))
  );
};
EncodingShelf.propTypes = {
  channel: import_prop_types5.default.string.isRequired,
  value: import_prop_types5.default.shape({
    field: import_prop_types5.default.string,
    type: import_prop_types5.default.string,
    aggregate: import_prop_types5.default.string,
    sort: import_prop_types5.default.string,
    title: import_prop_types5.default.string
  }),
  onChange: import_prop_types5.default.func.isRequired,
  onRemove: import_prop_types5.default.func,
  className: import_prop_types5.default.string
};

// src/vega/markSelector.jsx
var import_react7 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var import_ui6 = require("@jet-admin/ui");
var MARK_OPTIONS = [
  { key: "auto", label: "Auto", icon: "\u2726", desc: "Best fit based on field types" },
  { key: "bar", label: "Bar", icon: "\u25A5", desc: "Compare categories" },
  { key: "line", label: "Line", icon: "\u27CB", desc: "Trends over time" },
  { key: "area", label: "Area", icon: "\u25A4", desc: "Volume over time" },
  { key: "point", label: "Scatter", icon: "\u2299", desc: "Correlation" },
  { key: "arc", label: "Pie", icon: "\u25D5", desc: "Part of whole" },
  { key: "donut", label: "Donut", icon: "\u25D1", desc: "Part of whole (ring)" },
  { key: "rect", label: "Heat", icon: "\u25A6", desc: "Density matrix" },
  { key: "tick", label: "Tick", icon: "|", desc: "Distribution marks" },
  { key: "circle", label: "Bubble", icon: "\u25CF", desc: "Sized circles" }
];
var MarkSelector = ({ value, onChange, className = "" }) => {
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: `flex flex-wrap gap-1 w-full ${className}` }, MARK_OPTIONS.map((opt) => {
    const isSelected = value === opt.key;
    return /* @__PURE__ */ import_react7.default.createElement(
      import_ui6.Button,
      {
        key: opt.key,
        type: "button",
        variant: isSelected ? "outline" : "ghost",
        size: "sm",
        onClick: () => onChange(opt.key),
        className: `h-auto py-1.5 flex-1 min-w-[60px] px-2 text-xs font-medium ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm hover:text-indigo-800 hover:bg-indigo-100" : "text-brand-text-primary border-transparent hover:bg-brand-border-dark"}`,
        title: `${opt.label}: ${opt.desc}`
      },
      /* @__PURE__ */ import_react7.default.createElement("span", { className: `mr-1.5 ${isSelected ? "text-indigo-500" : "text-brand-text-primary"}` }, opt.icon),
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "hidden lg:inline" }, opt.label)
    );
  }));
};
MarkSelector.propTypes = {
  value: import_prop_types6.default.string,
  onChange: import_prop_types6.default.func.isRequired,
  className: import_prop_types6.default.string
};

// src/vega/shelfBuilder.jsx
var import_ui7 = require("@jet-admin/ui");
var import_lucide_react4 = require("lucide-react");
var VEGA_STRINGS = {
  WIDGET_DATASET_FIELD_MAPPING_BUTTON: "Mappings"
};
var PRIMARY_SHELVES = ["x", "y", "color", "size"];
var SECONDARY_SHELVES = ["row", "column", "shape", "opacity", "detail", "text"];
var getQueryResultEntries = (queryResults) => {
  if (!queryResults) return [];
  const isNamespaced = queryResults.queries || queryResults.workflows;
  if (isNamespaced) {
    const entries = [];
    if (queryResults.queries) {
      for (const alias of Object.keys(queryResults.queries)) {
        entries.push({ alias, namespace: "queries", data: queryResults.queries[alias] });
      }
    }
    if (queryResults.workflows) {
      for (const alias of Object.keys(queryResults.workflows)) {
        entries.push({ alias, namespace: "workflows", data: queryResults.workflows[alias] });
      }
    }
    return entries;
  }
  return Object.keys(queryResults).map((alias) => ({ alias, namespace: null, data: queryResults[alias] }));
};
var collectArrayPaths2 = (obj, prefix = "", depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      results.push({
        path: `{{${fullPath}}}`,
        label: fullPath,
        sampleKeys: Object.keys(val[0]),
        rowCount: val.length
      });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectArrayPaths2(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};
var ShelfBuilder = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  queryResults
}) => {
  const [shelfSpec, setShelfSpec] = (0, import_react8.useState)(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (typeof savedSpec === "string") {
      try {
        savedSpec = JSON.parse(savedSpec);
      } catch (e) {
        savedSpec = null;
      }
    }
    return savedSpec || getDefaultShelfSpec();
  });
  (0, import_react8.useEffect)(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (savedSpec) {
      if (typeof savedSpec === "string") {
        try {
          savedSpec = JSON.parse(savedSpec);
        } catch (e) {
          return;
        }
      }
      if (JSON.stringify(savedSpec) !== JSON.stringify(shelfSpec)) {
        setShelfSpec(savedSpec);
      }
    }
  }, [widgetEditorForm.values.widgetConfig?.shelfSpec]);
  const [showSecondary, setShowSecondary] = (0, import_react8.useState)(false);
  const [showStyle, setShowStyle] = (0, import_react8.useState)(false);
  const selectedWorkflow = (0, import_react8.useMemo)(() => {
    const wID = widgetEditorForm.values.workflowID;
    if (!wID || !workflows) return null;
    return workflows.find((w) => String(w.workflowID) === String(wID));
  }, [widgetEditorForm.values.workflowID, workflows]);
  const resolvedMark = (0, import_react8.useMemo)(() => {
    if (shelfSpec.mark === "auto" || !shelfSpec.mark) {
      return inferMarkType(shelfSpec.encoding);
    }
    return shelfSpec.mark;
  }, [shelfSpec.mark, shelfSpec.encoding]);
  const handleChannelChange = (0, import_react8.useCallback)((channel, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: value
      }
    }));
  }, []);
  const handleChannelRemove = (0, import_react8.useCallback)((channel) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: null
      }
    }));
  }, []);
  const handleMarkChange = (0, import_react8.useCallback)((mark) => {
    setShelfSpec((prev) => ({ ...prev, mark }));
  }, []);
  const handleDataSourceChange = (0, import_react8.useCallback)((newSource) => {
    setShelfSpec((prev) => ({ ...prev, dataSource: newSource }));
  }, []);
  const handleConfigChange = (0, import_react8.useCallback)((key, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, []);
  const handleFieldQuickAdd = (0, import_react8.useCallback)((field) => {
    setShelfSpec((prev) => {
      const enc = { ...prev.encoding };
      if (!enc.x?.field) {
        enc.x = { field: field.name, type: field.type };
      } else if (!enc.y?.field) {
        const agg = field.type === "quantitative" ? "sum" : void 0;
        enc.y = { field: field.name, type: field.type, aggregate: agg };
      } else if (!enc.color?.field) {
        enc.color = { field: field.name, type: field.type };
      } else if (!enc.size?.field) {
        enc.size = { field: field.name, type: field.type };
      }
      return { ...prev, encoding: enc };
    });
  }, []);
  const [isOpen, setIsOpen] = (0, import_react8.useState)(false);
  (0, import_react8.useEffect)(() => {
    const timer = setTimeout(() => {
      const vegaSpec = generateVegaLiteSpec(shelfSpec);
      if (shelfSpec.dataSource) {
        vegaSpec.data = { values: shelfSpec.dataSource };
      }
      widgetEditorForm.setFieldValue("widgetConfig.shelfSpec", shelfSpec);
      widgetEditorForm.setFieldValue("widgetConfig.vegaSpec", vegaSpec);
    }, 200);
    return () => clearTimeout(timer);
  }, [shelfSpec]);
  const queryResultEntries = (0, import_react8.useMemo)(() => getQueryResultEntries(queryResults), [queryResults]);
  const discoveredArrayPaths = (0, import_react8.useMemo)(() => {
    if (!workflowContext) return [];
    return collectArrayPaths2(workflowContext);
  }, [workflowContext]);
  const hasDataSources = queryResultEntries.length > 0 || discoveredArrayPaths.length > 0;
  const isWorkflowSelected = !!selectedWorkflow;
  const hasAnyData = isWorkflowSelected || hasDataSources;
  return /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Dialog, { open: isOpen, onOpenChange: setIsOpen }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogTrigger, { asChild: true }, /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs"
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.TrendingUp, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS.WIDGET_DATASET_FIELD_MAPPING_BUTTON
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogContent, { className: "max-w-6xl w-[95vw] h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-brand-dark border-border shadow-2xl" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogHeader, { className: "flex flex-row items-center px-4 py-3 border-b border-border bg-brand-dark shrink-0 space-y-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 text-foreground" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.TrendingUp, { className: "w-5 h-5 text-primary" }), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogTitle, { className: "text-base font-bold m-0 p-0 text-left" }, "Visual Chart Editor"))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 overflow-hidden bg-muted/30 flex p-3 gap-3 min-h-0" }, !hasAnyData ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full text-center border-2 border-dashed border-border rounded-sm bg-brand-dark" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.Database, { className: "w-10 h-10 mb-3 text-muted-foreground/40" }), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-sm font-semibold text-foreground mb-1" }, "No Data Source Selected"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Add a Data Source in the Data tab and run a Test, or select a Workflow.")) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col w-56 shrink-0 bg-brand-dark border border-border rounded-md overflow-hidden min-h-0 h-full" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-2 border-b border-border bg-brand-dark" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.dataSource || "", onValueChange: (val) => handleDataSourceChange(val) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs font-medium" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select Data Input" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, selectedWorkflow && /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "workflow" }, "Workflow Output"), workflowContext && !workflowContext.queries && !workflowContext.workflows && Object.keys(workflowContext).map((key) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key, value: `{{ctx.${key}}}` }, `ctx.${key}`)), discoveredArrayPaths.length > 0 ? discoveredArrayPaths.map((arr) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key: arr.path, value: arr.path }, arr.label, " (", arr.rowCount, " rows)")) : queryResultEntries.map(({ alias, namespace }) => {
    const valuePath = namespace ? `{{${namespace}.${alias}.data}}` : `{{${alias}.data}}`;
    const label = namespace ? `${namespace}.${alias} (Data Source)` : `${alias} (Data Source)`;
    return /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key: `qr-${namespace || ""}-${alias}`, value: valuePath }, label);
  })))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 overflow-hidden outline-none min-h-0" }, /* @__PURE__ */ import_react8.default.createElement(
    DataFieldPanel,
    {
      workflowContext,
      queryResults,
      dataSource: shelfSpec.dataSource,
      onDataSourceChange: handleDataSourceChange,
      onFieldClick: handleFieldQuickAdd,
      workflow: selectedWorkflow,
      className: "h-full"
    }
  ))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 flex flex-col h-full overflow-y-auto min-h-0 pr-1 gap-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1" }, "Encoding Shelves"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 flex flex-col gap-3" }, PRIMARY_SHELVES.map((ch) => /* @__PURE__ */ import_react8.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md mt-2" }, /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      onClick: () => setShowSecondary(!showSecondary),
      className: "w-full flex items-center justify-start p-2.5 border-b border-border hover:bg-muted transition-colors focus:outline-none bg-brand-dark font-medium cursor-pointer"
    },
    showSecondary ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronDown, { className: "w-4 h-4 mr-2 text-muted-foreground" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronRight, { className: "w-4 h-4 mr-2 text-muted-foreground" }),
    /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground" }, "More Channels ", /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-primary ml-1" }, "(", SECONDARY_SHELVES.filter((ch) => shelfSpec.encoding[ch]?.field).length, " active)"))
  ), showSecondary && /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-3 flex flex-col gap-3 bg-muted/30" }, SECONDARY_SHELVES.map((ch) => /* @__PURE__ */ import_react8.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col w-64 shrink-0 h-full overflow-y-auto min-h-0 pl-1 gap-1.5 pb-4" }, /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      onClick: () => setShowStyle(!showStyle),
      className: "flex items-center gap-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors bg-transparent cursor-pointer"
    },
    showStyle ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronRight, { className: "w-4 h-4" }),
    /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[10px] font-bold uppercase tracking-widest" }, "Chart Style & Settings")
  ), showStyle && /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 space-y-4" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5" }, "Marks"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-muted/30 border border-border rounded-md p-2" }, /* @__PURE__ */ import_react8.default.createElement(MarkSelector, { value: shelfSpec.mark || "auto", onChange: handleMarkChange }), shelfSpec.mark === "auto" && /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[10px] text-muted-foreground italic p-1 text-center mt-1" }, "Auto-resolved to: ", /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-foreground not-italic ml-1" }, resolvedMark)))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "mt-2 space-y-3" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest" }, "Appearance"), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Chart Title"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Input,
    {
      type: "text",
      value: shelfSpec.config?.title || "",
      onChange: (e) => handleConfigChange("title", e.target.value),
      placeholder: "Untitled Chart",
      className: "w-full text-xs"
    }
  )), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Color Palette"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.config?.colorScheme || "tableau10", onValueChange: (val) => handleConfigChange("colorScheme", val) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select an option" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, COLOR_SCHEMES.map((s) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key: s, value: s }, s))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Width"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.config?.width === "container" ? "container" : "custom", onValueChange: (val) => handleConfigChange("width", val === "container" ? "container" : 400) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select an option" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "container" }, "Fill"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "custom" }, "Fixed")))), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Height"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Input,
    {
      type: "number",
      value: shelfSpec.config?.height || 300,
      onChange: (e) => handleConfigChange("height", parseInt(e.target.value) || 300),
      className: "w-full text-xs"
    }
  )))))))), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogFooter, { className: "px-4 py-2.5 bg-brand-dark shrink-0 mt-2" }, /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: () => setIsOpen(false)
    },
    "Done"
  )))));
};
ShelfBuilder.propTypes = {
  widgetEditorForm: import_prop_types7.default.object.isRequired,
  workflowContext: import_prop_types7.default.object,
  workflows: import_prop_types7.default.array,
  queryResults: import_prop_types7.default.object
};

// src/vega/vegaConfigEditor.jsx
var import_lucide_react5 = require("lucide-react");
var VEGA_STRINGS2 = {
  WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
  WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval"
};
var VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  selectedWorkflow,
  queryResults
}) => {
  const isVegaLite = widgetEditorForm.values.widgetType === "vega-lite";
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? "visual" : "raw");
  const [showParseWarning, setShowParseWarning] = (0, import_react9.useState)(false);
  const [parseWarningsList, setParseWarningsList] = (0, import_react9.useState)([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = (0, import_react9.useState)(false);
  const resolvedSelectedWorkflow = selectedWorkflow || (workflows && widgetEditorForm.values.workflowID ? workflows.find((w) => String(w.workflowID) === String(widgetEditorForm.values.workflowID)) : null);
  const handleModeSwitch = (newMode) => {
    if (newMode === currentMode) return;
    if (newMode === "visual") {
      try {
        const currentSpecText = widgetEditorForm.values.widgetConfig?.vegaSpec;
        if (currentSpecText) {
          const specObj = typeof currentSpecText === "string" ? JSON.parse(currentSpecText) : currentSpecText;
          const { success, config, warnings } = parseVegaLiteSpec(specObj);
          if (!success || warnings.length > 0) {
            setParseWarningsList(warnings || ["Could not fully parse custom modifications."]);
            setShowParseWarning(true);
            return;
          } else if (config) {
            widgetEditorForm.setFieldValue("widgetConfig.chartBuilderSpec", config);
          }
        }
      } catch (e) {
        setParseWarningsList([`Invalid JSON: ${e.message}`]);
        setShowParseWarning(true);
        return;
      }
    }
    widgetEditorForm.setFieldValue("widgetConfig.editorMode", newMode);
  };
  const confirmModeSwitch = () => {
    widgetEditorForm.setFieldValue("widgetConfig.editorMode", "visual");
    setShowParseWarning(false);
  };
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 flex flex-col gap-3" }, isVegaLite && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-row items-center gap-2" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs font-medium text-muted-foreground" }, "Visual Editor"), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Switch, { className: "h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5", checked: currentMode === "visual", onCheckedChange: (checked) => handleModeSwitch(checked ? "visual" : "raw") })), isVegaLite && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-row items-center justify-stretch gap-3" }, currentMode === "visual" && !showParseWarning && /* @__PURE__ */ import_react9.default.createElement(
    ShelfBuilder,
    {
      widgetEditorForm,
      workflowContext,
      workflows,
      queryResults
    }
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs",
      onClick: () => setIsSettingsDialogOpen(true)
    },
    /* @__PURE__ */ import_react9.default.createElement(import_lucide_react5.Settings, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON
  ), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Dialog, { open: isSettingsDialogOpen, onOpenChange: setIsSettingsDialogOpen }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogContent, { className: "max-w-lg" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogHeader, null, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogTitle, null, VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON)), /* @__PURE__ */ import_react9.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, `${VEGA_STRINGS2.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL} (ms)`), /* @__PURE__ */ import_react9.default.createElement(
    import_ui8.Input,
    {
      type: "number",
      name: "widgetConfig.refetchInterval",
      className: "text-sm",
      onChange: widgetEditorForm.handleChange,
      value: widgetEditorForm.values.widgetConfig?.refetchInterval || ""
    }
  )), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Label, { className: "text-xs text-muted-foreground italic" }, "Additional options moved to Widget Settings.")))))), showParseWarning && /* @__PURE__ */ import_react9.default.createElement("div", { className: "my-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-start gap-2 text-xs" }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react5.AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react9.default.createElement("h4", { className: "mb-1 font-semibold text-amber-900 dark:text-amber-200" }, "Cannot fully parse chart config"), /* @__PURE__ */ import_react9.default.createElement("p", { className: "mb-2 text-amber-800 dark:text-amber-300" }, "Switching to Visual mode may cause you to lose manual modifications:"), /* @__PURE__ */ import_react9.default.createElement("ul", { className: "mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300" }, parseWarningsList.map((w, i) => /* @__PURE__ */ import_react9.default.createElement("li", { key: i, className: "mb-0.5" }, w))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Button, { type: "button", variant: "outline", size: "sm", onClick: () => setShowParseWarning(false), className: "h-7 text-xs" }, "Cancel"), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Button, { type: "button", size: "sm", onClick: confirmModeSwitch, className: "h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600" }, "Switch & Overwrite"))))), !showParseWarning && currentMode === "raw" && /* @__PURE__ */ import_react9.default.createElement("div", { className: "min-h-[300px] flex-1 overflow-auto rounded-md border border-border bg-brand-dark" }, /* @__PURE__ */ import_react9.default.createElement(
    VegaSpecEditor,
    {
      value: widgetEditorForm.values.widgetConfig?.vegaSpec,
      onChange: (spec) => widgetEditorForm.setFieldValue("widgetConfig.vegaSpec", spec),
      workflowContext,
      workflow: resolvedSelectedWorkflow
    }
  )));
};
VegaConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types8.default.object.isRequired,
  workflowContext: import_prop_types8.default.object,
  workflows: import_prop_types8.default.array,
  selectedWorkflow: import_prop_types8.default.object,
  queryResults: import_prop_types8.default.object
};

// src/index.js
init_tableWidget();
init_tableConfigEditor();

// src/widget.map.js
var import_react26 = __toESM(require("react"));

// src/widget.config.js
var registerWidgets = () => {
};
var getDemoData = (type) => {
  switch (type) {
    case "vega":
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A simple bar chart with embedded data.",
        width: 400,
        height: 200,
        padding: 5,
        data: [
          {
            name: "table",
            values: [
              { category: "A", amount: 28 },
              { category: "B", amount: 55 },
              { category: "C", amount: 43 },
              { category: "D", amount: 91 },
              { category: "E", amount: 81 },
              { category: "F", amount: 53 },
              { category: "G", amount: 19 },
              { category: "H", amount: 87 }
            ]
          }
        ],
        signals: [
          {
            name: "tooltip",
            value: {},
            on: [
              { events: "rect:mouseover", update: "datum" },
              { events: "rect:mouseout", update: "{}" }
            ]
          }
        ],
        scales: [
          {
            name: "xscale",
            type: "band",
            domain: { data: "table", field: "category" },
            range: "width",
            padding: 0.05,
            round: true
          },
          {
            name: "yscale",
            domain: { data: "table", field: "amount" },
            nice: true,
            range: "height"
          }
        ],
        axes: [
          { orient: "bottom", scale: "xscale" },
          { orient: "left", scale: "yscale" }
        ],
        marks: [
          {
            type: "rect",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "xscale", field: "category" },
                width: { scale: "xscale", band: 1 },
                y: { scale: "yscale", field: "amount" },
                y2: { scale: "yscale", value: 0 }
              },
              update: {
                fill: { value: "steelblue" }
              },
              hover: {
                fill: { value: "red" }
              }
            }
          }
        ]
      };
    case "vega-lite":
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "A simple bar chart with embedded data.",
        data: {
          values: [
            { category: "A", value: 28 },
            { category: "B", value: 55 },
            { category: "C", value: 43 },
            { category: "D", value: 91 },
            { category: "E", value: 81 }
          ]
        },
        mark: "bar",
        encoding: {
          x: { field: "category", type: "nominal", axis: { labelAngle: 0 } },
          y: { field: "value", type: "quantitative" }
        }
      };
    default:
      return {};
  }
};

// src/widget.map.js
var import_widget_types = require("@jet-admin/widget-types");
init_buttonConfigEditor();
init_tableConfigEditor();

// src/text/textConfigEditor.jsx
var import_react13 = __toESM(require("react"));
var import_prop_types12 = __toESM(require("prop-types"));
var import_ui12 = require("@jet-admin/ui");
var TextConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Content"), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-[10px] text-muted-foreground leading-snug" }, "Supports Markdown formatting and ", /* @__PURE__ */ import_react13.default.createElement("code", { className: "font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]" }, "{{expression}}"), " templates."), /* @__PURE__ */ import_react13.default.createElement(
    "textarea",
    {
      className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-y",
      value: config.content || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.content", e.target.value),
      placeholder: "# Heading\n\nSome **bold** and *italic* text.\n\nValue: {{queries.myQuery.data[0].name}}"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Format"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui12.Select,
    {
      value: config.format || "markdown",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.format", val)
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "markdown" }, "Markdown"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "plain" }, "Plain Text"))
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Align"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui12.Select,
    {
      value: config.textAlign || "left",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "left" }, "Left"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "center" }, "Center"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "right" }, "Right"))
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui12.Select,
    {
      value: config.fontSize || "sm",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.fontSize", val)
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "xs" }, "Extra Small"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "md" }, "Medium"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react13.default.createElement(import_ui12.SelectItem, { value: "xl" }, "Extra Large"))
  ))));
};
TextConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types12.default.object.isRequired
};

// src/stat/statConfigEditor.jsx
var import_react14 = __toESM(require("react"));
var import_prop_types13 = __toESM(require("prop-types"));
var import_ui13 = require("@jet-admin/ui");
var StatConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Label"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.label || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value),
      placeholder: "e.g. Total Revenue"
    }
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Value"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Input,
    {
      type: "text",
      className: "text-sm font-mono",
      value: config.valueTemplate || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.valueTemplate", e.target.value),
      placeholder: "e.g. {{queries.stats.data[0].count}}"
    }
  ), /* @__PURE__ */ import_react14.default.createElement("p", { className: "text-[10px] text-muted-foreground" }, "The primary metric value. Use template expressions to bind to data sources.")), /* @__PURE__ */ import_react14.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Prefix"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.prefix || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.prefix", e.target.value),
      placeholder: "e.g. $"
    }
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Suffix"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.suffix || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.suffix", e.target.value),
      placeholder: "e.g. users"
    }
  ))), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Trend Value"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Input,
    {
      type: "text",
      className: "text-sm font-mono",
      value: config.trendTemplate || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.trendTemplate", e.target.value),
      placeholder: "e.g. {{queries.stats.data[0].change_pct}}"
    }
  ), /* @__PURE__ */ import_react14.default.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Optional percentage change. Positive = up trend, negative = down trend.")), /* @__PURE__ */ import_react14.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Trend Semantics"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Select,
    {
      value: config.trendDirection || "up-is-good",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.trendDirection", val)
    },
    /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectValue, null)),
    /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectContent, null, /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectItem, { value: "up-is-good" }, "Up = Good (green)"), /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectItem, { value: "down-is-good" }, "Down = Good (green)"))
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.Label, { className: "text-xs font-medium text-foreground" }, "Align"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui13.Select,
    {
      value: config.textAlign || "center",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)
    },
    /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectValue, null)),
    /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectContent, null, /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectItem, { value: "left" }, "Left"), /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectItem, { value: "center" }, "Center"), /* @__PURE__ */ import_react14.default.createElement(import_ui13.SelectItem, { value: "right" }, "Right"))
  ))));
};
StatConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types13.default.object.isRequired
};

// src/alert/alertConfigEditor.jsx
var import_react15 = __toESM(require("react"));
var import_prop_types14 = __toESM(require("prop-types"));
var import_ui14 = require("@jet-admin/ui");
var AlertConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react15.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Type / Variant"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui14.Select,
    {
      value: config.variant || "info",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
    },
    /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectValue, null)),
    /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectContent, null, /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectItem, { value: "info" }, "Info (Blue)"), /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectItem, { value: "success" }, "Success (Green)"), /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectItem, { value: "warning" }, "Warning (Amber)"), /* @__PURE__ */ import_react15.default.createElement(import_ui14.SelectItem, { value: "error" }, "Error (Red)"))
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react15.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Title (Optional)"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui14.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.title || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.title", e.target.value),
      placeholder: "e.g. Warning!"
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react15.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Message"), /* @__PURE__ */ import_react15.default.createElement(
    "textarea",
    {
      className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] resize-y",
      value: config.message || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.message", e.target.value),
      placeholder: "e.g. Action completed successfully."
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui14.Checkbox,
    {
      id: "alert-dismissible",
      checked: config.dismissible ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.dismissible", !!checked)
    }
  ), /* @__PURE__ */ import_react15.default.createElement(import_ui14.Label, { htmlFor: "alert-dismissible", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow user to dismiss/close the banner")));
};
AlertConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types14.default.object.isRequired
};

// src/form/formConfigEditor.jsx
var import_react16 = __toESM(require("react"));
var import_prop_types15 = __toESM(require("prop-types"));
var import_lucide_react8 = require("lucide-react");
var import_ui15 = require("@jet-admin/ui");
var FormConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const fields = config.fields || [];
  const handleAddField = () => {
    const newField = {
      key: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: "text",
      placeholder: "",
      required: false,
      defaultValue: "",
      options: []
    };
    widgetEditorForm.setFieldValue("widgetConfig.fields", [...fields, newField]);
  };
  const handleRemoveField = (idx) => {
    const updated = [...fields];
    updated.splice(idx, 1);
    widgetEditorForm.setFieldValue("widgetConfig.fields", updated);
  };
  const handleFieldChange = (idx, key, val) => {
    widgetEditorForm.setFieldValue(`widgetConfig.fields[${idx}].${key}`, val);
  };
  const handleOptionsChange = (idx, optionsStr) => {
    const list = optionsStr.split(",").map((s) => s.trim()).filter(Boolean);
    handleFieldChange(idx, "options", list);
  };
  return /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "grid grid-cols-2 gap-3 pb-3 border-b" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-xs font-medium text-foreground" }, "Submit Button Text"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-xs h-8",
      value: config.submitLabel || "Submit",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.submitLabel", e.target.value)
    }
  )), /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-xs font-medium text-foreground" }, "Size / Spacing"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Select,
    {
      value: config.size || "default",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
    },
    /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectTrigger, { className: "text-xs h-8" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectValue, null)),
    /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectContent, null, /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "sm" }, "Compact (Small)"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "default" }, "Normal (Default)"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "lg" }, "Spacious (Large)"))
  ))), /* @__PURE__ */ import_react16.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-xs font-semibold text-foreground" }, "Fields list"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-7 px-2 text-[10px] gap-1",
      onClick: handleAddField
    },
    /* @__PURE__ */ import_react16.default.createElement(import_lucide_react8.Plus, { className: "h-3 w-3" }),
    " Add Field"
  )), /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-3 max-h-[350px] overflow-y-auto pr-1" }, fields.map((field, idx) => /* @__PURE__ */ import_react16.default.createElement("div", { key: idx, className: "p-3 border rounded bg-muted/10 relative space-y-2" }, /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Button,
    {
      type: "button",
      variant: "ghost",
      size: "icon",
      className: "absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive",
      onClick: () => handleRemoveField(idx)
    },
    /* @__PURE__ */ import_react16.default.createElement(import_lucide_react8.Trash2, { className: "h-3.5 w-3.5" })
  ), /* @__PURE__ */ import_react16.default.createElement("div", { className: "grid grid-cols-2 gap-2 pr-5" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[10px] text-muted-foreground font-medium" }, "Label"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: field.label || "",
      onChange: (e) => handleFieldChange(idx, "label", e.target.value),
      placeholder: "e.g. Email Address"
    }
  )), /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[10px] text-muted-foreground font-medium" }, "Key (Unique ID)"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-xs h-7 font-mono",
      value: field.key || "",
      onChange: (e) => handleFieldChange(idx, "key", e.target.value),
      placeholder: "e.g. email"
    }
  ))), /* @__PURE__ */ import_react16.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[10px] text-muted-foreground font-medium" }, "Input Type"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Select,
    {
      value: field.type || "text",
      onValueChange: (val) => handleFieldChange(idx, "type", val)
    },
    /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectTrigger, { className: "text-[11px] h-7 bg-background" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectValue, null)),
    /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectContent, null, /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "text" }, "Text (Single line)"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "email" }, "Email"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "password" }, "Password"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "number" }, "Number"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "checkbox" }, "Checkbox"), /* @__PURE__ */ import_react16.default.createElement(import_ui15.SelectItem, { value: "select" }, "Select / Dropdown"))
  )), field.type !== "checkbox" && /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[10px] text-muted-foreground font-medium" }, "Placeholder"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: field.placeholder || "",
      onChange: (e) => handleFieldChange(idx, "placeholder", e.target.value),
      placeholder: "Hint text..."
    }
  ))), field.type === "select" && /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[10px] text-muted-foreground font-medium" }, "Options (comma-separated)"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: (field.options || []).join(", "),
      onChange: (e) => handleOptionsChange(idx, e.target.value),
      placeholder: "admin, member, guest"
    }
  )), /* @__PURE__ */ import_react16.default.createElement("div", { className: "grid grid-cols-2 gap-2 pt-1.5 border-t border-dashed" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Checkbox,
    {
      id: `field-req-${idx}`,
      checked: !!field.required,
      onCheckedChange: (val) => handleFieldChange(idx, "required", !!val)
    }
  ), /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { htmlFor: `field-req-${idx}`, className: "text-[10px] text-muted-foreground cursor-pointer font-medium" }, "Required field")), /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { className: "text-[9px] text-muted-foreground block leading-none" }, "Default Value"), /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Input,
    {
      type: "text",
      className: "text-[10px] h-6 font-mono px-1.5",
      value: field.defaultValue || "",
      onChange: (e) => handleFieldChange(idx, "defaultValue", e.target.value),
      placeholder: "e.g. {{widgets.table1.selectedRow.name}}"
    }
  ))))), fields.length === 0 && /* @__PURE__ */ import_react16.default.createElement("div", { className: "text-center p-4 border border-dashed text-xs text-muted-foreground rounded" }, "Click 'Add Field' above to define dynamic form fields.")), /* @__PURE__ */ import_react16.default.createElement("div", { className: "flex items-center gap-2 pt-2" }, /* @__PURE__ */ import_react16.default.createElement(
    import_ui15.Checkbox,
    {
      id: "form-show-reset",
      checked: config.showReset ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.showReset", !!checked)
    }
  ), /* @__PURE__ */ import_react16.default.createElement(import_ui15.Label, { htmlFor: "form-show-reset", className: "text-xs text-muted-foreground cursor-pointer" }, "Show form reset button alongside submit")));
};
FormConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types15.default.object.isRequired
};

// src/image/imageConfigEditor.jsx
var import_react17 = __toESM(require("react"));
var import_prop_types16 = __toESM(require("prop-types"));
var import_ui16 = require("@jet-admin/ui");
var ImageConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Image URL / Source"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui16.Input,
    {
      type: "text",
      className: "text-sm font-mono",
      value: config.src || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.src", e.target.value),
      placeholder: "e.g. {{queries.user.data.avatar_url}}"
    }
  ), /* @__PURE__ */ import_react17.default.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Supports template expressions for dynamic content.")), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Alt Text (Accessibility)"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui16.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.alt || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.alt", e.target.value),
      placeholder: "e.g. Profile photo"
    }
  )), /* @__PURE__ */ import_react17.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Object Fit"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui16.Select,
    {
      value: config.objectFit || "cover",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.objectFit", val)
    },
    /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectValue, null)),
    /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectContent, null, /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "cover" }, "Cover (crop to fit)"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "contain" }, "Contain (show all)"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "fill" }, "Fill (stretch)"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "none" }, "Original Size"))
  )), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Corner Radius"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui16.Select,
    {
      value: config.borderRadius || "none",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.borderRadius", val)
    },
    /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectValue, null)),
    /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectContent, null, /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "none" }, "Square (None)"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "md" }, "Medium"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react17.default.createElement(import_ui16.SelectItem, { value: "full" }, "Circle (Full)"))
  ))));
};
ImageConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types16.default.object.isRequired
};

// src/iframe/iframeConfigEditor.jsx
var import_react18 = __toESM(require("react"));
var import_prop_types17 = __toESM(require("prop-types"));
var import_ui17 = require("@jet-admin/ui");
var IframeConfigEditor = ({ widgetEditorForm }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { className: "text-xs font-medium text-foreground" }, "Embed URL / Target Source"), /* @__PURE__ */ import_react18.default.createElement(
    import_ui17.Input,
    {
      type: "text",
      className: "text-sm font-mono",
      value: config.url || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.url", e.target.value),
      placeholder: "e.g. https://example.com"
    }
  ), /* @__PURE__ */ import_react18.default.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Make sure the target site supports framing (doesn't send X-Frame-Options: DENY).")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-2 border-t pt-3" }, /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { className: "text-xs font-medium text-foreground" }, "Sandbox Security Options"), /* @__PURE__ */ import_react18.default.createElement("p", { className: "text-[10px] text-muted-foreground leading-snug mb-2" }, "Toggle capabilities granted to the embedded page. Restricted by default."), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui17.Checkbox,
    {
      id: "iframe-scripts",
      checked: config.allowScripts ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowScripts", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { htmlFor: "iframe-scripts", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow JavaScript execution (allow-scripts)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1.5" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui17.Checkbox,
    {
      id: "iframe-forms",
      checked: config.allowForms ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowForms", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { htmlFor: "iframe-forms", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow form submission (allow-forms)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1.5" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui17.Checkbox,
    {
      id: "iframe-popups",
      checked: config.allowPopups ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowPopups", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { htmlFor: "iframe-popups", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow popups & new windows (allow-popups)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1.5" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui17.Checkbox,
    {
      id: "iframe-origin",
      checked: config.allowSameOrigin ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowSameOrigin", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui17.Label, { htmlFor: "iframe-origin", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow sharing local storage/cookies (allow-same-origin)"))));
};
IframeConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types17.default.object.isRequired
};

// src/widget.map.js
var import_lucide_react13 = require("lucide-react");
registerWidgets();
var LazyVegaWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module2) => ({ default: module2.VegaWidget }))
);
var LazyButtonWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_button(), button_exports)).then((module2) => ({ default: module2.ButtonWidget }))
);
var LazyTableWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_table(), table_exports)).then((module2) => ({ default: module2.TableWidget }))
);
var LazyTextWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_text(), text_exports)).then((module2) => ({ default: module2.TextWidget }))
);
var LazyStatWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_stat(), stat_exports)).then((module2) => ({ default: module2.StatWidget }))
);
var LazyAlertWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_alert(), alert_exports)).then((module2) => ({ default: module2.AlertWidget }))
);
var LazyFormWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_form(), form_exports)).then((module2) => ({ default: module2.FormWidget }))
);
var LazyImageWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_image(), image_exports)).then((module2) => ({ default: module2.ImageWidget }))
);
var LazyIframeWidget = import_react26.default.lazy(
  () => Promise.resolve().then(() => (init_iframe(), iframe_exports)).then((module2) => ({ default: module2.IframeWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: import_widget_types.WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react26.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.BarChart, { className: `!text-lg ${className}` }),
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: void 0
      },
      showHeader: true
    }
  },
  "vega": {
    label: "Vega",
    value: import_widget_types.WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react26.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.BarChart, { className: `!text-lg ${className}` }),
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: void 0
      },
      showHeader: true
    }
  },
  "button": {
    label: "Button",
    value: import_widget_types.WIDGET_TYPES.BUTTON.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Trigger a workflow",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading button...") }, /* @__PURE__ */ import_react26.default.createElement(LazyButtonWidget, { data, ...props }));
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.Component, { className: `!text-lg ${className}` }),
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: false
    }
  },
  "table": {
    label: "Data Table",
    value: import_widget_types.WIDGET_TYPES.TABLE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Tabular data display with pagination",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading table...") }, /* @__PURE__ */ import_react26.default.createElement(LazyTableWidget, { data, ...props }));
    },
    configEditor: TableConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.Table, { className: `!text-lg ${className}` }),
    sampleConfig: {
      dataArrayTemplate: "{{ctx.data}}",
      columns: [],
      pagination: {
        enabled: false,
        pageParam: "page",
        totalTemplate: "{{ctx.total}}"
      },
      search: {
        enabled: false,
        serverSide: false,
        placeholder: "Search..."
      },
      export: {
        enabled: false,
        format: "csv",
        serverSide: false,
        buttonLabel: "Export"
      },
      editing: {
        enabled: false
      },
      multiSelect: {
        enabled: false,
        showSelectAll: true,
        actions: []
      },
      bulkEdit: {
        enabled: false,
        saveLabel: "Save All Changes"
      },
      showHeader: true
    }
  },
  "text": {
    label: "Text / Markdown",
    value: import_widget_types.WIDGET_TYPES.TEXT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display text or markdown",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading text...") }, /* @__PURE__ */ import_react26.default.createElement(LazyTextWidget, { data, ...props }));
    },
    configEditor: TextConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.Type, { className: `!text-lg ${className}` }),
    sampleConfig: {
      content: "### Heading\n\nEdit this markdown in the properties tab.",
      format: "markdown",
      textAlign: "left",
      fontSize: "sm",
      showHeader: false
    }
  },
  "stat": {
    label: "Stat / KPI",
    value: import_widget_types.WIDGET_TYPES.STAT.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Display a metric / KPI card",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading stat...") }, /* @__PURE__ */ import_react26.default.createElement(LazyStatWidget, { data, ...props }));
    },
    configEditor: StatConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.TrendingUp, { className: `!text-lg ${className}` }),
    sampleConfig: {
      label: "Metric Label",
      valueTemplate: "42",
      prefix: "",
      suffix: "",
      trendTemplate: "",
      trendDirection: "up-is-good",
      textAlign: "center",
      showHeader: false
    }
  },
  "alert": {
    label: "Alert Banner",
    value: import_widget_types.WIDGET_TYPES.ALERT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display a colored banner message",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading alert...") }, /* @__PURE__ */ import_react26.default.createElement(LazyAlertWidget, { data, ...props }));
    },
    configEditor: AlertConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.AlertTriangle, { className: `!text-lg ${className}` }),
    sampleConfig: {
      title: "Notice",
      message: "This is a banner notice.",
      variant: "info",
      dismissible: true,
      showHeader: false
    }
  },
  "form": {
    label: "Form",
    value: import_widget_types.WIDGET_TYPES.FORM.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Capture user input and trigger workflows",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading form...") }, /* @__PURE__ */ import_react26.default.createElement(LazyFormWidget, { data, ...props }));
    },
    configEditor: FormConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.FileText, { className: `!text-lg ${className}` }),
    sampleConfig: {
      fields: [],
      submitLabel: "Submit",
      size: "default",
      showReset: false,
      showHeader: true
    }
  },
  "image": {
    label: "Image",
    value: import_widget_types.WIDGET_TYPES.IMAGE.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display an image",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading image...") }, /* @__PURE__ */ import_react26.default.createElement(LazyImageWidget, { data, ...props }));
    },
    configEditor: ImageConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.Image, { className: `!text-lg ${className}` }),
    sampleConfig: {
      src: "",
      alt: "Image Content",
      objectFit: "cover",
      borderRadius: "none",
      showHeader: false
    }
  },
  "iframe": {
    label: "IFrame Embed",
    value: import_widget_types.WIDGET_TYPES.IFRAME.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Embed an external webpage",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react26.default.createElement(import_react26.default.Suspense, { fallback: /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading embed...") }, /* @__PURE__ */ import_react26.default.createElement(LazyIframeWidget, { data, ...props }));
    },
    configEditor: IframeConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react26.default.createElement(import_lucide_react13.Globe, { className: `!text-lg ${className}` }),
    sampleConfig: {
      url: "",
      allowScripts: true,
      allowForms: true,
      allowPopups: false,
      allowSameOrigin: false,
      showHeader: false
    }
  }
};

// src/index.js
init_textWidget();
init_statWidget();
init_alertWidget();
init_formWidget();
init_imageWidget();
init_iframeWidget();
//# sourceMappingURL=index.cjs.map
