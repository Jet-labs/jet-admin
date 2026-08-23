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
      const isConfigLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      const showLoading = loading || isLoadingWorkflows || isConfigLoading;
      return /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, showLoading && !error && /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), error && !isLoadingWorkflows && /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center p-4 text-center pointer-events-none" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-1.5 rounded  bg-muted/30 px-4 py-2 text-xs font-medium text-foreground shadow-sm" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-muted-foreground" }, "\u26A0"), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-muted-foreground" }, error))), /* @__PURE__ */ import_react.default.createElement(
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
var import_react9, import_prop_types8, import_react_table, import_ui7, import_lucide_react8, exportToCSV, exportToJSON, EditableCell, TableWidget;
var init_tableWidget = __esm({
  "src/table/tableWidget.jsx"() {
    import_react9 = __toESM(require("react"));
    import_prop_types8 = __toESM(require("prop-types"));
    import_react_table = require("@tanstack/react-table");
    import_ui7 = require("@jet-admin/ui");
    import_lucide_react8 = require("lucide-react");
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
      const [value, setValue] = (0, import_react9.useState)(initialValue);
      const inputRef = (0, import_react9.useRef)(null);
      (0, import_react9.useEffect)(() => {
        setValue(initialValue);
      }, [initialValue]);
      (0, import_react9.useEffect)(() => {
        if (inputRef.current) inputRef.current.focus();
      }, []);
      const onBlur = () => {
        table.options.meta?.updateCellData(row.index, column.id, value);
      };
      return /* @__PURE__ */ import_react9.default.createElement(
        import_ui7.Input,
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
      const tableData = (0, import_react9.useMemo)(() => {
        if (processedData && typeof processedData === "object" && !Array.isArray(processedData)) return processedData;
        if (Array.isArray(processedData)) return { data: processedData, columns: [], pagination: { enabled: false } };
        return { data: [], columns: [], pagination: { enabled: false } };
      }, [processedData]);
      const rows = tableData.data || [];
      const isLoading = (0, import_react9.useMemo)(() => {
        if (tableData.isLoading !== void 0) {
          return tableData.isLoading === true || tableData.isLoading === "true";
        }
        if (widgetConfig?.isLoading !== void 0) {
          return widgetConfig.isLoading === true || widgetConfig.isLoading === "true";
        }
        return !!isLoadingWorkflows;
      }, [tableData.isLoading, widgetConfig?.isLoading, isLoadingWorkflows]);
      const configColumns = (0, import_react9.useMemo)(() => {
        const rawCols = tableData.columns?.length ? tableData.columns : widgetConfig?.columns?.length ? widgetConfig.columns : [];
        const mergedCols = rawCols.map((col) => {
          const colKey = col.key || col.id;
          const userCol = widgetConfig?.columns?.find((c) => {
            const uKey = c.key || c.id;
            return uKey && colKey && String(uKey).toLowerCase() === String(colKey).toLowerCase();
          });
          return userCol ? { key: colKey, id: colKey, ...col, ...userCol } : { key: colKey, id: colKey, ...col };
        });
        if (mergedCols.length > 0) return mergedCols;
        if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
          return Object.keys(rows[0]).map((k) => {
            const userCol = widgetConfig?.columns?.find((c) => {
              const uKey = c.key || c.id;
              return uKey && String(uKey).toLowerCase() === String(k).toLowerCase();
            });
            return { key: k, id: k, label: k, ...userCol };
          });
        }
        return [];
      }, [tableData.columns, widgetConfig?.columns, rows]);
      const paginationConfig = tableData.pagination?.enabled ? tableData.pagination : widgetConfig?.pagination?.enabled ? widgetConfig.pagination : null;
      const searchConfig = tableData.search || widgetConfig?.search || { enabled: false };
      const exportConfig = tableData.export || widgetConfig?.export || { enabled: false };
      const editingConfig = tableData.editing || widgetConfig?.editing || { enabled: false };
      const multiSelectConfig = tableData.multiSelect || widgetConfig?.multiSelect || { enabled: false };
      const bulkEditConfig = tableData.bulkEdit || widgetConfig?.bulkEdit || { enabled: false };
      const [globalFilter, setGlobalFilter] = (0, import_react9.useState)("");
      const [editingRowId, setEditingRowId] = (0, import_react9.useState)(null);
      const [rowDraft, setRowDraft] = (0, import_react9.useState)({});
      const [pendingEdits, setPendingEdits] = (0, import_react9.useState)({});
      const [editingCell, setEditingCell] = (0, import_react9.useState)(null);
      const [rowSelection, setRowSelection] = (0, import_react9.useState)({});
      const [pagination, setPagination] = (0, import_react9.useState)({ pageIndex: 0, pageSize: 10 });
      const clickTimeoutRef = (0, import_react9.useRef)(null);
      (0, import_react9.useEffect)(() => {
        return () => {
          if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        };
      }, []);
      (0, import_react9.useEffect)(() => {
        if (!searchConfig.enabled || !searchConfig.serverSide) return;
        const timer = setTimeout(() => {
          if (fireWidgetEvent) fireWidgetEvent("onSearch", { searchTerm: globalFilter });
        }, 300);
        return () => clearTimeout(timer);
      }, [globalFilter, searchConfig.serverSide, searchConfig.enabled, fireWidgetEvent]);
      const lastSyncSignatureRef = (0, import_react9.useRef)(null);
      (0, import_react9.useEffect)(() => {
        if (!setWidgetState) return;
        const selectedIndices = Object.keys(rowSelection).filter((k) => rowSelection[k]).map(Number);
        const signature = JSON.stringify([globalFilter, selectedIndices, pendingEdits]);
        if (lastSyncSignatureRef.current === signature) return;
        lastSyncSignatureRef.current = signature;
        setWidgetState((prev) => ({
          ...prev,
          searchTerm: globalFilter,
          selectedRowIndices: selectedIndices,
          selectedRows: selectedIndices.map((i) => rows[i]).filter(Boolean),
          pendingEdits
        }));
      }, [globalFilter, rowSelection, rows, pendingEdits, setWidgetState]);
      const columnDefs = (0, import_react9.useMemo)(() => {
        const defs = [];
        if (multiSelectConfig.enabled) {
          defs.push({
            id: "_select",
            header: ({ table: table2 }) => multiSelectConfig.showSelectAll ? /* @__PURE__ */ import_react9.default.createElement(
              import_ui7.Checkbox,
              {
                checked: table2.getIsAllPageRowsSelected(),
                onCheckedChange: (v) => table2.toggleAllPageRowsSelected(!!v),
                "aria-label": "Select all",
                className: "h-3.5 w-3.5"
              }
            ) : null,
            cell: ({ row }) => /* @__PURE__ */ import_react9.default.createElement(
              import_ui7.Checkbox,
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
            header: () => /* @__PURE__ */ import_react9.default.createElement("span", { className: "flex items-center gap-1" }, col.label || col.key, col.editable && (editingConfig.enabled || bulkEditConfig.enabled) && /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.Pencil, { className: "w-3 h-3 opacity-40" })),
            cell: ({ getValue, row, column, table: table2 }) => {
              const rowIdx = row.index;
              const colId = column.id;
              const { editingRowId: editingRowId2, rowDraft: rowDraft2, setRowDraft: setRowDraft2, pendingEdits: pendingEdits2, editingCell: editingCell2 } = table2.options.meta;
              const isRowEditing = editingConfig.enabled && editingRowId2 === rowIdx;
              const isCellEditing = bulkEditConfig.enabled && editingCell2?.rowIdx === rowIdx && editingCell2?.colId === colId;
              const pendingVal = pendingEdits2[rowIdx]?.[colId];
              const hasPending = pendingVal !== void 0;
              if (isRowEditing && (col.editable === true || col.editable === "true")) {
                return /* @__PURE__ */ import_react9.default.createElement(
                  import_ui7.Input,
                  {
                    value: rowDraft2[colId] ?? "",
                    onChange: (e) => setRowDraft2((prev) => ({ ...prev, [colId]: e.target.value })),
                    className: "h-7 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 rounded",
                    onClick: (e) => e.stopPropagation()
                  }
                );
              }
              if (isCellEditing && col.editable) {
                return /* @__PURE__ */ import_react9.default.createElement(EditableCell, { getValue, row, column, table: table2 });
              }
              const displayVal = hasPending ? pendingVal : getValue();
              return /* @__PURE__ */ import_react9.default.createElement("span", { className: hasPending ? "text-primary font-medium" : "" }, displayVal != null ? String(displayVal) : "\u2014", hasPending && /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.Pencil, { className: "inline-block w-3 h-3 ml-1 text-primary/60" }));
            },
            meta: { editable: col.editable }
          });
        });
        if (editingConfig.enabled) {
          defs.push({
            id: "_actions",
            header: () => null,
            cell: ({ row, table: table2 }) => {
              const rowIdx = row.index;
              const { editingRowId: editingRowId2, setEditingRowId: setEditingRowId2, setRowDraft: setRowDraft2, saveRow } = table2.options.meta;
              const isEditing = editingRowId2 === rowIdx;
              if (isEditing) {
                return /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-end gap-1", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react9.default.createElement(
                  import_ui7.Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6 text-primary hover:bg-primary/10",
                    onClick: () => saveRow(rowIdx, row.original)
                  },
                  /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.Check, { className: "h-3.5 w-3.5" })
                ), /* @__PURE__ */ import_react9.default.createElement(
                  import_ui7.Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-6 w-6 text-muted-foreground hover:text-foreground",
                    onClick: () => setEditingRowId2(null)
                  },
                  /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.X, { className: "h-3.5 w-3.5" })
                ));
              }
              return /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex justify-end", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react9.default.createElement(
                import_ui7.Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-6 w-6 text-muted-foreground/50 hover:text-foreground",
                  onClick: () => {
                    setEditingRowId2(rowIdx);
                    setRowDraft2({ ...row.original });
                  }
                },
                /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.Pencil, { className: "h-3.5 w-3.5" })
              ));
            },
            size: 70,
            enableSorting: false,
            enableGlobalFilter: false
          });
        }
        return defs;
      }, [configColumns, multiSelectConfig, editingConfig, bulkEditConfig]);
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
          },
          editingRowId,
          setEditingRowId,
          rowDraft,
          setRowDraft,
          editingCell,
          pendingEdits,
          saveRow: (idx, originalRow) => handleSaveRow(idx, originalRow)
        }
      });
      const [serverPage, setServerPage] = (0, import_react9.useState)(1);
      const serverPageSize = paginationConfig && rows.length > 0 ? rows.length : 10;
      const serverTotalRows = paginationConfig?.totalRows ?? rows.length;
      const serverTotalPages = paginationConfig ? Math.max(1, Math.ceil(serverTotalRows / serverPageSize)) : 1;
      const handleServerPageChange = (0, import_react9.useCallback)((newPage) => {
        if (newPage < 1 || newPage > serverTotalPages) return;
        setServerPage(newPage);
        const offset = (newPage - 1) * serverPageSize;
        if (fireWidgetEvent) fireWidgetEvent("onPageChange", { page: newPage, pageSize: serverPageSize, offset });
      }, [serverTotalPages, serverPageSize, fireWidgetEvent]);
      const handleExport = (0, import_react9.useCallback)(() => {
        const format3 = exportConfig.format || "csv";
        if (exportConfig.serverSide) {
          if (fireWidgetEvent) fireWidgetEvent("onExport", { format: format3, rowCount: rows.length });
          return;
        }
        const visibleRows = table.getFilteredRowModel().rows.map((r) => r.original);
        if (format3 === "json") exportToJSON(configColumns, visibleRows, `export-${Date.now()}.json`);
        else exportToCSV(configColumns, visibleRows, `export-${Date.now()}.csv`);
      }, [exportConfig, fireWidgetEvent, rows, table, configColumns]);
      const handleSaveRow = (0, import_react9.useCallback)((idx, originalRow) => {
        const changes = {};
        configColumns.forEach((c) => {
          if (c.editable && String(originalRow[c.key]) !== String(rowDraft[c.key])) {
            changes[c.key] = rowDraft[c.key];
          }
        });
        if (fireWidgetEvent) fireWidgetEvent("onRowSave", { rowIndex: idx, originalRow, updatedRow: { ...rowDraft }, changes });
        setEditingRowId(null);
      }, [configColumns, rowDraft, fireWidgetEvent]);
      const handleSaveBulkEdits = (0, import_react9.useCallback)(() => {
        const edits = Object.entries(pendingEdits).map(([rIdx, changes]) => ({
          rowIndex: Number(rIdx),
          originalRow: rows[Number(rIdx)],
          changes
        }));
        if (fireWidgetEvent) fireWidgetEvent("onBulkEdit", { edits });
        setPendingEdits({});
      }, [pendingEdits, rows, fireWidgetEvent]);
      const handleBulkAction = (0, import_react9.useCallback)((actionKey) => {
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
      const handleRowSelect = (0, import_react9.useCallback)((rowOriginal, rowIdx) => {
        if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedRowIndex: rowIdx, selectedRow: rowOriginal }));
        if (onRowSelect) onRowSelect(rowOriginal, rowIdx);
        if (fireWidgetEvent) fireWidgetEvent("onRowSelect", { row: rowOriginal, rowIndex: rowIdx });
      }, [setWidgetState, onRowSelect, fireWidgetEvent]);
      const rowsRef = (0, import_react9.useRef)(rows);
      (0, import_react9.useEffect)(() => {
        rowsRef.current = rows;
      }, [rows]);
      const widgetMethodsRef = (0, import_react9.useRef)(null);
      if (!widgetMethodsRef.current) {
        widgetMethodsRef.current = {
          refresh: () => {
            if (runWorkflow) runWorkflow();
            if (refreshData) refreshData();
          },
          setSelectedRow: (index) => {
            const i = Number(index);
            const currentRows = rowsRef.current;
            if (!isNaN(i) && i >= 0 && i < currentRows.length) {
              if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedRowIndex: i, selectedRow: currentRows[i] }));
              if (onRowSelect) onRowSelect(currentRows[i], i);
            }
          }
        };
      }
      (0, import_react9.useEffect)(() => {
        if (onWidgetInit) {
          onWidgetInit(widgetMethodsRef.current);
        }
      }, [onWidgetInit]);
      const showToolbar = searchConfig.enabled || exportConfig.enabled;
      const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;
      const pendingEditCount = Object.values(pendingEdits).reduce((s, c) => s + Object.keys(c).length, 0);
      const displayRowModels = paginationConfig ? table.getCoreRowModel().rows : table.getRowModel().rows;
      if (!rows.length) {
        return /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6" }, isLoading ? /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm shadow-sm border border-border" }, /* @__PURE__ */ import_react9.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react9.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Loading data...") : /* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("p", null, "No data available."), /* @__PURE__ */ import_react9.default.createElement("p", { className: "text-xs mt-1" }, "Ensure the data array template resolves to a non-empty array.")));
      }
      return /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-col w-full h-full min-h-0 overflow-hidden relative" }, isLoading && /* @__PURE__ */ import_react9.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react9.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react9.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), showToolbar && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 gap-3 flex-shrink-0" }, searchConfig.enabled ? /* @__PURE__ */ import_react9.default.createElement("div", { className: "relative flex-1 max-w-xs" }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" }), /* @__PURE__ */ import_react9.default.createElement(
        import_ui7.Input,
        {
          value: globalFilter ?? "",
          onChange: (e) => setGlobalFilter(e.target.value),
          placeholder: searchConfig.placeholder || "Search...",
          className: "h-7 text-xs pl-8 bg-background border-border rounded"
        }
      )) : /* @__PURE__ */ import_react9.default.createElement("div", null), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-2" }, exportConfig.enabled && /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: handleExport }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.FileDown, { className: "h-3.5 w-3.5 mr-1.5" }), exportConfig.buttonLabel || "Export"))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex-1 overflow-auto min-h-0" }, /* @__PURE__ */ import_react9.default.createElement("table", { className: "w-full text-sm border-collapse" }, /* @__PURE__ */ import_react9.default.createElement("thead", { className: "sticky top-0 z-10 bg-muted/50 backdrop-blur-sm" }, table.getHeaderGroups().map((hg) => /* @__PURE__ */ import_react9.default.createElement("tr", { key: hg.id }, hg.headers.map((header) => /* @__PURE__ */ import_react9.default.createElement(
        "th",
        {
          key: header.id,
          className: "text-left px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap select-none",
          style: header.column.getSize() ? { width: header.column.getSize() } : void 0
        },
        header.isPlaceholder ? null : (0, import_react_table.flexRender)(header.column.columnDef.header, header.getContext())
      ))))), /* @__PURE__ */ import_react9.default.createElement("tbody", null, displayRowModels.map((row) => {
        const rowIdx = row.index;
        const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
        const hasPendingEdits = !!pendingEdits[rowIdx];
        const isRowSelected = row.getIsSelected();
        return /* @__PURE__ */ import_react9.default.createElement(
          "tr",
          {
            key: row.id,
            className: `border-b border-border/50 last:border-b-0 cursor-pointer transition-colors ${isRowSelected ? "bg-primary/5" : isRowEditing ? "bg-primary/5" : hasPendingEdits ? "bg-primary/[0.03]" : widgetState?.selectedRowIndex === rowIdx ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`
          },
          row.getVisibleCells().map((cell) => {
            const isEditable = cell.column.columnDef.meta?.editable;
            const colId = cell.column.id;
            const isSpecialCol = colId === "_select" || colId === "_actions";
            return /* @__PURE__ */ import_react9.default.createElement(
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
      })))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "absolute bottom-12 left-0 right-0 px-4 flex flex-col gap-2 pointer-events-none z-30" }, multiSelectConfig.enabled && selectedCount > 0 && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-between bg-card border border-border shadow-md rounded p-3 pointer-events-auto" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs font-medium text-foreground px-2" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-primary font-medium" }, selectedCount), " row", selectedCount !== 1 ? "s" : "", " selected"), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-2" }, (multiSelectConfig.actions || []).map((act, i) => /* @__PURE__ */ import_react9.default.createElement(
        import_ui7.Button,
        {
          key: i,
          size: "sm",
          variant: act.variant === "destructive" ? "destructive" : "outline",
          className: "h-7 text-xs",
          onClick: () => handleBulkAction(act.actionKey)
        },
        act.label
      )))), bulkEditConfig.enabled && pendingEditCount > 0 && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-between bg-card border border-primary/30 shadow-md rounded p-3 pointer-events-auto" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs font-medium text-foreground px-2" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-primary font-medium" }, pendingEditCount), " unsaved change", pendingEditCount !== 1 ? "s" : ""), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { size: "sm", variant: "ghost", className: "h-7 text-xs text-muted-foreground", onClick: () => setPendingEdits({}) }, "Discard"), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { size: "sm", className: "h-7 text-xs", onClick: handleSaveBulkEdits }, bulkEditConfig.saveLabel || "Save All Changes")))), paginationConfig ? /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs text-muted-foreground" }, serverTotalRows, " total row", serverTotalRows !== 1 ? "s" : ""), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs text-muted-foreground mr-2" }, "Page ", serverPage, " of ", serverTotalPages), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(1), disabled: serverPage === 1 || isLoading }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronsLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverPage - 1), disabled: serverPage === 1 || isLoading }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverPage + 1), disabled: serverPage >= serverTotalPages || isLoading }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronRight, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleServerPageChange(serverTotalPages), disabled: serverPage >= serverTotalPages || isLoading }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronsRight, { className: "h-4 w-4" })))) : rows.length > 10 && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs text-muted-foreground" }, table.getFilteredRowModel().rows.length, " total row", table.getFilteredRowModel().rows.length !== 1 ? "s" : ""), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs text-muted-foreground mr-2" }, "Page ", table.getState().pagination.pageIndex + 1, " of ", table.getPageCount()), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronsLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage() }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronLeft, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.nextPage(), disabled: !table.getCanNextPage() }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronRight, { className: "h-4 w-4" })), /* @__PURE__ */ import_react9.default.createElement(import_ui7.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react8.ChevronsRight, { className: "h-4 w-4" })))));
    };
    TableWidget.propTypes = {
      widgetConfig: import_prop_types8.default.object,
      data: import_prop_types8.default.oneOfType([import_prop_types8.default.array, import_prop_types8.default.object]),
      runWorkflow: import_prop_types8.default.func,
      isLoadingWorkflows: import_prop_types8.default.bool,
      onWidgetInit: import_prop_types8.default.func,
      refreshData: import_prop_types8.default.func,
      widgetState: import_prop_types8.default.object,
      setWidgetState: import_prop_types8.default.func,
      onRowSelect: import_prop_types8.default.func,
      fireWidgetEvent: import_prop_types8.default.func
    };
  }
});

// src/table/tableConfigEditor.jsx
var import_react10, import_prop_types9, import_ui8, import_lucide_react9, import_ui9, import_expression_engine3, resolvePath, TableConfigEditor;
var init_tableConfigEditor = __esm({
  "src/table/tableConfigEditor.jsx"() {
    import_react10 = __toESM(require("react"));
    import_prop_types9 = __toESM(require("prop-types"));
    import_ui8 = require("@jet-admin/ui");
    import_lucide_react9 = require("lucide-react");
    import_ui9 = require("@jet-admin/ui");
    import_expression_engine3 = require("@jet-admin/expression-engine");
    resolvePath = (obj, path) => {
      if (!obj || !path) return void 0;
      return (0, import_expression_engine3.getValueByPath)(obj, path, { allowedRoots: ["state"] });
    };
    TableConfigEditor = ({ widgetEditorForm, stateTree }) => {
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
      const liveStateTree = (0, import_react10.useMemo)(() => stateTree ? { state: stateTree } : null, [stateTree]);
      const dataArrayPathStr = config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "";
      const dataArrayPath = dataArrayPathStr.replace(/^\{{\s*/, "").replace(/\s*}}$/, "");
      const discoveredColumns = (0, import_react10.useMemo)(() => {
        if (!stateTree || !dataArrayPath) return [];
        const resolved = resolvePath(stateTree, dataArrayPath);
        if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === "object") {
          return Object.keys(resolved[0]).map((key) => ({
            key,
            label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            type: typeof resolved[0][key]
          }));
        }
        return [];
      }, [stateTree, dataArrayPath]);
      const availableKeys = (0, import_react10.useMemo)(() => {
        return discoveredColumns.map((c) => c.key);
      }, [discoveredColumns]);
      const handleAddColumn = (0, import_react10.useCallback)(() => {
        widgetEditorForm.setFieldValue("widgetConfig.columns", [
          ...columns,
          { label: "New Column", key: "" }
        ]);
      }, [widgetEditorForm, columns]);
      const handleAutoPopulateColumns = (0, import_react10.useCallback)(() => {
        if (discoveredColumns.length === 0) return;
        const newColumns = discoveredColumns.map((col) => ({
          label: col.label,
          key: col.key
        }));
        widgetEditorForm.setFieldValue("widgetConfig.columns", newColumns);
      }, [widgetEditorForm, discoveredColumns]);
      const handleUpdateColumn = (0, import_react10.useCallback)(
        (index, field, value) => {
          const updated = [...columns];
          updated[index] = { ...updated[index], [field]: value };
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleRemoveColumn = (0, import_react10.useCallback)(
        (index) => {
          const updated = [...columns];
          updated.splice(index, 1);
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleMoveColumn = (0, import_react10.useCallback)(
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
      const handleAddBulkAction = (0, import_react10.useCallback)(() => {
        const currentActions = multiSelect.actions || [];
        widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", [
          ...currentActions,
          { label: "New Action", actionKey: `action_${currentActions.length + 1}`, variant: "default" }
        ]);
      }, [widgetEditorForm, multiSelect]);
      const handleUpdateBulkAction = (0, import_react10.useCallback)((index, field, value) => {
        const updated = [...multiSelect.actions || []];
        updated[index] = { ...updated[index], [field]: value };
        widgetEditorForm.setFieldValue("widgetConfig.multiSelect.actions", updated);
      }, [widgetEditorForm, multiSelect]);
      const handleRemoveBulkAction = (0, import_react10.useCallback)((index) => {
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
      return /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Data Array Template"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.TemplateAutocompleteInput,
        {
          value: config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "",
          onChange: (val) => handleConfigChange("dataArrayTemplate", val),
          placeholder: "e.g. {{ state.queries.my_query.data }}",
          liveStateTree
        }
      ), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[0.65rem] text-muted-foreground" }, "Mustache template evaluating to an array of objects.")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Total Count Template ", /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.TemplateAutocompleteInput,
        {
          value: pagination.totalTemplate || config.dataMapping?.totalCountPath || "",
          onChange: (val) => handlePaginationChange("totalTemplate", val),
          placeholder: "e.g. {{ state.queries.my_query.total }}",
          liveStateTree
        }
      ), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Used for server-side pagination. Leave empty to use array length.")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.TemplateAutocompleteInput,
        {
          value: config.isLoading || "",
          onChange: (val) => handleConfigChange("isLoading", val),
          placeholder: "e.g. {{ state.queries.my_query.isLoading }}",
          liveStateTree
        }
      ), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Mustache template evaluating to a boolean loading state."))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Table Columns"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex gap-1" }, discoveredColumns.length > 0 && /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAutoPopulateColumns,
          className: "h-7 text-xs px-2",
          title: "Auto-detect columns from data"
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Sparkles, { className: "mr-1 text-amber-500" }),
        " Auto-detect"
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAddColumn,
          className: "h-7 text-xs px-2"
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Plus, { className: "mr-1" }),
        " Add"
      ))), discoveredColumns.length > 0 && columns.length === 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Zap, { className: "w-3.5 h-3.5 shrink-0" }), /* @__PURE__ */ import_react10.default.createElement("span", null, /* @__PURE__ */ import_react10.default.createElement("strong", null, discoveredColumns.length), " fields detected from loaded data. Click ", /* @__PURE__ */ import_react10.default.createElement("strong", null, "Auto-detect"), " to populate columns.")), !dataArrayPath && columns.length === 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "text-center p-4 border border-dashed rounded text-muted-foreground text-xs" }, "Configure a Data Array Template above first, then come back here to set up columns."), dataArrayPath && discoveredColumns.length === 0 && columns.length === 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "text-center p-4 border border-dashed rounded text-muted-foreground text-xs leading-relaxed" }, "No columns detected from ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "font-mono bg-muted px-1 py-0.5 rounded text-primary" }, dataArrayPath), ".", /* @__PURE__ */ import_react10.default.createElement("br", null), /* @__PURE__ */ import_react10.default.createElement("br", null), "Make sure the expression points to an array of objects and that you have executed the data source in the App Page Editor, or add columns manually."), columns.length > 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, columns.map((col, idx) => /* @__PURE__ */ import_react10.default.createElement(
        "div",
        {
          key: idx,
          className: "flex flex-col gap-2 p-2 border rounded bg-muted/30"
        },
        /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-end gap-1.5" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col gap-0.5 pb-0.5" }, /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, -1),
            disabled: idx === 0,
            title: "Move up"
          },
          /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.ArrowUp, { className: "h-3.5 w-3.5" })
        ), /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, 1),
            disabled: idx === columns.length - 1,
            title: "Move down"
          },
          /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.ArrowDown, { className: "h-3.5 w-3.5" })
        )), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-[0.65rem]" }, "Header Label"), /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Input,
          {
            value: col.label,
            onChange: (e) => handleUpdateColumn(idx, "label", e.target.value),
            className: "h-7 text-xs",
            placeholder: "User Name"
          }
        )), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-[0.65rem]" }, "Data Key"), availableKeys.length > 0 ? /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Select,
          {
            value: col.key || "",
            onValueChange: (val) => handleUpdateColumn(idx, "key", val)
          },
          /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectValue, { placeholder: "Select field\u2026" })),
          /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectContent, null, availableKeys.map((key) => /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { key, value: key }, key)))
        ) : /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Input,
          {
            value: col.key,
            onChange: (e) => handleUpdateColumn(idx, "key", e.target.value),
            className: "h-7 text-xs font-mono",
            placeholder: "user_name"
          }
        )), /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10",
            onClick: () => handleRemoveColumn(idx),
            title: "Remove column"
          },
          /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Trash2, { className: "h-4 w-4" })
        )),
        /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center pl-8" }, /* @__PURE__ */ import_react10.default.createElement(
          import_ui8.Checkbox,
          {
            id: `col-edit-${idx}`,
            checked: !!col.editable,
            onCheckedChange: (val) => handleUpdateColumn(idx, "editable", !!val),
            className: "h-3.5 w-3.5"
          }
        ), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { htmlFor: `col-edit-${idx}`, className: "text-xs ml-1.5 text-muted-foreground cursor-pointer" }, "Editable Column"))
      )))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Pagination"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: pagination.enabled,
          onCheckedChange: handlePaginationToggle
        }
      )), pagination.enabled && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border mt-1" }, /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Configure pagination actions in the ", /* @__PURE__ */ import_react10.default.createElement("strong", null, "Events"), " tab using the ", /* @__PURE__ */ import_react10.default.createElement("strong", null, "On Page Change"), " event. Event data: ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-xs" }, "{{ event.page }}"), ",", " ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-xs" }, "{{ event.offset }}"), ",", " ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-xs" }, "{{ event.pageSize }}")))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "grid grid-cols-2 gap-2 border-t pt-2 mt-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Search Box"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: search.enabled,
          onCheckedChange: (v) => handleConfigChange("search", { ...search, enabled: v })
        }
      )), search.enabled && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Checkbox,
        {
          id: "search-server",
          checked: search.serverSide,
          onCheckedChange: (v) => handleConfigChange("search", { ...search, serverSide: !!v })
        }
      ), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { htmlFor: "search-server", className: "text-xs cursor-pointer" }, "Server-side (fires onSearch)")), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Input,
        {
          value: search.placeholder || "",
          onChange: (e) => handleConfigChange("search", { ...search, placeholder: e.target.value }),
          placeholder: "Search placeholder...",
          className: "h-7 text-xs"
        }
      ))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Export Data"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: exportConfig.enabled,
          onCheckedChange: (v) => handleConfigChange("export", { ...exportConfig, enabled: v })
        }
      )), exportConfig.enabled && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Checkbox,
        {
          id: "export-server",
          checked: exportConfig.serverSide,
          onCheckedChange: (v) => handleConfigChange("export", { ...exportConfig, serverSide: !!v })
        }
      ), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { htmlFor: "export-server", className: "text-xs cursor-pointer" }, "Server-side (fires onExport)")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Input,
        {
          value: exportConfig.buttonLabel || "",
          onChange: (e) => handleConfigChange("export", { ...exportConfig, buttonLabel: e.target.value }),
          placeholder: "Button Label",
          className: "h-7 text-xs flex-1"
        }
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Select,
        {
          value: exportConfig.format || "csv",
          onValueChange: (v) => handleConfigChange("export", { ...exportConfig, format: v })
        },
        /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectTrigger, { className: "h-7 text-xs w-[70px]" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectValue, null)),
        /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectContent, null, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { value: "csv" }, "CSV"), /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { value: "json" }, "JSON"))
      ))))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2 border-t pt-2 mt-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Multi-Row Selection"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: multiSelect.enabled,
          onCheckedChange: (v) => handleConfigChange("multiSelect", { ...multiSelect, enabled: v })
        }
      )), multiSelect.enabled && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2 bg-muted/30 p-2 rounded border" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 pb-2 border-b" }, /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Checkbox,
        {
          id: "ms-select-all",
          checked: multiSelect.showSelectAll,
          onCheckedChange: (v) => handleConfigChange("multiSelect", { ...multiSelect, showSelectAll: !!v })
        }
      ), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { htmlFor: "ms-select-all", className: "text-xs cursor-pointer" }, 'Show "Select All" Checkbox')), /* @__PURE__ */ import_react10.default.createElement("div", { className: "pt-1" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex justify-between items-center mb-2" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium" }, "Bulk Actions"), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Button, { type: "button", variant: "outline", size: "sm", onClick: handleAddBulkAction, className: "h-6 text-xs px-2" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Plus, { className: "mr-1 h-3 w-3" }), " Add Action")), (!multiSelect.actions || multiSelect.actions.length === 0) && /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-xs text-muted-foreground italic" }, "No bulk actions configured. Selection will be tracked in widgetState."), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, (multiSelect.actions || []).map((act, idx) => /* @__PURE__ */ import_react10.default.createElement("div", { key: idx, className: "flex items-center gap-1.5 bg-background p-1.5 rounded border" }, /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Input,
        {
          value: act.label,
          onChange: (e) => handleUpdateBulkAction(idx, "label", e.target.value),
          placeholder: "Label",
          className: "h-6 text-xs w-24"
        }
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Input,
        {
          value: act.actionKey,
          onChange: (e) => handleUpdateBulkAction(idx, "actionKey", e.target.value),
          placeholder: "actionKey",
          className: "h-6 text-xs font-mono flex-1"
        }
      ), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Select, { value: act.variant || "default", onValueChange: (v) => handleUpdateBulkAction(idx, "variant", v) }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectTrigger, { className: "h-6 text-xs w-20" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectValue, null)), /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectContent, null, /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { value: "destructive" }, "Danger"), /* @__PURE__ */ import_react10.default.createElement(import_ui8.SelectItem, { value: "outline" }, "Outline"))), /* @__PURE__ */ import_react10.default.createElement(import_ui8.Button, { type: "button", variant: "ghost", size: "icon", onClick: () => handleRemoveBulkAction(idx), className: "h-6 w-6 text-destructive shrink-0" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react9.Trash2, { className: "h-3 w-3" })))))))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "grid grid-cols-2 gap-2 border-t pt-2 mt-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Inline Row Editing"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: editing.enabled,
          onCheckedChange: (v) => {
            handleConfigChange("editing", { ...editing, enabled: v });
            if (v && bulkEdit.enabled) handleConfigChange("bulkEdit", { ...bulkEdit, enabled: false });
          }
        }
      )), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[9.5px] text-muted-foreground leading-tight" }, "Adds an Edit button to each row. Fires ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-background px-1 border rounded" }, "onRowSave"), ".", /* @__PURE__ */ import_react10.default.createElement("br", null), /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-amber-600 font-medium" }, "Note: Make sure to check 'Editable Column' for at least one column above."))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, "Excel-Style Bulk Edit"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Switch,
        {
          checked: bulkEdit.enabled,
          onCheckedChange: (v) => {
            handleConfigChange("bulkEdit", { ...bulkEdit, enabled: v });
            if (v && editing.enabled) handleConfigChange("editing", { ...editing, enabled: false });
          }
        }
      )), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[9.5px] text-muted-foreground leading-tight" }, "Double-click cells to edit. Fires ", /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-background px-1 border rounded" }, "onBulkEdit"), " on save.", /* @__PURE__ */ import_react10.default.createElement("br", null), /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-amber-600 font-medium" }, "Note: Make sure to check 'Editable Column' for at least one column above.")), bulkEdit.enabled && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1 bg-muted/30 p-2 rounded border mt-2" }, /* @__PURE__ */ import_react10.default.createElement(import_ui8.Label, { className: "text-xs" }, "Save Button Label"), /* @__PURE__ */ import_react10.default.createElement(
        import_ui8.Input,
        {
          value: bulkEdit.saveLabel || "Save All Changes",
          onChange: (e) => handleConfigChange("bulkEdit", { ...bulkEdit, saveLabel: e.target.value }),
          className: "h-7 text-xs"
        }
      )))));
    };
    TableConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types9.default.object.isRequired,
      dataSourceResults: import_prop_types9.default.object
    };
  }
});

// src/button/buttonConfigEditor.jsx
var import_react11, import_prop_types10, import_ui10, import_ui11, ButtonConfigEditor;
var init_buttonConfigEditor = __esm({
  "src/button/buttonConfigEditor.jsx"() {
    import_react11 = __toESM(require("react"));
    import_prop_types10 = __toESM(require("prop-types"));
    import_ui10 = require("@jet-admin/ui");
    import_ui11 = require("@jet-admin/ui");
    ButtonConfigEditor = ({ widgetEditorForm, stateTree }) => {
      const config = widgetEditorForm.values.widgetConfig || {};
      const liveStateTree = (0, import_react11.useMemo)(() => ({ state: stateTree }), [stateTree]);
      return /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Button Text"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui11.TemplateAutocompleteInput,
        {
          value: config.text || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.text", val),
          placeholder: "Click Me",
          liveStateTree
        }
      )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Variant"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Select,
        {
          value: config.variant || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
        },
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, { placeholder: "Select variant" })),
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "destructive" }, "Destructive"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "outline" }, "Outline"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "secondary" }, "Secondary"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "ghost" }, "Ghost"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "link" }, "Link"))
      )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Select,
        {
          value: config.size || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
        },
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, { placeholder: "Select size" })),
        /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { value: "icon" }, "Icon"))
      ))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react11.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react11.default.createElement(
        import_ui11.TemplateAutocompleteInput,
        {
          value: config.isLoading || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
          placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
          liveStateTree
        }
      )));
    };
    ButtonConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types10.default.object.isRequired,
      stateTree: import_prop_types10.default.object
    };
  }
});

// src/date-picker/datePickerConfigEditor.jsx
var import_react19, import_prop_types17, import_ui23, import_ui24, DatePickerConfigEditor;
var init_datePickerConfigEditor = __esm({
  "src/date-picker/datePickerConfigEditor.jsx"() {
    import_react19 = __toESM(require("react"));
    import_prop_types17 = __toESM(require("prop-types"));
    import_ui23 = require("@jet-admin/ui");
    import_ui24 = require("@jet-admin/ui");
    DatePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
      const config = widgetEditorForm.values.widgetConfig || {};
      const liveStateTree = (0, import_react19.useMemo)(() => ({ state: stateTree }), [stateTree]);
      return /* @__PURE__ */ import_react19.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react19.default.createElement(import_ui23.Label, { className: "text-xs font-medium text-foreground" }, "Label"), /* @__PURE__ */ import_react19.default.createElement(
        import_ui23.Input,
        {
          type: "text",
          className: "text-sm h-8",
          value: config.label || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value),
          placeholder: "e.g. Select date"
        }
      )), /* @__PURE__ */ import_react19.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react19.default.createElement(import_ui23.Label, { className: "text-xs font-medium text-foreground" }, "Placeholder"), /* @__PURE__ */ import_react19.default.createElement(
        import_ui23.Input,
        {
          type: "text",
          className: "text-sm h-8",
          value: config.placeholder || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.placeholder", e.target.value),
          placeholder: "Pick a date..."
        }
      )), /* @__PURE__ */ import_react19.default.createElement("div", { className: "flex items-center gap-2 pt-1" }, /* @__PURE__ */ import_react19.default.createElement(
        import_ui23.Checkbox,
        {
          id: "date-picker-enable-time",
          checked: !!config.enableTime,
          onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.enableTime", !!checked)
        }
      ), /* @__PURE__ */ import_react19.default.createElement(import_ui23.Label, { htmlFor: "date-picker-enable-time", className: "text-xs text-muted-foreground cursor-pointer" }, "Enable Time picking (granularity to hours, minutes, seconds)")), /* @__PURE__ */ import_react19.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react19.default.createElement(import_ui23.Label, { className: "text-xs font-medium text-foreground" }, "Default Value"), /* @__PURE__ */ import_react19.default.createElement(
        import_ui24.TemplateAutocompleteInput,
        {
          value: config.defaultValue || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.defaultValue", val),
          placeholder: "e.g. {{state.variables.myDate}} or ISO string",
          liveStateTree
        }
      )), /* @__PURE__ */ import_react19.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react19.default.createElement(import_ui23.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react19.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react19.default.createElement(
        import_ui24.TemplateAutocompleteInput,
        {
          value: config.isLoading || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
          placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
          liveStateTree
        }
      )));
    };
    DatePickerConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types17.default.object.isRequired,
      stateTree: import_prop_types17.default.object
    };
  }
});

// src/date-range-picker/dateRangePickerConfigEditor.jsx
var import_react20, import_prop_types18, import_ui25, import_ui26, DateRangePickerConfigEditor;
var init_dateRangePickerConfigEditor = __esm({
  "src/date-range-picker/dateRangePickerConfigEditor.jsx"() {
    import_react20 = __toESM(require("react"));
    import_prop_types18 = __toESM(require("prop-types"));
    import_ui25 = require("@jet-admin/ui");
    import_ui26 = require("@jet-admin/ui");
    DateRangePickerConfigEditor = ({ widgetEditorForm, stateTree }) => {
      const config = widgetEditorForm.values.widgetConfig || {};
      const liveStateTree = (0, import_react20.useMemo)(() => ({ state: stateTree }), [stateTree]);
      return /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "Label"), /* @__PURE__ */ import_react20.default.createElement(
        import_ui25.Input,
        {
          type: "text",
          className: "text-sm h-8",
          value: config.label || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value),
          placeholder: "e.g. Select date range"
        }
      )), /* @__PURE__ */ import_react20.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "Start Placeholder"), /* @__PURE__ */ import_react20.default.createElement(
        import_ui25.Input,
        {
          type: "text",
          className: "text-sm h-8",
          value: config.placeholderStart || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.placeholderStart", e.target.value),
          placeholder: "Start date"
        }
      )), /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "End Placeholder"), /* @__PURE__ */ import_react20.default.createElement(
        import_ui25.Input,
        {
          type: "text",
          className: "text-sm h-8",
          value: config.placeholderEnd || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.placeholderEnd", e.target.value),
          placeholder: "End date"
        }
      ))), /* @__PURE__ */ import_react20.default.createElement("div", { className: "flex items-center gap-2 pt-1" }, /* @__PURE__ */ import_react20.default.createElement(
        import_ui25.Checkbox,
        {
          id: "date-range-enable-time",
          checked: !!config.enableTime,
          onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.enableTime", !!checked)
        }
      ), /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { htmlFor: "date-range-enable-time", className: "text-xs text-muted-foreground cursor-pointer" }, "Enable Time picking (granularity to hours, minutes, seconds)")), /* @__PURE__ */ import_react20.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "Default Start"), /* @__PURE__ */ import_react20.default.createElement(
        import_ui26.TemplateAutocompleteInput,
        {
          value: config.defaultStart || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.defaultStart", val),
          placeholder: "e.g. {{state.variables.startDate}}",
          liveStateTree
        }
      )), /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "Default End"), /* @__PURE__ */ import_react20.default.createElement(
        import_ui26.TemplateAutocompleteInput,
        {
          value: config.defaultEnd || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.defaultEnd", val),
          placeholder: "e.g. {{state.variables.endDate}}",
          liveStateTree
        }
      ))), /* @__PURE__ */ import_react20.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react20.default.createElement(import_ui25.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react20.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react20.default.createElement(
        import_ui26.TemplateAutocompleteInput,
        {
          value: config.isLoading || "",
          onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
          placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
          liveStateTree
        }
      )));
    };
    DateRangePickerConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types18.default.object.isRequired,
      stateTree: import_prop_types18.default.object
    };
  }
});

// src/button/buttonWidget.jsx
var import_react22, import_prop_types20, import_ui28, ButtonWidget;
var init_buttonWidget = __esm({
  "src/button/buttonWidget.jsx"() {
    import_react22 = __toESM(require("react"));
    import_prop_types20 = __toESM(require("prop-types"));
    import_ui28 = require("@jet-admin/ui");
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
      const [loading, setLoading] = (0, import_react22.useState)(false);
      const text = widgetConfig?.text || "Click Me";
      const variant = widgetConfig?.variant || "default";
      const size = widgetConfig?.size || "default";
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
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
      return /* @__PURE__ */ import_react22.default.createElement(
        import_ui28.Button,
        {
          variant,
          size,
          onClick: handleClick,
          disabled: loading || isLoadingWorkflows || isLoading,
          className: "!w-[calc(100%+1rem)] !h-[calc(100%+0.75rem)] -ml-2 -mr-2 -mb-2 -mt-1 rounded-none flex items-center justify-center text-center px-4 border-0 relative"
        },
        isLoading && /* @__PURE__ */ import_react22.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react22.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react22.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react22.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")),
        (loading || isLoadingWorkflows) && /* @__PURE__ */ import_react22.default.createElement(import_ui28.Spinner, { className: "mr-2 h-4 w-4" }),
        text
      );
    };
    ButtonWidget.propTypes = {
      widgetTitle: import_prop_types20.default.string,
      widgetType: import_prop_types20.default.string,
      widgetConfig: import_prop_types20.default.object,
      onClick: import_prop_types20.default.func,
      isLoadingWorkflows: import_prop_types20.default.bool
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
var import_react23, import_prop_types21, parseMarkdown, inlineFormat, TextWidget;
var init_textWidget = __esm({
  "src/text/textWidget.jsx"() {
    import_react23 = __toESM(require("react"));
    import_prop_types21 = __toESM(require("prop-types"));
    parseMarkdown = (md) => {
      if (md === null || md === void 0) return "";
      let html = typeof md === "string" ? md : String(md);
      if (!html) return "";
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
      const content = widgetConfig?.content;
      const format3 = widgetConfig?.format || "markdown";
      const textAlign = widgetConfig?.textAlign || "left";
      const fontSize = widgetConfig?.fontSize || "sm";
      const renderedHTML = (0, import_react23.useMemo)(() => {
        if (content === null || content === void 0) return "";
        const stringContent = typeof content === "string" ? content : String(content);
        if (format3 === "plain") {
          return stringContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
        }
        return parseMarkdown(stringContent);
      }, [content, format3]);
      const fontSizeClass = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl"
      }[fontSize] || "text-sm";
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      return /* @__PURE__ */ import_react23.default.createElement(
        "div",
        {
          className: `jet-md-root w-full h-full overflow-auto p-3 ${fontSizeClass} relative`,
          style: { textAlign }
        },
        isLoading && /* @__PURE__ */ import_react23.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react23.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react23.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react23.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")),
        /* @__PURE__ */ import_react23.default.createElement("style", null, `
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
        /* @__PURE__ */ import_react23.default.createElement("div", { dangerouslySetInnerHTML: { __html: renderedHTML } })
      );
    };
    TextWidget.propTypes = {
      widgetConfig: import_prop_types21.default.object,
      data: import_prop_types21.default.any
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
var import_react24, import_prop_types22, import_lucide_react12, StatWidget;
var init_statWidget = __esm({
  "src/stat/statWidget.jsx"() {
    import_react24 = __toESM(require("react"));
    import_prop_types22 = __toESM(require("prop-types"));
    import_lucide_react12 = require("lucide-react");
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
      const displayValue = (0, import_react24.useMemo)(() => {
        if (rawValue === "" || rawValue === null || rawValue === void 0) return "\u2014";
        const num = Number(rawValue);
        if (!isNaN(num) && typeof rawValue !== "boolean") {
          return num.toLocaleString(void 0, { maximumFractionDigits: 2 });
        }
        return String(rawValue);
      }, [rawValue]);
      const trend = (0, import_react24.useMemo)(() => {
        if (rawTrend === "" || rawTrend === null || rawTrend === void 0) return null;
        const num = parseFloat(rawTrend);
        if (isNaN(num)) return { value: rawTrend, direction: "neutral" };
        return {
          value: `${num >= 0 ? "+" : ""}${num.toLocaleString(void 0, { maximumFractionDigits: 1 })}%`,
          direction: num > 0 ? "up" : num < 0 ? "down" : "neutral"
        };
      }, [rawTrend]);
      const trendColor = (0, import_react24.useMemo)(() => {
        if (!trend) return "";
        const { direction } = trend;
        if (direction === "neutral") return "text-muted-foreground";
        if (trendDirection === "up-is-good") {
          return direction === "up" ? "text-emerald-500" : "text-red-500";
        }
        return direction === "down" ? "text-emerald-500" : "text-red-500";
      }, [trend, trendDirection]);
      const TrendIcon = trend?.direction === "up" ? import_lucide_react12.TrendingUp : trend?.direction === "down" ? import_lucide_react12.TrendingDown : import_lucide_react12.Minus;
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      return /* @__PURE__ */ import_react24.default.createElement(
        "div",
        {
          className: "flex flex-col items-center justify-center w-full h-full p-4 gap-1 relative",
          style: { textAlign: align, alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }
        },
        isLoading && /* @__PURE__ */ import_react24.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react24.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react24.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")),
        /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none" }, label),
        /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex items-baseline gap-1" }, prefix && /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-lg font-medium text-muted-foreground" }, prefix), /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-3xl font-bold text-foreground tabular-nums tracking-tight" }, displayValue), suffix && /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-lg font-medium text-muted-foreground" }, suffix)),
        trend && /* @__PURE__ */ import_react24.default.createElement("div", { className: `flex items-center gap-1 mt-0.5 ${trendColor}` }, /* @__PURE__ */ import_react24.default.createElement(TrendIcon, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-xs font-semibold" }, trend.value))
      );
    };
    StatWidget.propTypes = {
      widgetConfig: import_prop_types22.default.object,
      data: import_prop_types22.default.any
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
var import_react25, import_prop_types23, import_lucide_react13, import_ui29, AlertWidget;
var init_alertWidget = __esm({
  "src/alert/alertWidget.jsx"() {
    import_react25 = __toESM(require("react"));
    import_prop_types23 = __toESM(require("prop-types"));
    import_lucide_react13 = require("lucide-react");
    import_ui29 = require("@jet-admin/ui");
    AlertWidget = ({
      widgetConfig,
      fireWidgetEvent
    }) => {
      const [dismissed, setDismissed] = (0, import_react25.useState)(false);
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
        info: import_lucide_react13.Info,
        success: import_lucide_react13.CheckCircle,
        warning: import_lucide_react13.AlertTriangle,
        error: import_lucide_react13.AlertCircle
      };
      const Icon = IconMap[variant] || import_lucide_react13.Info;
      const styles = {
        info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        error: "bg-rose-500/10 border-rose-500/20 text-rose-400"
      }[variant] || "bg-blue-500/10 border-blue-500/20 text-blue-400";
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      return /* @__PURE__ */ import_react25.default.createElement(
        "div",
        {
          className: `flex items-start gap-3 p-3.5 border rounded-none w-full h-full min-h-0 overflow-auto relative ${styles}`
        },
        isLoading && /* @__PURE__ */ import_react25.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react25.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react25.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react25.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")),
        /* @__PURE__ */ import_react25.default.createElement(Icon, { className: "h-5 w-5 shrink-0 mt-0.5" }),
        /* @__PURE__ */ import_react25.default.createElement("div", { className: "flex-1 min-w-0" }, title && /* @__PURE__ */ import_react25.default.createElement("h5", { className: "text-sm font-semibold mb-1 leading-none text-current" }, title), /* @__PURE__ */ import_react25.default.createElement("p", { className: "text-xs leading-relaxed text-current/80" }, message)),
        dismissible && /* @__PURE__ */ import_react25.default.createElement(
          import_ui29.Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-current hover:bg-current/10 -mt-1 -mr-1",
            onClick: handleDismiss,
            "aria-label": "Dismiss alert"
          },
          /* @__PURE__ */ import_react25.default.createElement(import_lucide_react13.X, { className: "h-4 w-4" })
        )
      );
    };
    AlertWidget.propTypes = {
      widgetConfig: import_prop_types23.default.object,
      fireWidgetEvent: import_prop_types23.default.func
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
var import_react26, import_prop_types24, import_ui30, FormWidget;
var init_formWidget = __esm({
  "src/form/formWidget.jsx"() {
    import_react26 = __toESM(require("react"));
    import_prop_types24 = __toESM(require("prop-types"));
    import_ui30 = require("@jet-admin/ui");
    FormWidget = ({
      widgetConfig,
      fireWidgetEvent
    }) => {
      const fields = widgetConfig?.fields || [];
      const submitLabel = widgetConfig?.submitLabel || "Submit";
      const size = widgetConfig?.size || "default";
      const showReset = widgetConfig?.showReset ?? false;
      const [formData, setFormData] = (0, import_react26.useState)({});
      (0, import_react26.useEffect)(() => {
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
        return /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs text-center" }, "No fields configured in form properties.");
      }
      const formSizeClass = {
        sm: "space-y-2.5 p-3 text-xs",
        default: "space-y-4 p-4 text-sm",
        lg: "space-y-5.5 p-5 text-base"
      }[size] || "space-y-4 p-4 text-sm";
      return /* @__PURE__ */ import_react26.default.createElement(
        "form",
        {
          onSubmit: handleSubmit,
          className: `w-full h-full overflow-auto flex flex-col justify-between ${formSizeClass}`
        },
        /* @__PURE__ */ import_react26.default.createElement("div", { className: "space-y-3.5" }, fields.map((field, idx) => {
          if (!field.key) return null;
          const fieldType = field.type || "text";
          const inputId = `form-field-${field.key}-${idx}`;
          return /* @__PURE__ */ import_react26.default.createElement("div", { key: idx, className: "space-y-1" }, fieldType !== "checkbox" && /* @__PURE__ */ import_react26.default.createElement(import_ui30.Label, { htmlFor: inputId, className: "text-xs font-semibold text-foreground" }, field.label || field.key, field.required && /* @__PURE__ */ import_react26.default.createElement("span", { className: "text-rose-500 ml-0.5" }, "*")), fieldType === "select" ? /* @__PURE__ */ import_react26.default.createElement(
            import_ui30.Select,
            {
              value: String(formData[field.key] ?? ""),
              onValueChange: (val) => handleFieldChange(field.key, val)
            },
            /* @__PURE__ */ import_react26.default.createElement(import_ui30.SelectTrigger, { id: inputId, className: "w-full text-xs" }, /* @__PURE__ */ import_react26.default.createElement(import_ui30.SelectValue, { placeholder: field.placeholder || "Select option..." })),
            /* @__PURE__ */ import_react26.default.createElement(import_ui30.SelectContent, null, (field.options || []).map((opt, oIdx) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const lbl = typeof opt === "object" ? opt.label : opt;
              return /* @__PURE__ */ import_react26.default.createElement(import_ui30.SelectItem, { key: oIdx, value: String(val) }, lbl);
            }))
          ) : fieldType === "checkbox" ? /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex items-center gap-2 py-1" }, /* @__PURE__ */ import_react26.default.createElement(
            import_ui30.Checkbox,
            {
              id: inputId,
              checked: !!formData[field.key],
              onCheckedChange: (checked) => handleFieldChange(field.key, !!checked)
            }
          ), /* @__PURE__ */ import_react26.default.createElement(import_ui30.Label, { htmlFor: inputId, className: "text-xs text-muted-foreground cursor-pointer" }, field.label || field.key, field.required && /* @__PURE__ */ import_react26.default.createElement("span", { className: "text-rose-500 ml-0.5" }, "*"))) : /* @__PURE__ */ import_react26.default.createElement(
            import_ui30.Input,
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
        /* @__PURE__ */ import_react26.default.createElement("div", { className: "flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-4" }, showReset && /* @__PURE__ */ import_react26.default.createElement(
          import_ui30.Button,
          {
            type: "button",
            variant: "outline",
            className: "h-8 text-xs font-semibold px-4",
            onClick: handleReset
          },
          "Reset"
        ), /* @__PURE__ */ import_react26.default.createElement(
          import_ui30.Button,
          {
            type: "submit",
            className: "h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
          },
          submitLabel
        ))
      );
    };
    FormWidget.propTypes = {
      widgetConfig: import_prop_types24.default.object,
      fireWidgetEvent: import_prop_types24.default.func
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
var import_react27, import_prop_types25, import_lucide_react14, ImageWidget;
var init_imageWidget = __esm({
  "src/image/imageWidget.jsx"() {
    import_react27 = __toESM(require("react"));
    import_prop_types25 = __toESM(require("prop-types"));
    import_lucide_react14 = require("lucide-react");
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
        return /* @__PURE__ */ import_react27.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5" }, /* @__PURE__ */ import_react27.default.createElement(import_lucide_react14.Image, { className: "h-5 w-5 opacity-60" }), /* @__PURE__ */ import_react27.default.createElement("span", null, "No image URL configured"));
      }
      const radiusClass = {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded",
        lg: "rounded-lg",
        full: "rounded-full"
      }[borderRadius] || "rounded-none";
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      return /* @__PURE__ */ import_react27.default.createElement("div", { className: "w-full h-full relative overflow-hidden flex items-center justify-center p-1 bg-transparent" }, isLoading && /* @__PURE__ */ import_react27.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react27.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react27.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react27.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), /* @__PURE__ */ import_react27.default.createElement(
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
      widgetConfig: import_prop_types25.default.object,
      fireWidgetEvent: import_prop_types25.default.func
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
var import_react28, import_prop_types26, import_lucide_react15, IframeWidget;
var init_iframeWidget = __esm({
  "src/iframe/iframeWidget.jsx"() {
    import_react28 = __toESM(require("react"));
    import_prop_types26 = __toESM(require("prop-types"));
    import_lucide_react15 = require("lucide-react");
    IframeWidget = ({
      widgetConfig
    }) => {
      const url = widgetConfig?.url || "";
      const allowSameOrigin = widgetConfig?.allowSameOrigin ?? false;
      const allowScripts = widgetConfig?.allowScripts ?? true;
      const allowForms = widgetConfig?.allowForms ?? true;
      const allowPopups = widgetConfig?.allowPopups ?? false;
      if (!url) {
        return /* @__PURE__ */ import_react28.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5" }, /* @__PURE__ */ import_react28.default.createElement(import_lucide_react15.Globe, { className: "h-5 w-5 opacity-60" }), /* @__PURE__ */ import_react28.default.createElement("span", null, "No iframe URL configured"));
      }
      const sandboxTokens = [];
      if (allowSameOrigin) sandboxTokens.push("allow-same-origin");
      if (allowScripts) sandboxTokens.push("allow-scripts");
      if (allowForms) sandboxTokens.push("allow-forms");
      if (allowPopups) sandboxTokens.push("allow-popups");
      const sandboxValue = sandboxTokens.join(" ");
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      return /* @__PURE__ */ import_react28.default.createElement("div", { className: "w-full h-full p-0 bg-background overflow-hidden relative" }, isLoading && /* @__PURE__ */ import_react28.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react28.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react28.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react28.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), /* @__PURE__ */ import_react28.default.createElement(
        "iframe",
        {
          src: url,
          className: "w-full h-full border-0 bg-background",
          sandbox: sandboxValue || void 0,
          referrerPolicy: "no-referrer-when-downgrade",
          title: "Embedded Content"
        }
      ));
    };
    IframeWidget.propTypes = {
      widgetConfig: import_prop_types26.default.object
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

// src/_shared/calendarUtils.js
function getCalendarDays(year, month) {
  const date = new Date(year, month, 1);
  const start = (0, import_date_fns.startOfWeek)((0, import_date_fns.startOfMonth)(date));
  const end = (0, import_date_fns.endOfWeek)((0, import_date_fns.endOfMonth)(date));
  return (0, import_date_fns.eachDayOfInterval)({ start, end });
}
function formatDateISO(date) {
  if (!date || !(0, import_date_fns.isValid)(date)) return "";
  return (0, import_date_fns.format)(date, "yyyy-MM-dd");
}
function formatDateTimeISO(date) {
  if (!date || !(0, import_date_fns.isValid)(date)) return "";
  return (0, import_date_fns.format)(date, "yyyy-MM-dd'T'HH:mm:ss");
}
function formatDisplayDate(date) {
  if (!date || !(0, import_date_fns.isValid)(date)) return "";
  return (0, import_date_fns.format)(date, "MMM d, yyyy");
}
function formatDisplayDateTime(date) {
  if (!date || !(0, import_date_fns.isValid)(date)) return "";
  return (0, import_date_fns.format)(date, "MMM d, yyyy \xB7 h:mm a");
}
function checkIsSameDay(a, b) {
  if (!a || !b || !(0, import_date_fns.isValid)(a) || !(0, import_date_fns.isValid)(b)) return false;
  return (0, import_date_fns.isSameDay)(a, b);
}
function checkIsInRange(date, start, end) {
  if (!date || !start || !end || !(0, import_date_fns.isValid)(date) || !(0, import_date_fns.isValid)(start) || !(0, import_date_fns.isValid)(end)) return false;
  return (0, import_date_fns.isWithinInterval)(date, { start, end });
}
function parseISOSafe(str) {
  if (!str) return null;
  const parsed = (0, import_date_fns.parseISO)(str);
  return (0, import_date_fns.isValid)(parsed) ? parsed : null;
}
var import_date_fns;
var init_calendarUtils = __esm({
  "src/_shared/calendarUtils.js"() {
    import_date_fns = require("date-fns");
  }
});

// src/_shared/calendarGrid.jsx
function CalendarGrid({
  month,
  year,
  selectedDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  onDayClick,
  onDayHover,
  onMonthChange,
  showNavigation = true,
  hideLeftArrow = false,
  hideRightArrow = false
}) {
  const days = getCalendarDays(year, month);
  const currentMonthDate = new Date(year, month, 1);
  const today = /* @__PURE__ */ new Date();
  return /* @__PURE__ */ import_react29.default.createElement("div", { className: "w-[252px]" }, showNavigation && /* @__PURE__ */ import_react29.default.createElement("div", { className: "flex justify-between items-center mb-4 px-1" }, !hideLeftArrow ? /* @__PURE__ */ import_react29.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onMonthChange(-1),
      className: "p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
    },
    /* @__PURE__ */ import_react29.default.createElement(import_lucide_react16.ChevronLeft, { className: "w-4 h-4" })
  ) : /* @__PURE__ */ import_react29.default.createElement("div", { className: "w-6 h-6" }), /* @__PURE__ */ import_react29.default.createElement("div", { className: "font-semibold text-sm" }, (0, import_date_fns2.format)(currentMonthDate, "MMMM yyyy")), !hideRightArrow ? /* @__PURE__ */ import_react29.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onMonthChange(1),
      className: "p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
    },
    /* @__PURE__ */ import_react29.default.createElement(import_lucide_react16.ChevronRight, { className: "w-4 h-4" })
  ) : /* @__PURE__ */ import_react29.default.createElement("div", { className: "w-6 h-6" })), /* @__PURE__ */ import_react29.default.createElement("div", { className: "grid grid-cols-7 gap-1 text-center mb-2" }, ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => /* @__PURE__ */ import_react29.default.createElement("div", { key: day, className: "text-xs text-muted-foreground font-medium" }, day))), /* @__PURE__ */ import_react29.default.createElement("div", { className: "grid grid-cols-7 gap-y-1 text-center" }, days.map((day, i) => {
    const isCurrentMonth = (0, import_date_fns2.isSameMonth)(day, currentMonthDate);
    const isSelected = checkIsSameDay(day, selectedDate);
    const isStart = checkIsSameDay(day, rangeStart);
    const isEnd = checkIsSameDay(day, rangeEnd);
    const isRange = rangeStart && rangeEnd && checkIsInRange(day, rangeStart, rangeEnd);
    const isHoverRange = rangeStart && !rangeEnd && hoverDate && checkIsInRange(day, rangeStart, hoverDate) && day > rangeStart;
    const isToday = checkIsSameDay(day, today);
    let bgClass = "";
    let textClass = isCurrentMonth ? "text-foreground" : "text-muted-foreground/50";
    let roundedClass = "rounded";
    if (isSelected || isStart || isEnd) {
      bgClass = "bg-primary";
      textClass = "text-primary-foreground font-medium";
      if (isStart && rangeEnd) roundedClass = "rounded-l-md rounded-r-none";
      if (isEnd && rangeStart) roundedClass = "rounded-r-md rounded-l-none";
    } else if (isRange || isHoverRange) {
      bgClass = "bg-primary/20";
      roundedClass = "rounded-none";
    }
    return /* @__PURE__ */ import_react29.default.createElement(
      "button",
      {
        key: i,
        type: "button",
        onClick: () => onDayClick?.(day),
        onMouseEnter: () => onDayHover?.(day),
        className: `h-8 w-8 text-sm flex items-center justify-center ${bgClass} ${textClass} ${roundedClass} ${isToday && !isSelected && !isStart && !isEnd ? "border border-primary/50" : ""} hover:bg-primary/80 hover:text-primary-foreground transition-colors`
      },
      (0, import_date_fns2.format)(day, "d")
    );
  })));
}
var import_react29, import_lucide_react16, import_date_fns2;
var init_calendarGrid = __esm({
  "src/_shared/calendarGrid.jsx"() {
    import_react29 = __toESM(require("react"));
    import_lucide_react16 = require("lucide-react");
    import_date_fns2 = require("date-fns");
    init_calendarUtils();
  }
});

// src/_shared/timeInput.jsx
function TimeInput({ hours = 0, minutes = 0, seconds = 0, onChange }) {
  const handleChange = (field, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    if (field === "hours") {
      if (num > 23) num = 0;
      if (num < 0) num = 23;
    } else {
      if (num > 59) num = 0;
      if (num < 0) num = 59;
    }
    onChange({ hours, minutes, seconds, [field]: num });
  };
  const handleKeyDown = (e, field, value) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleChange(field, value + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleChange(field, value - 1);
    }
  };
  const pad = (n) => String(n).padStart(2, "0");
  return /* @__PURE__ */ import_react30.default.createElement("div", { className: "flex items-center gap-2 justify-center border-t border-border pt-3 mt-3" }, /* @__PURE__ */ import_react30.default.createElement(import_lucide_react17.Clock, { className: "w-4 h-4 text-muted-foreground mr-1" }), /* @__PURE__ */ import_react30.default.createElement(
    import_ui31.Input,
    {
      type: "text",
      value: pad(hours),
      onChange: (e) => handleChange("hours", e.target.value),
      onKeyDown: (e) => handleKeyDown(e, "hours", hours),
      className: "w-12 h-8 text-center px-1"
    }
  ), /* @__PURE__ */ import_react30.default.createElement("span", { className: "text-muted-foreground" }, ":"), /* @__PURE__ */ import_react30.default.createElement(
    import_ui31.Input,
    {
      type: "text",
      value: pad(minutes),
      onChange: (e) => handleChange("minutes", e.target.value),
      onKeyDown: (e) => handleKeyDown(e, "minutes", minutes),
      className: "w-12 h-8 text-center px-1"
    }
  ), /* @__PURE__ */ import_react30.default.createElement("span", { className: "text-muted-foreground" }, ":"), /* @__PURE__ */ import_react30.default.createElement(
    import_ui31.Input,
    {
      type: "text",
      value: pad(seconds),
      onChange: (e) => handleChange("seconds", e.target.value),
      onKeyDown: (e) => handleKeyDown(e, "seconds", seconds),
      className: "w-12 h-8 text-center px-1"
    }
  ));
}
var import_react30, import_ui31, import_lucide_react17;
var init_timeInput = __esm({
  "src/_shared/timeInput.jsx"() {
    import_react30 = __toESM(require("react"));
    import_ui31 = require("@jet-admin/ui");
    import_lucide_react17 = require("lucide-react");
  }
});

// src/date-picker/datePickerWidget.jsx
function DatePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState }) {
  const [currentDate, setCurrentDate] = (0, import_react31.useState)(/* @__PURE__ */ new Date());
  const parsedValue = (0, import_react31.useMemo)(() => parseISOSafe(widgetState?.value), [widgetState?.value]);
  (0, import_react31.useEffect)(() => {
    if (!widgetState?.value && widgetConfig.defaultValue) {
      const parsed = parseISOSafe(widgetConfig.defaultValue);
      if (parsed) {
        updateState(parsed);
      }
    }
  }, [widgetConfig.defaultValue, widgetState?.value]);
  (0, import_react31.useEffect)(() => {
    if (parsedValue) {
      setCurrentDate(parsedValue);
    }
  }, [parsedValue]);
  const updateState = (date) => {
    if (!date) {
      if (setWidgetState) {
        setWidgetState({ value: "", date: "", time: "", isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear");
        fireWidgetEvent("onChange", { value: "", date: "", time: "" });
      }
      return;
    }
    const enableTime = !!widgetConfig.enableTime;
    const value = enableTime ? formatDateTimeISO(date) : formatDateISO(date);
    const dateStr = formatDateISO(date);
    const timeStr = enableTime ? formatDateTimeISO(date).split("T")[1] : "";
    if (setWidgetState) {
      setWidgetState({ value, date: dateStr, time: timeStr });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent("onChange", { value, date: dateStr, time: timeStr });
    }
  };
  const handleDayClick = (day) => {
    let newDate = day;
    if (parsedValue && widgetConfig.enableTime) {
      newDate = (0, import_date_fns3.setHours)(newDate, parsedValue.getHours());
      newDate = (0, import_date_fns3.setMinutes)(newDate, parsedValue.getMinutes());
      newDate = (0, import_date_fns3.setSeconds)(newDate, parsedValue.getSeconds());
    }
    updateState(newDate);
    if (!widgetConfig.enableTime) {
      if (setWidgetState) {
        setWidgetState({ isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClose");
      }
    }
  };
  const handleTimeChange = ({ hours, minutes, seconds }) => {
    let newDate = parsedValue || /* @__PURE__ */ new Date();
    newDate = (0, import_date_fns3.setHours)(newDate, hours);
    newDate = (0, import_date_fns3.setMinutes)(newDate, minutes);
    newDate = (0, import_date_fns3.setSeconds)(newDate, seconds);
    updateState(newDate);
  };
  const displayValue = parsedValue ? widgetConfig.enableTime ? formatDisplayDateTime(parsedValue) : formatDisplayDate(parsedValue) : "";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  return /* @__PURE__ */ import_react31.default.createElement("div", { className: "relative flex flex-col gap-1.5 w-full h-full min-h-0" }, isLoading && /* @__PURE__ */ import_react31.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded" }, /* @__PURE__ */ import_react31.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react31.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react31.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), widgetConfig.label && /* @__PURE__ */ import_react31.default.createElement(import_ui32.Label, null, widgetConfig.label), /* @__PURE__ */ import_react31.default.createElement(import_ui32.Popover, { open: !!widgetState?.isOpen, onOpenChange: (open) => {
    if (setWidgetState) {
      setWidgetState({ isOpen: open });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent(open ? "onOpen" : "onClose");
    }
  } }, /* @__PURE__ */ import_react31.default.createElement(import_ui32.PopoverTrigger, { asChild: true }, /* @__PURE__ */ import_react31.default.createElement("div", { className: "relative w-full" }, /* @__PURE__ */ import_react31.default.createElement(
    import_ui32.Input,
    {
      readOnly: true,
      placeholder: widgetConfig.placeholder || "Select date...",
      value: displayValue,
      className: "pl-9 pr-8 cursor-pointer"
    }
  ), /* @__PURE__ */ import_react31.default.createElement(import_lucide_react18.Calendar, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), parsedValue && /* @__PURE__ */ import_react31.default.createElement(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        updateState(null);
      },
      className: "absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
    },
    /* @__PURE__ */ import_react31.default.createElement(import_lucide_react18.X, { className: "h-4 w-4" })
  ))), /* @__PURE__ */ import_react31.default.createElement(import_ui32.PopoverContent, { className: "w-auto p-3", align: "start" }, /* @__PURE__ */ import_react31.default.createElement(
    CalendarGrid,
    {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      selectedDate: parsedValue,
      onDayClick: handleDayClick,
      onMonthChange: (delta) => setCurrentDate((0, import_date_fns3.setMonth)(currentDate, currentDate.getMonth() + delta))
    }
  ), widgetConfig.enableTime && /* @__PURE__ */ import_react31.default.createElement(
    TimeInput,
    {
      hours: parsedValue?.getHours() || 0,
      minutes: parsedValue?.getMinutes() || 0,
      seconds: parsedValue?.getSeconds() || 0,
      onChange: handleTimeChange
    }
  ))));
}
var import_react31, import_prop_types27, import_ui32, import_lucide_react18, import_date_fns3;
var init_datePickerWidget = __esm({
  "src/date-picker/datePickerWidget.jsx"() {
    import_react31 = __toESM(require("react"));
    import_prop_types27 = __toESM(require("prop-types"));
    import_ui32 = require("@jet-admin/ui");
    import_lucide_react18 = require("lucide-react");
    init_calendarGrid();
    init_timeInput();
    init_calendarUtils();
    import_date_fns3 = require("date-fns");
    DatePickerWidget.propTypes = {
      widgetConfig: import_prop_types27.default.object,
      fireWidgetEvent: import_prop_types27.default.func,
      widgetState: import_prop_types27.default.object,
      setWidgetState: import_prop_types27.default.func
    };
  }
});

// src/date-picker/index.js
var date_picker_exports = {};
__export(date_picker_exports, {
  DatePickerConfigEditor: () => DatePickerConfigEditor,
  DatePickerWidget: () => DatePickerWidget
});
var init_date_picker = __esm({
  "src/date-picker/index.js"() {
    init_datePickerWidget();
    init_datePickerConfigEditor();
  }
});

// src/date-range-picker/dateRangePickerWidget.jsx
function DateRangePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState }) {
  const [currentDate, setCurrentDate] = (0, import_react32.useState)(/* @__PURE__ */ new Date());
  const [hoverDate, setHoverDate] = (0, import_react32.useState)(null);
  const parsedStart = (0, import_react32.useMemo)(() => parseISOSafe(widgetState?.start), [widgetState?.start]);
  const parsedEnd = (0, import_react32.useMemo)(() => parseISOSafe(widgetState?.end), [widgetState?.end]);
  (0, import_react32.useEffect)(() => {
    if (!widgetState?.start && !widgetState?.end && (widgetConfig.defaultStart || widgetConfig.defaultEnd)) {
      const start = parseISOSafe(widgetConfig.defaultStart);
      const end = parseISOSafe(widgetConfig.defaultEnd);
      if (start || end) {
        updateState(start, end);
      }
    }
  }, [widgetConfig.defaultStart, widgetConfig.defaultEnd, widgetState?.start, widgetState?.end]);
  (0, import_react32.useEffect)(() => {
    if (parsedStart) {
      setCurrentDate(parsedStart);
    }
  }, [parsedStart]);
  const updateState = (start, end) => {
    if (!start && !end) {
      if (setWidgetState) {
        setWidgetState({ start: "", end: "", startDate: "", endDate: "", isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear");
        fireWidgetEvent("onChange", { start: "", end: "", startDate: "", endDate: "" });
      }
      return;
    }
    const enableTime = !!widgetConfig.enableTime;
    const startVal = start ? enableTime ? formatDateTimeISO(start) : formatDateISO(start) : "";
    const endVal = end ? enableTime ? formatDateTimeISO(end) : formatDateISO(end) : "";
    const startDateStr = start ? formatDateISO(start) : "";
    const endDateStr = end ? formatDateISO(end) : "";
    if (setWidgetState) {
      setWidgetState({ start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr });
    }
    if (start && end && fireWidgetEvent) {
      fireWidgetEvent("onChange", { start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr });
    }
  };
  const handleDayClick = (day) => {
    if (!parsedStart || parsedStart && parsedEnd) {
      let newStart = day;
      if (parsedStart && widgetConfig.enableTime) {
        newStart = (0, import_date_fns4.setHours)(newStart, parsedStart.getHours());
        newStart = (0, import_date_fns4.setMinutes)(newStart, parsedStart.getMinutes());
        newStart = (0, import_date_fns4.setSeconds)(newStart, parsedStart.getSeconds());
      }
      updateState(newStart, null);
    } else {
      let newEnd = day;
      let newStart = parsedStart;
      if (day < parsedStart) {
        newEnd = parsedStart;
        newStart = day;
      }
      if (widgetConfig.enableTime) {
        newEnd = (0, import_date_fns4.setHours)(newEnd, parsedEnd ? parsedEnd.getHours() : 23);
        newEnd = (0, import_date_fns4.setMinutes)(newEnd, parsedEnd ? parsedEnd.getMinutes() : 59);
        newEnd = (0, import_date_fns4.setSeconds)(newEnd, parsedEnd ? parsedEnd.getSeconds() : 59);
      }
      updateState(newStart, newEnd);
      if (!widgetConfig.enableTime) {
        if (setWidgetState) {
          setWidgetState({ isOpen: false });
        }
        if (fireWidgetEvent) {
          fireWidgetEvent("onClose");
        }
      }
    }
  };
  const handleTimeChange = (type, { hours, minutes, seconds }) => {
    if (type === "start" && parsedStart) {
      let newStart = (0, import_date_fns4.setHours)(parsedStart, hours);
      newStart = (0, import_date_fns4.setMinutes)(newStart, minutes);
      newStart = (0, import_date_fns4.setSeconds)(newStart, seconds);
      updateState(newStart, parsedEnd);
    } else if (type === "end" && parsedEnd) {
      let newEnd = (0, import_date_fns4.setHours)(parsedEnd, hours);
      newEnd = (0, import_date_fns4.setMinutes)(newEnd, minutes);
      newEnd = (0, import_date_fns4.setSeconds)(newEnd, seconds);
      updateState(parsedStart, newEnd);
    }
  };
  const handlePresetClick = (preset) => {
    const today = /* @__PURE__ */ new Date();
    let start, end;
    if (preset.startOffset === "startOfMonth") start = (0, import_date_fns4.startOfMonth)(today);
    else if (preset.startOffset === "startOfYear") start = (0, import_date_fns4.startOfYear)(today);
    else start = (0, import_date_fns4.addDays)(today, preset.startOffset || 0);
    if (preset.endOffset === "endOfMonth") end = (0, import_date_fns4.endOfMonth)(today);
    else if (preset.endOffset === "endOfYear") end = (0, import_date_fns4.endOfYear)(today);
    else end = (0, import_date_fns4.addDays)(today, preset.endOffset || 0);
    if (end) {
      end = (0, import_date_fns4.setHours)(end, 23);
      end = (0, import_date_fns4.setMinutes)(end, 59);
      end = (0, import_date_fns4.setSeconds)(end, 59);
    }
    updateState(start, end);
    if (setWidgetState) {
      setWidgetState({ isOpen: false });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent("onClose");
    }
  };
  const displayStart = parsedStart ? widgetConfig.enableTime ? formatDisplayDateTime(parsedStart) : formatDisplayDate(parsedStart) : "";
  const displayEnd = parsedEnd ? widgetConfig.enableTime ? formatDisplayDateTime(parsedEnd) : formatDisplayDate(parsedEnd) : "";
  const nextMonthDate = (0, import_date_fns4.setMonth)(new Date(currentDate), currentDate.getMonth() + 1);
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  return /* @__PURE__ */ import_react32.default.createElement("div", { className: "relative flex flex-col gap-1.5 w-full h-full min-h-0" }, isLoading && /* @__PURE__ */ import_react32.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded" }, /* @__PURE__ */ import_react32.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react32.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react32.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating...")), widgetConfig.label && /* @__PURE__ */ import_react32.default.createElement(import_ui33.Label, null, widgetConfig.label), /* @__PURE__ */ import_react32.default.createElement(import_ui33.Popover, { open: !!widgetState?.isOpen, onOpenChange: (open) => {
    if (setWidgetState) {
      setWidgetState({ isOpen: open });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent(open ? "onOpen" : "onClose");
    }
  } }, /* @__PURE__ */ import_react32.default.createElement(import_ui33.PopoverTrigger, { asChild: true }, /* @__PURE__ */ import_react32.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react32.default.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ import_react32.default.createElement(
    import_ui33.Input,
    {
      readOnly: true,
      placeholder: widgetConfig.placeholderStart || "Start date",
      value: displayStart,
      className: "pl-9 cursor-pointer"
    }
  ), /* @__PURE__ */ import_react32.default.createElement(import_lucide_react19.CalendarRange, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" })), /* @__PURE__ */ import_react32.default.createElement(import_lucide_react19.ArrowRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ import_react32.default.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ import_react32.default.createElement(
    import_ui33.Input,
    {
      readOnly: true,
      placeholder: widgetConfig.placeholderEnd || "End date",
      value: displayEnd,
      className: "pl-9 pr-8 cursor-pointer"
    }
  ), /* @__PURE__ */ import_react32.default.createElement(import_lucide_react19.CalendarRange, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), (parsedStart || parsedEnd) && /* @__PURE__ */ import_react32.default.createElement(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        updateState(null, null);
      },
      className: "absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
    },
    /* @__PURE__ */ import_react32.default.createElement(import_lucide_react19.X, { className: "h-4 w-4" })
  )))), /* @__PURE__ */ import_react32.default.createElement(import_ui33.PopoverContent, { className: "w-auto p-0 flex flex-col", align: "start" }, /* @__PURE__ */ import_react32.default.createElement("div", { className: "flex p-3 gap-4" }, /* @__PURE__ */ import_react32.default.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ import_react32.default.createElement(
    CalendarGrid,
    {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      rangeStart: parsedStart,
      rangeEnd: parsedEnd,
      hoverDate,
      onDayClick: handleDayClick,
      onDayHover: setHoverDate,
      onMonthChange: (delta) => setCurrentDate((0, import_date_fns4.setMonth)(new Date(currentDate), currentDate.getMonth() + delta)),
      hideRightArrow: true
    }
  ), widgetConfig.enableTime && parsedStart && /* @__PURE__ */ import_react32.default.createElement(
    TimeInput,
    {
      hours: parsedStart.getHours(),
      minutes: parsedStart.getMinutes(),
      seconds: parsedStart.getSeconds(),
      onChange: (time) => handleTimeChange("start", time)
    }
  )), /* @__PURE__ */ import_react32.default.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ import_react32.default.createElement(
    CalendarGrid,
    {
      month: nextMonthDate.getMonth(),
      year: nextMonthDate.getFullYear(),
      rangeStart: parsedStart,
      rangeEnd: parsedEnd,
      hoverDate,
      onDayClick: handleDayClick,
      onDayHover: setHoverDate,
      onMonthChange: (delta) => setCurrentDate((0, import_date_fns4.setMonth)(new Date(currentDate), currentDate.getMonth() + delta)),
      hideLeftArrow: true
    }
  ), widgetConfig.enableTime && parsedEnd && /* @__PURE__ */ import_react32.default.createElement(
    TimeInput,
    {
      hours: parsedEnd.getHours(),
      minutes: parsedEnd.getMinutes(),
      seconds: parsedEnd.getSeconds(),
      onChange: (time) => handleTimeChange("end", time)
    }
  ))), widgetConfig.presets && widgetConfig.presets.length > 0 && /* @__PURE__ */ import_react32.default.createElement("div", { className: "border-t border-border p-3 flex flex-wrap gap-2 bg-muted/30" }, widgetConfig.presets.map((preset, i) => /* @__PURE__ */ import_react32.default.createElement(import_ui33.Button, { key: i, variant: "outline", size: "sm", onClick: () => handlePresetClick(preset) }, preset.label))))));
}
var import_react32, import_prop_types28, import_ui33, import_lucide_react19, import_date_fns4;
var init_dateRangePickerWidget = __esm({
  "src/date-range-picker/dateRangePickerWidget.jsx"() {
    import_react32 = __toESM(require("react"));
    import_prop_types28 = __toESM(require("prop-types"));
    import_ui33 = require("@jet-admin/ui");
    import_lucide_react19 = require("lucide-react");
    init_calendarGrid();
    init_timeInput();
    init_calendarUtils();
    import_date_fns4 = require("date-fns");
    DateRangePickerWidget.propTypes = {
      widgetConfig: import_prop_types28.default.object,
      fireWidgetEvent: import_prop_types28.default.func,
      widgetState: import_prop_types28.default.object,
      setWidgetState: import_prop_types28.default.func
    };
  }
});

// src/date-range-picker/index.js
var date_range_picker_exports = {};
__export(date_range_picker_exports, {
  DateRangePickerConfigEditor: () => DateRangePickerConfigEditor,
  DateRangePickerWidget: () => DateRangePickerWidget
});
var init_date_range_picker = __esm({
  "src/date-range-picker/index.js"() {
    init_dateRangePickerWidget();
    init_dateRangePickerConfigEditor();
  }
});

// src/html/htmlWidget.jsx
var import_react33, import_prop_types29, HtmlWidget;
var init_htmlWidget = __esm({
  "src/html/htmlWidget.jsx"() {
    import_react33 = __toESM(require("react"));
    import_prop_types29 = __toESM(require("prop-types"));
    HtmlWidget = ({
      widgetID,
      widgetConfig,
      onWidgetInit,
      fireWidgetEvent
    }) => {
      const iframeRef = (0, import_react33.useRef)(null);
      const html = widgetConfig?.html || "";
      const css = widgetConfig?.css || "";
      const allowScripts = widgetConfig?.allowScripts === true || widgetConfig?.allowScripts === "true";
      const allowForms = widgetConfig?.allowForms === true || widgetConfig?.allowForms === "true";
      const allowPopups = widgetConfig?.allowPopups === true || widgetConfig?.allowPopups === "true";
      const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
      (0, import_react33.useEffect)(() => {
        const handleMessage = (event) => {
          if (event.data && event.data.type === "jet-html-message" && event.data.widgetID === widgetID) {
            if (fireWidgetEvent) {
              fireWidgetEvent("onMessage", {
                data: event.data.payload || {}
              });
            }
          }
        };
        window.addEventListener("message", handleMessage);
        return () => {
          window.removeEventListener("message", handleMessage);
        };
      }, [widgetID, fireWidgetEvent]);
      (0, import_react33.useEffect)(() => {
        if (onWidgetInit) {
          onWidgetInit({
            refresh: () => {
              if (iframeRef.current) {
                const currentSrcDoc = iframeRef.current.srcDoc;
                iframeRef.current.srcDoc = "";
                setTimeout(() => {
                  if (iframeRef.current) {
                    iframeRef.current.srcDoc = currentSrcDoc;
                  }
                }, 50);
              }
            }
          });
        }
      }, [onWidgetInit]);
      const sandboxTokens = (0, import_react33.useMemo)(() => {
        const tokens = [];
        if (allowScripts) tokens.push("allow-scripts");
        if (allowForms) tokens.push("allow-forms");
        if (allowPopups) tokens.push("allow-popups");
        return tokens.join(" ") || void 0;
      }, [allowScripts, allowForms, allowPopups]);
      const srcDocContent = (0, import_react33.useMemo)(() => {
        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: transparent;
              color: var(--foreground, #ffffff);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
      }, [html, css]);
      return /* @__PURE__ */ import_react33.default.createElement("div", { className: "w-full h-full relative overflow-hidden bg-background" }, isLoading && /* @__PURE__ */ import_react33.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react33.default.createElement("div", { className: "flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border" }, /* @__PURE__ */ import_react33.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react33.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Loading...")), /* @__PURE__ */ import_react33.default.createElement(
        "iframe",
        {
          ref: iframeRef,
          srcDoc: srcDocContent,
          sandbox: sandboxTokens,
          referrerPolicy: "no-referrer",
          className: "w-full h-full border-0 bg-transparent block",
          title: "Custom HTML Embed"
        }
      ));
    };
    HtmlWidget.propTypes = {
      widgetID: import_prop_types29.default.string,
      widgetConfig: import_prop_types29.default.shape({
        html: import_prop_types29.default.string,
        css: import_prop_types29.default.string,
        allowScripts: import_prop_types29.default.oneOfType([import_prop_types29.default.bool, import_prop_types29.default.string]),
        allowForms: import_prop_types29.default.oneOfType([import_prop_types29.default.bool, import_prop_types29.default.string]),
        allowPopups: import_prop_types29.default.oneOfType([import_prop_types29.default.bool, import_prop_types29.default.string]),
        isLoading: import_prop_types29.default.oneOfType([import_prop_types29.default.bool, import_prop_types29.default.string])
      }),
      onWidgetInit: import_prop_types29.default.func,
      fireWidgetEvent: import_prop_types29.default.func
    };
  }
});

// src/html/index.js
var html_exports = {};
__export(html_exports, {
  HtmlWidget: () => HtmlWidget
});
var init_html = __esm({
  "src/html/index.js"() {
    init_htmlWidget();
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  AlertConfigEditor: () => AlertConfigEditor,
  AlertWidget: () => AlertWidget,
  DatePickerConfigEditor: () => DatePickerConfigEditor,
  DatePickerWidget: () => DatePickerWidget,
  DateRangePickerConfigEditor: () => DateRangePickerConfigEditor,
  DateRangePickerWidget: () => DateRangePickerWidget,
  FormConfigEditor: () => FormConfigEditor,
  FormWidget: () => FormWidget,
  HtmlConfigEditor: () => HtmlConfigEditor,
  HtmlWidget: () => HtmlWidget,
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
  WidgetEditorContext: () => WidgetEditorContext,
  getDemoData: () => getDemoData,
  registerWidgets: () => registerWidgets
});
module.exports = __toCommonJS(index_exports);
init_vega();

// src/vega/vegaConfigEditor.jsx
var import_react8 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));

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
var import_ui5 = require("@jet-admin/ui");

// src/vega/vegaSpecEditor.jsx
var import_react2 = __toESM(require("react"));
var import_prop_types = __toESM(require("prop-types"));
var import_expression_engine = require("@jet-admin/expression-engine");
var import_ui = require("@jet-admin/ui");
var import_lucide_react = require("lucide-react");
var VEGA_TEMPLATES = {
  empty: {
    name: "Empty",
    icon: import_lucide_react.Code,
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
    icon: import_lucide_react.BarChart,
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
    icon: import_lucide_react.LineChart,
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
    icon: import_lucide_react.PieChart,
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
    icon: import_lucide_react.ScatterChart,
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
    icon: import_lucide_react.BarChart,
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
var getValuePreview = (obj, path) => {
  const v = (0, import_expression_engine.getValueByPath)(obj, path);
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
  disabled = false
}) => {
  const [showTemplates, setShowTemplates] = (0, import_react2.useState)(false);
  const [parseError, setParseError] = (0, import_react2.useState)(null);
  const monacoRef = (0, import_react2.useRef)(null);
  const valueRef = (0, import_react2.useRef)(value);
  const isInternalChange = (0, import_react2.useRef)(false);
  (0, import_react2.useEffect)(() => {
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
  const valueString = (0, import_react2.useMemo)(() => toJson(value), [value]);
  const handleEditorChange = (0, import_react2.useCallback)((newValue) => {
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
  (0, import_react2.useEffect)(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;
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
          if ("state".startsWith(partial)) {
            suggestions.push({
              label: "state",
              kind: monaco.languages.CompletionItemKind.Module,
              detail: "Global State Tree",
              insertText: "state.",
              range
            });
          }
        }
        if (workflowContext) {
          const stateMatch = lineText.match(/\{\{state\.([a-zA-Z0-9_\[\].]*)$/);
          if (stateMatch) {
            const partial = stateMatch[1];
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
        }
        return { suggestions };
      }
    });
    return () => disposable.dispose();
  }, [workflowContext]);
  const applyTemplate = (0, import_react2.useCallback)((key) => {
    const t = VEGA_TEMPLATES[key];
    if (t) {
      onChange(t.spec);
      setParseError(null);
    }
  }, [onChange]);
  const contextVarCount = workflowContext ? Object.keys(workflowContext).length : 0;
  const hasError = Boolean(parseError);
  const headerExtra = /* @__PURE__ */ import_react2.default.createElement(
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
    /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.BarChart, { size: 9 }),
    "Templates"
  );
  const headerLeft = contextVarCount > 0 ? /* @__PURE__ */ import_react2.default.createElement("span", { style: S.badge("accent") }, contextVarCount, " ctx vars") : null;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col" }, showTemplates && /* @__PURE__ */ import_react2.default.createElement("div", { style: S.templateGrid, className: "border border-b-0 rounded-t-md" }, Object.entries(VEGA_TEMPLATES).map(([key, tpl]) => {
    const Icon = tpl.icon;
    return /* @__PURE__ */ import_react2.default.createElement(
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
      /* @__PURE__ */ import_react2.default.createElement(Icon, { size: 14 }),
      tpl.name
    );
  })), /* @__PURE__ */ import_react2.default.createElement(
    import_ui.CodeEditor,
    {
      value: valueString,
      onChange: handleEditorChange,
      language: "json",
      disabled,
      title: "Vega-Lite",
      titleIcon: /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Code, { style: { color: "var(--we-bg-accent, #6366f1)", fontSize: 13 } }),
      status: hasError ? "error" : "valid",
      statusMessage: parseError ? `Parse error: ${parseError}` : null,
      headerLeft,
      headerExtra,
      className: showTemplates ? "rounded-t-none" : "",
      onMount: (e, m) => {
        monacoRef.current = m;
      },
      footerHint: workflowContext ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, "Type ", /* @__PURE__ */ import_react2.default.createElement("code", { className: "font-mono bg-muted px-1 rounded" }, "{{"), " to autocomplete data sources or context") : null
    }
  ));
};
VegaSpecEditor.propTypes = {
  value: import_prop_types.default.object,
  onChange: import_prop_types.default.func.isRequired,
  onError: import_prop_types.default.func,
  workflowContext: import_prop_types.default.object,
  placeholder: import_prop_types.default.string,
  disabled: import_prop_types.default.bool,
  theme: import_prop_types.default.oneOf(["light", "dark"])
};

// src/vega/shelfBuilder.jsx
var import_react7 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));

// src/vega/dataFieldPanel.jsx
var import_react4 = __toESM(require("react"));
var import_prop_types3 = __toESM(require("prop-types"));

// src/vega/fieldPill.jsx
var import_react3 = __toESM(require("react"));
var import_prop_types2 = __toESM(require("prop-types"));

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
    if (Array.isArray(dataSource)) {
      return { values: dataSource };
    }
    if (typeof dataSource === "object" && dataSource !== null) {
      if (Array.isArray(dataSource.data)) {
        return { values: dataSource.data };
      }
      return { values: [dataSource] };
    }
    return { values: [dataSource] };
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
var flattenFieldsRecursive = (value, prefix = "", visited = /* @__PURE__ */ new WeakSet(), maxDepth = 5, results = []) => {
  if (maxDepth <= 0) return results;
  if (results.length > 500) return results;
  if (value === null || value === void 0) return results;
  if (typeof value === "object") {
    if (visited.has(value)) return results;
    visited.add(value);
  }
  if (Array.isArray(value)) {
    if (prefix) {
      results.push({
        name: prefix,
        type: "nominal",
        icon: "[]"
      });
    }
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
      flattenFieldsRecursive(value[0], prefix ? `${prefix}.0` : "0", visited, maxDepth - 1, results);
    }
    return results;
  }
  if (typeof value === "object") {
    if (prefix) {
      results.push({
        name: prefix,
        type: "nominal",
        icon: "{}"
      });
    }
    for (const key of Object.keys(value)) {
      if (results.length > 500) return results;
      const childPath = prefix ? `${prefix}.${key}` : key;
      const childVal = value[key];
      if (childVal === null || childVal === void 0) {
        results.push({ name: childPath, type: "nominal", icon: getFieldTypeIcon("nominal") });
      } else if (Array.isArray(childVal) || typeof childVal === "object") {
        flattenFieldsRecursive(childVal, childPath, visited, maxDepth - 1, results);
      } else {
        const type = inferFieldType(childVal, key, []);
        results.push({ name: childPath, type, icon: getFieldTypeIcon(type) });
      }
    }
    return results;
  }
  if (prefix) {
    const type = inferFieldType(value, prefix, []);
    results.push({ name: prefix, type, icon: getFieldTypeIcon(type) });
  }
  return results;
};
var inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  if (typeof sample !== "object" || sample === null) return [];
  const sampleRows = data.slice(0, 5);
  const mergedSample = {};
  for (const row of sampleRows) {
    if (row && typeof row === "object") {
      for (const key of Object.keys(row)) {
        if (mergedSample[key] === void 0 || mergedSample[key] === null) {
          mergedSample[key] = row[key];
        }
      }
    }
  }
  return flattenFieldsRecursive(mergedSample);
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
var import_lucide_react2 = require("lucide-react");
var getTypeIconComponent = (type) => {
  switch (type) {
    case "quantitative":
      return /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Hash, { className: "w-3 h-3 shrink-0" });
    case "temporal":
      return /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Calendar, { className: "w-3 h-3 shrink-0" });
    case "ordinal":
      return /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.ArrowUpDown, { className: "w-3 h-3 shrink-0" });
    case "nominal":
    default:
      return /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Type, { className: "w-3 h-3 shrink-0" });
  }
};
var getTypeClass = (type) => {
  switch (type) {
    case "quantitative":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "temporal":
      return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "ordinal":
      return "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25";
    case "nominal":
    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/25";
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
  const typeClass = getTypeClass(field.type);
  const handleDragStart = (0, import_react3.useCallback)((e) => {
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  }, [field]);
  const handleDragEnd = (0, import_react3.useCallback)((e) => {
    e.currentTarget.style.opacity = "1";
  }, []);
  return /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onClick,
      className: `flex items-center gap-1.5 rounded font-medium cursor-grab border transition-colors hover:brightness-110 max-w-full min-w-0 ${typeClass} ${isCompact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-[11px]"} ${isDragging ? "opacity-50" : ""} ${className}`,
      title: `${field.name} (${field.type})`
    },
    getTypeIconComponent(field.type),
    /* @__PURE__ */ import_react3.default.createElement("span", { className: "truncate min-w-0" }, field.name),
    field.aggregate && field.aggregate !== "none" && /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-[8px] uppercase tracking-wider bg-background/10 px-1 py-px rounded font-bold ml-auto shrink-0", title: `Aggregate: ${field.aggregate}` }, field.aggregate.slice(0, 3)),
    onRemove && /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        type: "button",
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "ml-auto h-3.5 w-3.5 rounded flex items-center justify-center hover:bg-background/20 shrink-0",
        title: "Remove"
      },
      /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.X, { className: "w-2.5 h-2.5" })
    )
  );
};
FieldPill.propTypes = {
  field: import_prop_types2.default.shape({
    name: import_prop_types2.default.string.isRequired,
    type: import_prop_types2.default.string.isRequired,
    icon: import_prop_types2.default.string,
    aggregate: import_prop_types2.default.string
  }).isRequired,
  onRemove: import_prop_types2.default.func,
  onClick: import_prop_types2.default.func,
  isDragging: import_prop_types2.default.bool,
  isCompact: import_prop_types2.default.bool,
  className: import_prop_types2.default.string
};

// src/vega/dataFieldPanel.jsx
var import_ui2 = require("@jet-admin/ui");
var import_lucide_react3 = require("lucide-react");
var import_expression_engine2 = require("@jet-admin/expression-engine");
var DataFieldPanel = ({
  queryResults,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = "",
  compact = false,
  stateTree,
  liveStateTree
}) => {
  const [searchTerm, setSearchTerm] = (0, import_react4.useState)("");
  const [manualField, setManualField] = (0, import_react4.useState)("");
  const [showManualAdd, setShowManualAdd] = (0, import_react4.useState)(false);
  const [showSuggestions, setShowSuggestions] = (0, import_react4.useState)(false);
  const suggestionsRef = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const allSuggestions = (0, import_react4.useMemo)(() => {
    const seen = /* @__PURE__ */ new Set();
    const combined = [];
    const stateTreeSuggestions = (0, import_expression_engine2.getJsSuggestions)({
      stateTree: liveStateTree
    });
    const arraySuggestions = stateTreeSuggestions.filter((s) => s.type === "array");
    for (const arr of arraySuggestions) {
      let bracePath = arr.value;
      if (!bracePath.startsWith("{{")) {
        bracePath = `{{${bracePath}}}`;
      }
      if (!seen.has(bracePath)) {
        seen.add(bracePath);
        combined.push({
          path: bracePath,
          label: bracePath,
          source: "runtime",
          description: arr.detail || "Runtime data array"
        });
      }
    }
    return combined;
  }, [liveStateTree]);
  const fields = (0, import_react4.useMemo)(() => {
    if (!dataSource) return [];
    const match = dataSource.match(/\{\{([^}]+)\}\}/);
    if (!match) return [];
    const rawPath = match[1];
    const toFields = (data) => {
      if (Array.isArray(data) && data.length > 0) return inferFieldsFromData(data);
      if (data && typeof data === "object" && !Array.isArray(data)) return inferFieldsFromData([data]);
      return null;
    };
    if (stateTree) {
      const resolved = (0, import_expression_engine2.getValueByPath)(stateTree, rawPath, { allowedRoots: ["state"] });
      const result = toFields(resolved);
      if (result) return result;
    }
    if (queryResults) {
      const resolved = (0, import_expression_engine2.getValueByPath)(queryResults, rawPath, { allowedRoots: ["state"] });
      const result = toFields(resolved);
      if (result) return result;
    }
    return [];
  }, [stateTree, queryResults, dataSource]);
  const filteredFields = (0, import_react4.useMemo)(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter((f) => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);
  const quantFields = (0, import_react4.useMemo)(() => filteredFields.filter((f) => f.type === "quantitative"), [filteredFields]);
  const catFields = (0, import_react4.useMemo)(() => filteredFields.filter((f) => f.type === "nominal" || f.type === "ordinal"), [filteredFields]);
  const tempFields = (0, import_react4.useMemo)(() => filteredFields.filter((f) => f.type === "temporal"), [filteredFields]);
  const handleSelectSuggestion = (0, import_react4.useCallback)((suggestion) => {
    onDataSourceChange?.(suggestion.path);
    setShowSuggestions(false);
  }, [onDataSourceChange]);
  const handleAddManualField = (0, import_react4.useCallback)(() => {
    if (!manualField.trim()) return;
    if (onFieldClick) {
      onFieldClick({ name: manualField.trim(), type: "nominal", icon: "Abc" });
    }
    setManualField("");
    setShowManualAdd(false);
  }, [manualField, onFieldClick]);
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "node":
        return /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.GitMerge, { className: "w-3 h-3 shrink-0 text-emerald-500" });
      case "output":
        return /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.ArrowRightFromLine, { className: "w-3 h-3 shrink-0 text-fuchsia-500" });
      case "runtime":
        return /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Zap, { className: "w-3 h-3 shrink-0 text-amber-500" });
      case "datasource":
        return /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-blue-500" });
      default:
        return /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-muted-foreground" });
    }
  };
  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "mb-2.5 last:mb-0" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: `text-[9px] font-bold uppercase tracking-widest mb-1 px-0.5 ${colorClass}` }, label, " ", /* @__PURE__ */ import_react4.default.createElement("span", { className: "opacity-60" }, "(", groupFields.length, ")")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col gap-0.5" }, groupFields.map((field) => /* @__PURE__ */ import_react4.default.createElement(
      FieldPill,
      {
        key: field.name,
        field,
        onClick: () => onFieldClick?.(field),
        className: "w-full justify-start"
      }
    ))));
  };
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: `flex flex-col bg-background ${className}` }, !compact && /* @__PURE__ */ import_react4.default.createElement("div", { className: "px-2.5 py-2 border-b border-border/50 bg-muted/20" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-1.5 mb-1.5" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 text-muted-foreground" }), /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest" }, "Data Source")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "relative", ref: suggestionsRef }, /* @__PURE__ */ import_react4.default.createElement(
    import_ui2.Input,
    {
      type: "text",
      value: dataSource || "",
      onChange: (e) => onDataSourceChange?.(e.target.value),
      onFocus: () => setShowSuggestions(true),
      placeholder: "Select or type a data path...",
      className: "w-full text-[11px] font-mono h-7",
      title: "Workflow data source path"
    }
  ), showSuggestions && allSuggestions.length > 0 && /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded shadow-xl z-50 max-h-48 overflow-y-auto" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "px-2.5 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/50 sticky top-0" }, "Variables (", allSuggestions.length, ")"), allSuggestions.map((s, i) => /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      key: `${s.path}-${i}`,
      onClick: () => handleSelectSuggestion(s),
      className: `w-full text-left px-2.5 py-1.5 text-[11px] border-b border-border/30 flex items-center gap-2 transition-colors cursor-pointer ${dataSource === s.path ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted"}`
    },
    getCategoryIcon(s.source || s.category),
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "font-mono truncate flex-1 min-w-0 text-foreground" }, s.label),
    s.source === "runtime" && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[8px] font-bold text-amber-500 bg-amber-500/15 px-1 py-px rounded shrink-0 uppercase tracking-wider" }, "LIVE")
  )))), dataSource && fields.length > 0 && /* @__PURE__ */ import_react4.default.createElement("div", { className: "mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-primary" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Zap, { className: "w-2.5 h-2.5" }), fields.length, " fields")), compact && fields.length > 0 && /* @__PURE__ */ import_react4.default.createElement("div", { className: "px-2.5 py-1.5 flex items-center justify-between bg-muted/20" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 text-muted-foreground" }), /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest" }, "Fields")), /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full" }, fields.length)), fields.length > 5 && /* @__PURE__ */ import_react4.default.createElement("div", { className: "px-2.5 py-1.5 border-b border-border/30" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-1.5 bg-muted/40 border border-border/50 rounded px-2 py-1 focus-within:ring-1 focus-within:ring-ring transition-shadow" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Search, { className: "w-3 h-3 text-muted-foreground shrink-0" }), /* @__PURE__ */ import_react4.default.createElement(
    import_ui2.Input,
    {
      type: "text",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Filter...",
      className: "flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 h-4 p-0"
    }
  ))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex-1 overflow-y-auto px-2.5 py-2 min-h-0" }, fields.length > 0 ? /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, renderFieldGroup(quantFields, "Measures", "text-emerald-500"), renderFieldGroup(catFields, "Dimensions", "text-blue-500"), renderFieldGroup(tempFields, "Temporal", "text-amber-500")) : /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col items-center justify-center py-3 text-center" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Database, { className: "w-5 h-5 mb-1 text-muted-foreground/25" }), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-xs text-muted-foreground" }, dataSource ? "Run workflow to detect fields" : "Select a data source")), showManualAdd ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "mt-2 flex flex-col gap-1" }, /* @__PURE__ */ import_react4.default.createElement(
    import_ui2.Input,
    {
      type: "text",
      value: manualField,
      onChange: (e) => setManualField(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleAddManualField(),
      placeholder: "field_name",
      className: "w-full text-xs font-mono h-6",
      autoFocus: true
    }
  ), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-1 justify-end" }, /* @__PURE__ */ import_react4.default.createElement(import_ui2.Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setShowManualAdd(false), className: "h-5 px-1.5 text-[9px] text-muted-foreground" }, "Cancel"), /* @__PURE__ */ import_react4.default.createElement(import_ui2.Button, { type: "button", size: "sm", onClick: handleAddManualField, className: "h-5 px-1.5 text-[9px]" }, "Add"))) : /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowManualAdd(true),
      className: "w-full mt-2 flex items-center justify-center gap-1 py-1 rounded border border-dashed border-border/50 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border transition-colors"
    },
    /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Plus, { className: "w-3 h-3" }),
    "Add Field"
  )));
};
DataFieldPanel.propTypes = {
  queryResults: import_prop_types3.default.object,
  dataSource: import_prop_types3.default.string,
  onDataSourceChange: import_prop_types3.default.func,
  onFieldClick: import_prop_types3.default.func,
  workflow: import_prop_types3.default.object,
  className: import_prop_types3.default.string,
  compact: import_prop_types3.default.bool,
  stateTree: import_prop_types3.default.object,
  liveStateTree: import_prop_types3.default.object
};

// src/vega/encodingShelf.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types4 = __toESM(require("prop-types"));
var import_lucide_react4 = require("lucide-react");
var import_ui3 = require("@jet-admin/ui");
var CHANNEL_CONFIG = {
  x: { label: "X", Icon: import_lucide_react4.MoveHorizontal },
  y: { label: "Y", Icon: import_lucide_react4.MoveVertical },
  color: { label: "Color", Icon: import_lucide_react4.Palette },
  size: { label: "Size", Icon: import_lucide_react4.Circle },
  shape: { label: "Shape", Icon: import_lucide_react4.Diamond },
  opacity: { label: "Opacity", Icon: import_lucide_react4.Contrast },
  row: { label: "Row", Icon: import_lucide_react4.Rows },
  column: { label: "Col", Icon: import_lucide_react4.Columns },
  detail: { label: "Detail", Icon: import_lucide_react4.CircleDot },
  text: { label: "Text", Icon: import_lucide_react4.Type },
  strokeDash: { label: "Dash", Icon: import_lucide_react4.Minus }
};
var EncodingShelf = ({
  channel,
  value,
  onChange,
  onRemove,
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = (0, import_react5.useState)(false);
  const dropRef = (0, import_react5.useRef)(null);
  const config = CHANNEL_CONFIG[channel] || { label: channel, Icon: import_lucide_react4.CircleDot };
  const { label, Icon } = config;
  const handleDragOver = (0, import_react5.useCallback)((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);
  const handleDragLeave = (0, import_react5.useCallback)(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = (0, import_react5.useCallback)((e) => {
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
  const handleTypeChange = (0, import_react5.useCallback)((newType) => {
    if (value) onChange({ ...value, type: newType });
  }, [value, onChange]);
  const handleAggChange = (0, import_react5.useCallback)((newAgg) => {
    if (value) onChange({ ...value, aggregate: newAgg === "none" ? void 0 : newAgg });
  }, [value, onChange]);
  const handleSortToggle = (0, import_react5.useCallback)(() => {
    if (!value) return;
    const sortStates = [null, "ascending", "descending"];
    const current = sortStates.indexOf(value.sort);
    const next = sortStates[(current + 1) % sortStates.length];
    onChange({ ...value, sort: next });
  }, [value, onChange]);
  const isEmpty = !value || !value.field;
  return /* @__PURE__ */ import_react5.default.createElement(
    "div",
    {
      ref: dropRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: [
        "flex items-center w-full min-h-[32px] rounded border transition-colors gap-1.5 px-2 py-1",
        isEmpty ? "border-dashed border-border/60 bg-muted/20" : "border-border bg-card",
        isDragOver ? "border-primary bg-primary/5 shadow-inner" : "",
        className
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-1.5 w-14 shrink-0" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { className: "w-3 h-3 text-muted-foreground shrink-0" }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate" }, label)),
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 flex flex-nowrap items-center gap-1 min-w-0 overflow-hidden" }, isEmpty ? /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-xs text-muted-foreground/60 italic" }, isDragOver ? "Release" : "Drop field") : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(
      FieldPill,
      {
        field: { ...value, name: value.field },
        onRemove,
        isCompact: true,
        className: "flex-1 min-w-0"
      }
    ), /* @__PURE__ */ import_react5.default.createElement(import_ui3.Select, { value: value.type || "nominal", onValueChange: handleTypeChange }, /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectTrigger, { className: "h-5 w-auto min-w-0 px-1 text-xs border-border/50 bg-transparent gap-0.5 shrink-0", title: "Type" }, /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectValue, null)), /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectContent, { className: "z-[200]" }, FIELD_TYPES.map((t) => /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectItem, { key: t, value: t, className: "text-[11px]" }, t.charAt(0).toUpperCase() + t.slice(1))))), (value.type === "quantitative" || value.aggregate) && /* @__PURE__ */ import_react5.default.createElement(import_ui3.Select, { value: value.aggregate || "none", onValueChange: handleAggChange }, /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectTrigger, { className: "h-5 w-auto min-w-0 px-1 text-xs border-border/50 bg-transparent gap-0.5 shrink-0", title: "Aggregate" }, /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectValue, null)), /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectItem, { value: "none", className: "text-[11px]" }, "raw"), AGGREGATE_TYPES.map((a) => /* @__PURE__ */ import_react5.default.createElement(import_ui3.SelectItem, { key: a, value: a, className: "text-[11px]" }, a)))), /* @__PURE__ */ import_react5.default.createElement(
      "button",
      {
        type: "button",
        onClick: handleSortToggle,
        className: "ml-auto h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0",
        title: `Sort: ${value.sort || "default"}`
      },
      /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.ArrowUpDown, { className: "w-3 h-3" })
    )))
  );
};
EncodingShelf.propTypes = {
  channel: import_prop_types4.default.string.isRequired,
  value: import_prop_types4.default.shape({
    field: import_prop_types4.default.string,
    type: import_prop_types4.default.string,
    aggregate: import_prop_types4.default.string,
    sort: import_prop_types4.default.string,
    title: import_prop_types4.default.string
  }),
  onChange: import_prop_types4.default.func.isRequired,
  onRemove: import_prop_types4.default.func,
  className: import_prop_types4.default.string
};

// src/vega/markSelector.jsx
var import_react6 = __toESM(require("react"));
var import_prop_types5 = __toESM(require("prop-types"));
var import_lucide_react5 = require("lucide-react");
var MARK_OPTIONS = [
  { key: "auto", label: "Auto", Icon: import_lucide_react5.Sparkles, desc: "Best fit" },
  { key: "bar", label: "Bar", Icon: import_lucide_react5.BarChart3, desc: "Compare" },
  { key: "line", label: "Line", Icon: import_lucide_react5.TrendingUp, desc: "Trends" },
  { key: "area", label: "Area", Icon: import_lucide_react5.AreaChart, desc: "Volume" },
  { key: "point", label: "Scatter", Icon: import_lucide_react5.ScatterChart, desc: "Correlate" },
  { key: "arc", label: "Pie", Icon: import_lucide_react5.PieChart, desc: "Parts" },
  { key: "donut", label: "Donut", Icon: import_lucide_react5.CircleDot, desc: "Ring" },
  { key: "rect", label: "Heat", Icon: import_lucide_react5.Grid3X3, desc: "Density" },
  { key: "tick", label: "Tick", Icon: import_lucide_react5.GripVertical, desc: "Dist" },
  { key: "circle", label: "Bubble", Icon: import_lucide_react5.Circle, desc: "Sized" }
];
var MarkSelector = ({ value, onChange, className = "" }) => {
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: `grid grid-cols-5 gap-1.5 ${className}` }, MARK_OPTIONS.map((opt) => {
    const isSelected = value === opt.key;
    return /* @__PURE__ */ import_react6.default.createElement(
      "button",
      {
        key: opt.key,
        type: "button",
        onClick: () => onChange(opt.key),
        className: `flex flex-col items-center justify-center gap-0.5 rounded py-1.5 px-1 transition-colors ${isSelected ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
        title: `${opt.label}: ${opt.desc}`
      },
      /* @__PURE__ */ import_react6.default.createElement(opt.Icon, { className: `w-3.5 h-3.5 ${isSelected ? "text-primary" : ""}` }),
      /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[8px] font-medium leading-none" }, opt.label)
    );
  }));
};
MarkSelector.propTypes = {
  value: import_prop_types5.default.string,
  onChange: import_prop_types5.default.func.isRequired,
  className: import_prop_types5.default.string
};

// src/vega/shelfBuilder.jsx
var import_ui4 = require("@jet-admin/ui");
var import_lucide_react6 = require("lucide-react");
var PRIMARY_SHELVES = ["x", "y", "color", "size"];
var SECONDARY_SHELVES = ["row", "column", "shape", "opacity", "detail", "text"];
var ShelfBuilder = ({
  widgetEditorForm,
  queryResults,
  stateTree,
  liveStateTree
}) => {
  const [shelfSpec, setShelfSpec] = (0, import_react7.useState)(() => {
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
  (0, import_react7.useEffect)(() => {
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
  const [showSecondary, setShowSecondary] = (0, import_react7.useState)(false);
  const [showStyle, setShowStyle] = (0, import_react7.useState)(false);
  const resolvedMark = (0, import_react7.useMemo)(() => {
    if (shelfSpec.mark === "auto" || !shelfSpec.mark) {
      return inferMarkType(shelfSpec.encoding);
    }
    return shelfSpec.mark;
  }, [shelfSpec.mark, shelfSpec.encoding]);
  const handleChannelChange = (0, import_react7.useCallback)((channel, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: value
      }
    }));
  }, []);
  const handleChannelRemove = (0, import_react7.useCallback)((channel) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: null
      }
    }));
  }, []);
  const handleMarkChange = (0, import_react7.useCallback)((mark) => {
    setShelfSpec((prev) => ({ ...prev, mark }));
  }, []);
  const handleDataSourceChange = (0, import_react7.useCallback)((newSource) => {
    setShelfSpec((prev) => ({ ...prev, dataSource: newSource }));
  }, []);
  const handleConfigChange = (0, import_react7.useCallback)((key, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, []);
  const handleFieldQuickAdd = (0, import_react7.useCallback)((field) => {
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
  const [isExpanded, setIsExpanded] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
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
  const hasAnyData = true;
  const activeCount = [...PRIMARY_SHELVES, ...SECONDARY_SHELVES].filter((ch) => shelfSpec.encoding[ch]?.field).length;
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-full" }, /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsExpanded(!isExpanded),
      className: "w-full flex items-center gap-2 px-2.5 py-2 rounded border border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors text-left"
    },
    isExpanded ? /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronDown, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }) : /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronRight, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }),
    /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.TrendingUp, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-xs font-medium text-foreground flex-1" }, "Mappings"),
    activeCount > 0 && /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full" }, activeCount)
  ), isExpanded && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-1.5 rounded border border-border bg-card overflow-hidden" }, !hasAnyData ? (
    /* ── Empty State ── */
    /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-col items-center justify-center p-6 text-center" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Database, { className: "w-7 h-7 mb-2 text-muted-foreground/30" }), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-xs font-medium text-foreground mb-0.5" }, "No Data Source"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-xs text-muted-foreground leading-relaxed" }, "Add a Data Source in the Data tab and run a Test, or select a Workflow."))
  ) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { className: "px-2.5 py-2 border-b border-border/50 bg-muted/20" }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block" }, "Data Source"), /* @__PURE__ */ import_react7.default.createElement(
    import_ui4.TemplateAutocompleteInput,
    {
      value: shelfSpec.dataSource || "",
      onChange: (val) => handleDataSourceChange(val),
      placeholder: "e.g. {{ state.queries.my_query.data }}",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react7.default.createElement("div", { className: "border-b border-border/50 max-h-[220px] overflow-y-auto" }, /* @__PURE__ */ import_react7.default.createElement(
    DataFieldPanel,
    {
      queryResults,
      stateTree,
      liveStateTree,
      dataSource: shelfSpec.dataSource,
      onDataSourceChange: handleDataSourceChange,
      onFieldClick: handleFieldQuickAdd,
      compact: true
    }
  )), /* @__PURE__ */ import_react7.default.createElement("div", { className: "border-b border-border/50" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "px-2.5 py-1.5 bg-muted/20 flex items-center gap-1.5" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Layers, { className: "w-3 h-3 text-muted-foreground" }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" }, "Encodings")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "p-2 flex flex-col gap-1.5" }, PRIMARY_SHELVES.map((ch) => /* @__PURE__ */ import_react7.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "border-t border-border/50" }, /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowSecondary(!showSecondary),
      className: "w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
    },
    showSecondary ? /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronDown, { className: "w-3 h-3 text-muted-foreground" }) : /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground flex-1" }, "More Channels"),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[9px] text-primary font-bold" }, SECONDARY_SHELVES.filter((ch) => shelfSpec.encoding[ch]?.field).length, " active")
  ), showSecondary && /* @__PURE__ */ import_react7.default.createElement("div", { className: "p-2 flex flex-col gap-1.5" }, SECONDARY_SHELVES.map((ch) => /* @__PURE__ */ import_react7.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))))), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowStyle(!showStyle),
      className: "w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
    },
    showStyle ? /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronDown, { className: "w-3 h-3 text-muted-foreground" }) : /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
    /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Palette, { className: "w-3 h-3 text-muted-foreground" }),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" }, "Style")
  ), showStyle && /* @__PURE__ */ import_react7.default.createElement("div", { className: "p-2.5 space-y-2.5 border-t border-border/50" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block" }, "Mark Type"), /* @__PURE__ */ import_react7.default.createElement(MarkSelector, { value: shelfSpec.mark || "auto", onChange: handleMarkChange }), shelfSpec.mark === "auto" && /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-[9px] text-muted-foreground italic mt-0.5" }, "Resolved: ", /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-medium text-foreground not-italic" }, resolvedMark))), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "text-xs font-medium text-muted-foreground mb-0.5 block" }, "Title"), /* @__PURE__ */ import_react7.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: shelfSpec.config?.title || "",
      onChange: (e) => handleConfigChange("title", e.target.value),
      placeholder: "Untitled",
      className: "w-full text-[11px] h-7"
    }
  )), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "text-xs font-medium text-muted-foreground mb-0.5 block" }, "Colors"), /* @__PURE__ */ import_react7.default.createElement(import_ui4.Select, { value: shelfSpec.config?.colorScheme || "tableau10", onValueChange: (val) => handleConfigChange("colorScheme", val) }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectTrigger, { className: "text-[11px] h-7" }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectValue, null)), /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectContent, { className: "z-[200]" }, COLOR_SCHEMES.map((s) => /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectItem, { key: s, value: s }, s))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "text-xs font-medium text-muted-foreground mb-0.5 block" }, "Width"), /* @__PURE__ */ import_react7.default.createElement(import_ui4.Select, { value: shelfSpec.config?.width === "container" ? "container" : "custom", onValueChange: (val) => handleConfigChange("width", val === "container" ? "container" : 400) }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectTrigger, { className: "text-[11px] h-7" }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectValue, null)), /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectItem, { value: "container" }, "Fill"), /* @__PURE__ */ import_react7.default.createElement(import_ui4.SelectItem, { value: "custom" }, "Fixed")))), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement(import_ui4.Label, { className: "text-xs font-medium text-muted-foreground mb-0.5 block" }, "Height"), /* @__PURE__ */ import_react7.default.createElement(
    import_ui4.Input,
    {
      type: "number",
      value: shelfSpec.config?.height || 300,
      onChange: (e) => handleConfigChange("height", parseInt(e.target.value) || 300),
      className: "w-full text-[11px] h-7"
    }
  ))))))));
};
ShelfBuilder.propTypes = {
  widgetEditorForm: import_prop_types6.default.object.isRequired,
  queryResults: import_prop_types6.default.object,
  stateTree: import_prop_types6.default.object,
  liveStateTree: import_prop_types6.default.object
};

// src/vega/vegaConfigEditor.jsx
var import_lucide_react7 = require("lucide-react");
var import_ui6 = require("@jet-admin/ui");
var VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  queryResults,
  stateTree
}) => {
  const isVegaLite = widgetEditorForm.values.widgetType === "vega-lite";
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? "visual" : "raw");
  const liveStateTree = (0, import_react8.useMemo)(() => stateTree ? { state: stateTree } : null, [stateTree]);
  const [showParseWarning, setShowParseWarning] = (0, import_react8.useState)(false);
  const [parseWarningsList, setParseWarningsList] = (0, import_react8.useState)([]);
  const [showSettings, setShowSettings] = (0, import_react8.useState)(false);
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
            widgetEditorForm.setFieldValue("widgetConfig.shelfSpec", config);
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
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-2 w-full" }, isVegaLite && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-row items-center gap-2" }, /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-xs font-medium text-muted-foreground" }, "Visual Editor"), /* @__PURE__ */ import_react8.default.createElement(import_ui5.Switch, { className: "h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5", checked: currentMode === "visual", onCheckedChange: (checked) => handleModeSwitch(checked ? "visual" : "raw") })), isVegaLite && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-2 w-full" }, currentMode === "visual" && !showParseWarning && /* @__PURE__ */ import_react8.default.createElement(
    ShelfBuilder,
    {
      widgetEditorForm,
      queryResults,
      stateTree,
      liveStateTree
    }
  )), showParseWarning && /* @__PURE__ */ import_react8.default.createElement("div", { className: "my-2 shrink-0 rounded border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-start gap-2 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react8.default.createElement("h4", { className: "mb-1 font-semibold text-amber-900 dark:text-amber-200" }, "Cannot fully parse chart config"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "mb-2 text-amber-800 dark:text-amber-300" }, "Switching to Visual mode may cause you to lose manual modifications:"), /* @__PURE__ */ import_react8.default.createElement("ul", { className: "mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300" }, parseWarningsList.map((w, i) => /* @__PURE__ */ import_react8.default.createElement("li", { key: i, className: "mb-0.5" }, w))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui5.Button, { type: "button", variant: "outline", size: "sm", onClick: () => setShowParseWarning(false), className: "h-7 text-xs" }, "Cancel"), /* @__PURE__ */ import_react8.default.createElement(import_ui5.Button, { type: "button", size: "sm", onClick: confirmModeSwitch, className: "h-7 text-xs bg-amber-600 hover:bg-amber-700 text-foreground dark:bg-amber-700 dark:hover:bg-amber-600" }, "Switch & Overwrite"))))), !showParseWarning && currentMode === "raw" && /* @__PURE__ */ import_react8.default.createElement(
    VegaSpecEditor,
    {
      value: widgetEditorForm.values.widgetConfig?.vegaSpec,
      onChange: (spec) => widgetEditorForm.setFieldValue("widgetConfig.vegaSpec", spec),
      workflowContext
    }
  ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui5.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.TemplateAutocompleteInput,
    {
      value: widgetEditorForm.values.widgetConfig?.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )));
};
VegaConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types7.default.object.isRequired,
  workflowContext: import_prop_types7.default.object,
  queryResults: import_prop_types7.default.object
};

// src/index.js
init_tableWidget();
init_tableConfigEditor();

// src/widget.map.js
var import_react34 = __toESM(require("react"));

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
var import_react12 = __toESM(require("react"));
var import_prop_types11 = __toESM(require("prop-types"));
var import_ui12 = require("@jet-admin/ui");
var import_ui13 = require("@jet-admin/ui");
var TextConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react12.useMemo)(() => ({ state: stateTree }), [stateTree]);
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Content"), /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-xs text-muted-foreground leading-snug" }, "Supports Markdown formatting and ", /* @__PURE__ */ import_react12.default.createElement("code", { className: "font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]" }, "{{expression}}"), " templates. Full JS expressions supported."), /* @__PURE__ */ import_react12.default.createElement(
    import_ui13.TemplateAutocompleteInput,
    {
      isTextArea: true,
      className: "",
      value: config.content || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.content", val),
      placeholder: "# Heading\n\nSome **bold** and *italic* text.\n\nValue: {{ state.queries.myQuery.data[0].name }}",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react12.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react12.default.createElement(
    import_ui13.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "grid grid-cols-3 gap-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Format"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui12.Select,
    {
      value: config.format || "markdown",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.format", val)
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "markdown" }, "Markdown"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "plain" }, "Plain Text"))
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Align"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui12.Select,
    {
      value: config.textAlign || "left",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "left" }, "Left"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "center" }, "Center"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "right" }, "Right"))
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.Label, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui12.Select,
    {
      value: config.fontSize || "sm",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.fontSize", val)
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "xs" }, "Extra Small"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "md" }, "Medium"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react12.default.createElement(import_ui12.SelectItem, { value: "xl" }, "Extra Large"))
  ))));
};
TextConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types11.default.object.isRequired,
  stateTree: import_prop_types11.default.object
};

// src/stat/statConfigEditor.jsx
var import_react13 = __toESM(require("react"));
var import_prop_types12 = __toESM(require("prop-types"));
var import_ui14 = require("@jet-admin/ui");
var import_ui15 = require("@jet-admin/ui");
var StatConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react13.useMemo)(() => ({ state: stateTree }), [stateTree]);
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Label"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui14.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.label || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.label", e.target.value),
      placeholder: "e.g. Total Revenue"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Value"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui15.TemplateAutocompleteInput,
    {
      value: config.valueTemplate || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.valueTemplate", val),
      placeholder: "e.g. {{state.queries.stats.data[0].count}}",
      liveStateTree
    }
  ), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-xs text-muted-foreground" }, "The primary metric value. Use template expressions to bind to data sources.")), /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Prefix"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui14.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.prefix || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.prefix", e.target.value),
      placeholder: "e.g. $"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Suffix"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui14.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.suffix || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.suffix", e.target.value),
      placeholder: "e.g. users"
    }
  ))), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Trend Value"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui15.TemplateAutocompleteInput,
    {
      value: config.trendTemplate || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.trendTemplate", val),
      placeholder: "e.g. {{state.queries.stats.data[0].change_pct}}",
      liveStateTree
    }
  ), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Optional percentage change. Positive = up trend, negative = down trend.")), /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Trend Semantics"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui14.Select,
    {
      value: config.trendDirection || "up-is-good",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.trendDirection", val)
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectItem, { value: "up-is-good" }, "Up = Good (green)"), /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectItem, { value: "down-is-good" }, "Down = Good (green)"))
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Align"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui14.Select,
    {
      value: config.textAlign || "center",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.textAlign", val)
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectItem, { value: "left" }, "Left"), /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectItem, { value: "center" }, "Center"), /* @__PURE__ */ import_react13.default.createElement(import_ui14.SelectItem, { value: "right" }, "Right"))
  ))), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui14.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react13.default.createElement(
    import_ui15.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )));
};
StatConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types12.default.object.isRequired,
  stateTree: import_prop_types12.default.object
};

// src/alert/alertConfigEditor.jsx
var import_react14 = __toESM(require("react"));
var import_prop_types13 = __toESM(require("prop-types"));
var import_ui16 = require("@jet-admin/ui");
var import_ui17 = require("@jet-admin/ui");
var AlertConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react14.useMemo)(() => ({ state: stateTree }), [stateTree]);
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react14.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Type / Variant"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui16.Select,
    {
      value: config.variant || "info",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
    },
    /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectValue, null)),
    /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectContent, null, /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectItem, { value: "info" }, "Info (Blue)"), /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectItem, { value: "success" }, "Success (Green)"), /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectItem, { value: "warning" }, "Warning (Amber)"), /* @__PURE__ */ import_react14.default.createElement(import_ui16.SelectItem, { value: "error" }, "Error (Red)"))
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react14.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Title (Optional)"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui17.TemplateAutocompleteInput,
    {
      value: config.title || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.title", val),
      placeholder: "e.g. Warning!",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react14.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Message"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui17.TemplateAutocompleteInput,
    {
      isTextArea: true,
      value: config.message || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.message", val),
      placeholder: "e.g. Action completed successfully.",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react14.default.createElement(
    import_ui16.Checkbox,
    {
      id: "alert-dismissible",
      checked: config.dismissible ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.dismissible", !!checked)
    }
  ), /* @__PURE__ */ import_react14.default.createElement(import_ui16.Label, { htmlFor: "alert-dismissible", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow user to dismiss/close the banner")), /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react14.default.createElement(import_ui16.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react14.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react14.default.createElement(
    import_ui17.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )));
};
AlertConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types13.default.object.isRequired,
  stateTree: import_prop_types13.default.object
};

// src/form/formConfigEditor.jsx
var import_react15 = __toESM(require("react"));
var import_prop_types14 = __toESM(require("prop-types"));
var import_lucide_react10 = require("lucide-react");
var import_ui18 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "grid grid-cols-2 gap-2 pb-2 border-b" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs font-medium text-foreground" }, "Submit Button Text"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-8",
      value: config.submitLabel || "Submit",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.submitLabel", e.target.value)
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs font-medium text-foreground" }, "Size / Spacing"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Select,
    {
      value: config.size || "default",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
    },
    /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectTrigger, { className: "text-xs h-8" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectValue, null)),
    /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectContent, null, /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "sm" }, "Compact (Small)"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "default" }, "Normal (Default)"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "lg" }, "Spacious (Large)"))
  ))), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs font-semibold text-foreground" }, "Fields list"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-7 px-2 text-xs gap-1",
      onClick: handleAddField
    },
    /* @__PURE__ */ import_react15.default.createElement(import_lucide_react10.Plus, { className: "h-3 w-3" }),
    " Add Field"
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-2 max-h-[350px] overflow-y-auto pr-1" }, fields.map((field, idx) => /* @__PURE__ */ import_react15.default.createElement("div", { key: idx, className: "p-2 border rounded bg-muted/10 relative space-y-2" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Button,
    {
      type: "button",
      variant: "ghost",
      size: "icon",
      className: "absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive",
      onClick: () => handleRemoveField(idx)
    },
    /* @__PURE__ */ import_react15.default.createElement(import_lucide_react10.Trash2, { className: "h-3.5 w-3.5" })
  ), /* @__PURE__ */ import_react15.default.createElement("div", { className: "grid grid-cols-2 gap-2 pr-5" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs text-muted-foreground font-medium" }, "Label"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: field.label || "",
      onChange: (e) => handleFieldChange(idx, "label", e.target.value),
      placeholder: "e.g. Email Address"
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs text-muted-foreground font-medium" }, "Key (Unique ID)"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-7 font-mono",
      value: field.key || "",
      onChange: (e) => handleFieldChange(idx, "key", e.target.value),
      placeholder: "e.g. email"
    }
  ))), /* @__PURE__ */ import_react15.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs text-muted-foreground font-medium" }, "Input Type"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Select,
    {
      value: field.type || "text",
      onValueChange: (val) => handleFieldChange(idx, "type", val)
    },
    /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectTrigger, { className: "text-[11px] h-7 bg-background" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectValue, null)),
    /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectContent, null, /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "text" }, "Text (Single line)"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "email" }, "Email"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "password" }, "Password"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "number" }, "Number"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "checkbox" }, "Checkbox"), /* @__PURE__ */ import_react15.default.createElement(import_ui18.SelectItem, { value: "select" }, "Select / Dropdown"))
  )), field.type !== "checkbox" && /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs text-muted-foreground font-medium" }, "Placeholder"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: field.placeholder || "",
      onChange: (e) => handleFieldChange(idx, "placeholder", e.target.value),
      placeholder: "Hint text..."
    }
  ))), field.type === "select" && /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-xs text-muted-foreground font-medium" }, "Options (comma-separated)"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-7",
      value: (field.options || []).join(", "),
      onChange: (e) => handleOptionsChange(idx, e.target.value),
      placeholder: "admin, member, guest"
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "grid grid-cols-2 gap-2 pt-1 border-t border-dashed" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Checkbox,
    {
      id: `field-req-${idx}`,
      checked: !!field.required,
      onCheckedChange: (val) => handleFieldChange(idx, "required", !!val)
    }
  ), /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { htmlFor: `field-req-${idx}`, className: "text-xs text-muted-foreground cursor-pointer font-medium" }, "Required field")), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { className: "text-[9px] text-muted-foreground block leading-none" }, "Default Value"), /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Input,
    {
      type: "text",
      className: "text-xs h-6 font-mono px-1.5",
      value: field.defaultValue || "",
      onChange: (e) => handleFieldChange(idx, "defaultValue", e.target.value),
      placeholder: "e.g. {{widgets.table1.selectedRow.name}}"
    }
  ))))), fields.length === 0 && /* @__PURE__ */ import_react15.default.createElement("div", { className: "text-center p-4 border border-dashed text-xs text-muted-foreground rounded" }, "Click 'Add Field' above to define dynamic form fields.")), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex items-center gap-2 pt-2" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui18.Checkbox,
    {
      id: "form-show-reset",
      checked: config.showReset ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.showReset", !!checked)
    }
  ), /* @__PURE__ */ import_react15.default.createElement(import_ui18.Label, { htmlFor: "form-show-reset", className: "text-xs text-muted-foreground cursor-pointer" }, "Show form reset button alongside submit")));
};
FormConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types14.default.object.isRequired
};

// src/image/imageConfigEditor.jsx
var import_react17 = __toESM(require("react"));
var import_prop_types15 = __toESM(require("prop-types"));
var import_ui19 = require("@jet-admin/ui");
var import_ui20 = require("@jet-admin/ui");
var import_lucide_react11 = require("lucide-react");

// src/context/WidgetEditorContext.js
var import_react16 = require("react");
var WidgetEditorContext = (0, import_react16.createContext)({
  tenantID: null,
  fileUpload: {
    uploadFile: async (file) => {
      throw new Error("uploadFile is not implemented");
    }
  },
  apiProxy: {
    post: async (action, params) => {
      throw new Error("apiProxy.post is not implemented");
    }
  }
});

// src/image/imageConfigEditor.jsx
var ImageConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react17.useMemo)(() => ({ state: stateTree }), [stateTree]);
  const { fileUpload } = (0, import_react17.useContext)(WidgetEditorContext);
  const [isUploading, setIsUploading] = (0, import_react17.useState)(false);
  const fileInputRef = (0, import_react17.useRef)(null);
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await fileUpload.uploadFile(file);
      if (res && res.url) {
        widgetEditorForm.setFieldValue("widgetConfig.src", res.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  return /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(
    "input",
    {
      type: "file",
      ref: fileInputRef,
      className: "hidden",
      accept: "image/*",
      onChange: handleFileUpload
    }
  ), /* @__PURE__ */ import_react17.default.createElement(
    import_ui19.Button,
    {
      variant: "outline",
      size: "sm",
      className: "w-full h-9 text-xs flex items-center justify-center",
      disabled: isUploading,
      onClick: (e) => {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    isUploading ? /* @__PURE__ */ import_react17.default.createElement(import_lucide_react11.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ import_react17.default.createElement(import_lucide_react11.Upload, { className: "h-4 w-4 mr-2" }),
    "Upload Image"
  )), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1 w-full min-w-0 overflow-hidden" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.Label, { className: "text-xs font-medium text-foreground" }, "Image URL / Source"), /* @__PURE__ */ import_react17.default.createElement("div", { className: "w-full min-w-0" }, /* @__PURE__ */ import_react17.default.createElement(
    import_ui20.TemplateAutocompleteInput,
    {
      value: config.src || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.src", val),
      placeholder: "e.g. {{state.queries.user.data.avatar_url}}",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react17.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Supports template expressions for dynamic content."))), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.Label, { className: "text-xs font-medium text-foreground" }, "Alt Text (Accessibility)"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui19.Input,
    {
      type: "text",
      className: "text-sm",
      value: config.alt || "",
      onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.alt", e.target.value),
      placeholder: "e.g. Profile photo"
    }
  )), /* @__PURE__ */ import_react17.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.Label, { className: "text-xs font-medium text-foreground" }, "Object Fit"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui19.Select,
    {
      value: config.objectFit || "cover",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.objectFit", val)
    },
    /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectValue, null)),
    /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectContent, null, /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "cover" }, "Cover (crop to fit)"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "contain" }, "Contain (show all)"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "fill" }, "Fill (stretch)"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "none" }, "Original Size"))
  )), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.Label, { className: "text-xs font-medium text-foreground" }, "Corner Radius"), /* @__PURE__ */ import_react17.default.createElement(
    import_ui19.Select,
    {
      value: config.borderRadius || "none",
      onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.borderRadius", val)
    },
    /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectValue, null)),
    /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectContent, null, /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "none" }, "Square (None)"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "md" }, "Medium"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react17.default.createElement(import_ui19.SelectItem, { value: "full" }, "Circle (Full)"))
  ))), /* @__PURE__ */ import_react17.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react17.default.createElement(import_ui19.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react17.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react17.default.createElement(
    import_ui20.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )));
};
ImageConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types15.default.object.isRequired,
  stateTree: import_prop_types15.default.object
};

// src/iframe/iframeConfigEditor.jsx
var import_react18 = __toESM(require("react"));
var import_prop_types16 = __toESM(require("prop-types"));
var import_ui21 = require("@jet-admin/ui");
var import_ui22 = require("@jet-admin/ui");
var IframeConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react18.useMemo)(() => ({ state: stateTree }), [stateTree]);
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { className: "text-xs font-medium text-foreground" }, "Embed URL / Target Source"), /* @__PURE__ */ import_react18.default.createElement(
    import_ui22.TemplateAutocompleteInput,
    {
      value: config.url || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.url", val),
      placeholder: "e.g. https://example.com",
      liveStateTree
    }
  ), /* @__PURE__ */ import_react18.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Make sure the target site supports framing (doesn't send X-Frame-Options: DENY).")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-2 border-t pt-2 mt-2" }, /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { className: "text-xs font-medium text-foreground" }, "Sandbox Security Options"), /* @__PURE__ */ import_react18.default.createElement("p", { className: "text-xs text-muted-foreground leading-snug mb-1" }, "Toggle capabilities granted to the embedded page. Restricted by default."), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui21.Checkbox,
    {
      id: "iframe-scripts",
      checked: config.allowScripts ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowScripts", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { htmlFor: "iframe-scripts", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow JavaScript execution (allow-scripts)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui21.Checkbox,
    {
      id: "iframe-forms",
      checked: config.allowForms ?? true,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowForms", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { htmlFor: "iframe-forms", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow form submission (allow-forms)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui21.Checkbox,
    {
      id: "iframe-popups",
      checked: config.allowPopups ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowPopups", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { htmlFor: "iframe-popups", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow popups & new windows (allow-popups)")), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center gap-2 mt-1" }, /* @__PURE__ */ import_react18.default.createElement(
    import_ui21.Checkbox,
    {
      id: "iframe-origin",
      checked: config.allowSameOrigin ?? false,
      onCheckedChange: (checked) => widgetEditorForm.setFieldValue("widgetConfig.allowSameOrigin", !!checked)
    }
  ), /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { htmlFor: "iframe-origin", className: "text-xs text-muted-foreground cursor-pointer" }, "Allow sharing local storage/cookies (allow-same-origin)"))), /* @__PURE__ */ import_react18.default.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ import_react18.default.createElement(import_ui21.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react18.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react18.default.createElement(
    import_ui22.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )));
};
IframeConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types16.default.object.isRequired,
  stateTree: import_prop_types16.default.object
};

// src/widget.map.js
init_datePickerConfigEditor();
init_dateRangePickerConfigEditor();

// src/html/htmlConfigEditor.jsx
var import_react21 = __toESM(require("react"));
var import_prop_types19 = __toESM(require("prop-types"));
var import_ui27 = require("@jet-admin/ui");
var HtmlConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = (0, import_react21.useMemo)(() => ({ state: stateTree }), [stateTree]);
  return /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "HTML Markup"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-muted-foreground leading-snug" }, "Supports standard HTML structure, inline styles, and ", /* @__PURE__ */ import_react21.default.createElement("code", { className: "font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]" }, "{{expression}}"), " templates."), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.CodeEditor,
    {
      language: "html",
      value: config.html || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.html", val),
      stateTree: liveStateTree,
      templateMode: "js-template",
      height: 200,
      showExpandButton: true,
      showFormatButton: false,
      showLineNumbers: true,
      title: "HTML Source"
    }
  )), /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "CSS Stylesheet"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-muted-foreground leading-snug" }, "Custom styles scoped to this widget's sandboxed iframe container."), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.CodeEditor,
    {
      language: "css",
      value: config.css || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.css", val),
      stateTree: liveStateTree,
      templateMode: "js-template",
      height: 150,
      showExpandButton: true,
      showFormatButton: false,
      showLineNumbers: true,
      title: "CSS Styles"
    }
  )), /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "Is Loading Template ", /* @__PURE__ */ import_react21.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.TemplateAutocompleteInput,
    {
      value: config.isLoading || "",
      onChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val),
      placeholder: "e.g. {{ state.queries.myQuery.isLoading }}",
      liveStateTree
    }
  )), /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-2 pt-2 mt-2 border-t border-border/60" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-semibold text-foreground uppercase tracking-wider" }, "Sandbox Security"), /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-0.5 pr-2" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "Execute JavaScript"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Allows running <script> tags inside the iframe sandbox.")), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.Switch,
    {
      checked: config.allowScripts === true || config.allowScripts === "true",
      onCheckedChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.allowScripts", val)
    }
  )), /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-0.5 pr-2" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "Submit Forms"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Allows form submissions within the sandboxed iframe.")), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.Switch,
    {
      checked: config.allowForms === true || config.allowForms === "true",
      onCheckedChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.allowForms", val)
    }
  )), /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "space-y-0.5 pr-2" }, /* @__PURE__ */ import_react21.default.createElement(import_ui27.Label, { className: "text-xs font-medium text-foreground" }, "Allow Popups"), /* @__PURE__ */ import_react21.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Allows links opening in new tabs or window popups.")), /* @__PURE__ */ import_react21.default.createElement(
    import_ui27.Switch,
    {
      checked: config.allowPopups === true || config.allowPopups === "true",
      onCheckedChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.allowPopups", val)
    }
  ))));
};
HtmlConfigEditor.propTypes = {
  widgetEditorForm: import_prop_types19.default.object.isRequired,
  stateTree: import_prop_types19.default.object
};

// src/widget.map.js
var import_lucide_react20 = require("lucide-react");
registerWidgets();
var LazyVegaWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module2) => ({ default: module2.VegaWidget }))
);
var LazyButtonWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_button(), button_exports)).then((module2) => ({ default: module2.ButtonWidget }))
);
var LazyTableWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_table(), table_exports)).then((module2) => ({ default: module2.TableWidget }))
);
var LazyTextWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_text(), text_exports)).then((module2) => ({ default: module2.TextWidget }))
);
var LazyStatWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_stat(), stat_exports)).then((module2) => ({ default: module2.StatWidget }))
);
var LazyAlertWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_alert(), alert_exports)).then((module2) => ({ default: module2.AlertWidget }))
);
var LazyFormWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_form(), form_exports)).then((module2) => ({ default: module2.FormWidget }))
);
var LazyImageWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_image(), image_exports)).then((module2) => ({ default: module2.ImageWidget }))
);
var LazyIframeWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_iframe(), iframe_exports)).then((module2) => ({ default: module2.IframeWidget }))
);
var LazyDatePickerWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_date_picker(), date_picker_exports)).then((module2) => ({ default: module2.DatePickerWidget }))
);
var LazyDateRangePickerWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_date_range_picker(), date_range_picker_exports)).then((module2) => ({ default: module2.DateRangePickerWidget }))
);
var LazyHtmlWidget = import_react34.default.lazy(
  () => Promise.resolve().then(() => (init_html(), html_exports)).then((module2) => ({ default: module2.HtmlWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: import_widget_types.WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react34.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.BarChart, { className: `!text-lg ${className}` }),
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react34.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.BarChart, { className: `!text-lg ${className}` }),
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading button...") }, /* @__PURE__ */ import_react34.default.createElement(LazyButtonWidget, { data, ...props }));
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Component, { className: `!text-lg ${className}` }),
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading table...") }, /* @__PURE__ */ import_react34.default.createElement(LazyTableWidget, { data, ...props }));
    },
    configEditor: TableConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Table, { className: `!text-lg ${className}` }),
    sampleConfig: {
      dataArrayTemplate: "{{ctx.data}}",
      columns: [],
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading text...") }, /* @__PURE__ */ import_react34.default.createElement(LazyTextWidget, { data, ...props }));
    },
    configEditor: TextConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Type, { className: `!text-lg ${className}` }),
    sampleConfig: {
      content: "### Heading\n\nEdit this markdown in the properties tab.",
      format: "markdown",
      textAlign: "left",
      fontSize: "sm",
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading stat...") }, /* @__PURE__ */ import_react34.default.createElement(LazyStatWidget, { data, ...props }));
    },
    configEditor: StatConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.TrendingUp, { className: `!text-lg ${className}` }),
    sampleConfig: {
      label: "Metric Label",
      valueTemplate: "42",
      prefix: "",
      suffix: "",
      trendTemplate: "",
      trendDirection: "up-is-good",
      textAlign: "center",
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading alert...") }, /* @__PURE__ */ import_react34.default.createElement(LazyAlertWidget, { data, ...props }));
    },
    configEditor: AlertConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.AlertTriangle, { className: `!text-lg ${className}` }),
    sampleConfig: {
      title: "Notice",
      message: "This is a banner notice.",
      variant: "info",
      dismissible: true,
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading form...") }, /* @__PURE__ */ import_react34.default.createElement(LazyFormWidget, { data, ...props }));
    },
    configEditor: FormConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.FileText, { className: `!text-lg ${className}` }),
    sampleConfig: {
      fields: [],
      submitLabel: "Submit",
      size: "default",
      showReset: false,
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading image...") }, /* @__PURE__ */ import_react34.default.createElement(LazyImageWidget, { data, ...props }));
    },
    configEditor: ImageConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Image, { className: `!text-lg ${className}` }),
    sampleConfig: {
      src: "",
      alt: "Image Content",
      objectFit: "cover",
      borderRadius: "none",
      isLoading: "",
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
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading embed...") }, /* @__PURE__ */ import_react34.default.createElement(LazyIframeWidget, { data, ...props }));
    },
    configEditor: IframeConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Globe, { className: `!text-lg ${className}` }),
    sampleConfig: {
      url: "",
      allowScripts: true,
      allowForms: true,
      allowPopups: false,
      allowSameOrigin: false,
      isLoading: "",
      showHeader: false
    }
  },
  "date-picker": {
    label: "Date / Time Picker",
    value: import_widget_types.WIDGET_TYPES.DATE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Select a single date and optional time",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading picker...") }, /* @__PURE__ */ import_react34.default.createElement(LazyDatePickerWidget, { data, ...props }));
    },
    configEditor: DatePickerConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Calendar, { className: `!text-lg ${className}` }),
    sampleConfig: {
      label: "Select Date",
      placeholder: "Choose a date...",
      enableTime: false,
      defaultValue: "",
      isLoading: "",
      showHeader: false
    }
  },
  "date-range-picker": {
    label: "Date Range Picker",
    value: import_widget_types.WIDGET_TYPES.DATE_RANGE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Select a range of dates and optional times",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading range picker...") }, /* @__PURE__ */ import_react34.default.createElement(LazyDateRangePickerWidget, { data, ...props }));
    },
    configEditor: DateRangePickerConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.CalendarRange, { className: `!text-lg ${className}` }),
    sampleConfig: {
      label: "Select Date Range",
      placeholderStart: "Start date",
      placeholderEnd: "End date",
      enableTime: false,
      defaultStart: "",
      defaultEnd: "",
      presets: [
        { label: "Today", startOffset: 0, endOffset: 0 },
        { label: "Last 7 days", startOffset: -7, endOffset: 0 },
        { label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" }
      ],
      isLoading: "",
      showHeader: false
    }
  },
  "html": {
    label: "HTML Widget",
    value: import_widget_types.WIDGET_TYPES.HTML.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Custom HTML, CSS, and interactive scripting",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react34.default.createElement(import_react34.default.Suspense, { fallback: /* @__PURE__ */ import_react34.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading widget...") }, /* @__PURE__ */ import_react34.default.createElement(LazyHtmlWidget, { data, ...props }));
    },
    configEditor: HtmlConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react34.default.createElement(import_lucide_react20.Code, { className: `!text-lg ${className}` }),
    sampleConfig: {
      html: "<div>\n  <h3>Hello Custom HTML!</h3>\n  <p>Customize this content inside properties.</p>\n</div>",
      css: "h3 {\n  color: #3b82f6;\n}\np {\n  color: #6b7280;\n}",
      allowScripts: false,
      allowForms: false,
      allowPopups: false,
      isLoading: "",
      showHeader: true
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
init_date_picker();
init_date_range_picker();
init_htmlWidget();
//# sourceMappingURL=index.cjs.map
