import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button, Input, Checkbox, Badge } from "@jet-admin/ui";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Pencil, Check, X, FileDown, ArrowUp, ArrowDown, ChevronsUpDown,
} from "lucide-react";
import {
  getNestedValue,
  normalizeColumns,
  formatCellValue,
  buildCSVContent,
  buildJSONContent,
  coerceTotalRows,
  resolvePageSize,
  diffRowChanges,
} from "./tableUtils";

// ── Download helpers (DOM side-effects isolated for testability) ──
const downloadFile = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const downloadCSV = (columns, rows, filename) =>
  downloadFile(buildCSVContent(columns, rows), filename || `export-${Date.now()}.csv`, "text/csv;charset=utf-8;");

const downloadJSON = (columns, rows, filename) =>
  downloadFile(buildJSONContent(columns, rows), filename || `export-${Date.now()}.json`, "application/json");

// ── Editable Cell Component ──
const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => { setValue(initialValue); }, [initialValue]);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  const onBlur = () => {
    table.options.meta?.updateCellData(row.index, column.id, value);
  };

  return (
    <Input
      ref={inputRef}
      value={value ?? ""}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.key === "Enter") { onBlur(); e.target.blur(); }
        if (e.key === "Escape") { setValue(initialValue); e.target.blur(); }
        if (e.key === "Tab") { onBlur(); }
      }}
      className="h-7 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 rounded w-full"
    />
  );
};

// ── Typed cell renderer ──
const TypedCellValue = ({ rawValue, col }) => {
  const type = col.type || "text";
  if (type === "link") {
    const href = rawValue ? String(rawValue) : "";
    if (!href) return <span className="text-muted-foreground">—</span>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary underline underline-offset-2 hover:opacity-80 truncate inline-block max-w-[240px]">
        {col.format || href}
      </a>
    );
  }
  if (type === "image") {
    const src = rawValue ? String(rawValue) : "";
    if (!src) return <span className="text-muted-foreground">—</span>;
    return <img src={src} alt={col.label || "image"} className="h-8 w-8 rounded object-cover border border-border" loading="lazy" onClick={(e) => e.stopPropagation()} />;
  }
  if (type === "badge") {
    const text = formatCellValue(rawValue, { type: "text" });
    if (text === "—") return <span className="text-muted-foreground">—</span>;
    return <Badge variant="secondary" className="text-[11px] whitespace-nowrap">{text}</Badge>;
  }
  if (type === "boolean") {
    if (rawValue === true || rawValue === "true" || rawValue === 1 || rawValue === "1")
      return <Badge variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Yes</Badge>;
    if (rawValue === false || rawValue === "false" || rawValue === 0 || rawValue === "0")
      return <Badge variant="secondary" className="text-[11px] bg-muted text-muted-foreground">No</Badge>;
    return <span className="text-muted-foreground">—</span>;
  }
  const display = formatCellValue(rawValue, col);
  const align = type === "number" || type === "date" ? "text-right tabular-nums" : "";
  return <span className={align}>{display}</span>;
};

// ── Main TableWidget ──
export const TableWidget = ({
  widgetConfig,
  data: processedData,
  runWorkflow,
  isLoadingWorkflows,
  onWidgetInit,
  refreshData,
  fireWidgetEvent,
  widgetState,
  setWidgetState,
  onRowSelect,
}) => {
  // ── Parse processedData ──
  const tableData = useMemo(() => {
    if (processedData && typeof processedData === "object" && !Array.isArray(processedData)) return processedData;
    if (Array.isArray(processedData)) return { data: processedData, columns: [], pagination: { enabled: false } };
    return { data: [], columns: [], pagination: { enabled: false } };
  }, [processedData]);

  const rows = useMemo(() => (Array.isArray(tableData.data) ? tableData.data : []), [tableData.data]);

  const isLoading = useMemo(() => {
    if (tableData.isLoading !== undefined) {
      return tableData.isLoading === true || tableData.isLoading === "true";
    }
    if (widgetConfig?.isLoading !== undefined) {
      return widgetConfig.isLoading === true || widgetConfig.isLoading === "true";
    }
    return !!isLoadingWorkflows;
  }, [tableData.isLoading, widgetConfig?.isLoading, isLoadingWorkflows]);

  // ── Resolve column definitions (normalized, hidden dropped, nested paths supported) ──
  const configColumns = useMemo(() => {
    const resolved = Array.isArray(tableData.columns) && tableData.columns.length ? tableData.columns : null;
    return normalizeColumns(resolved, widgetConfig?.columns, rows);
  }, [tableData.columns, widgetConfig?.columns, rows]);

  // ── Feature configs ──
  const paginationConfig = tableData.pagination?.enabled ? tableData.pagination : widgetConfig?.pagination?.enabled ? widgetConfig.pagination : null;
  const serverMode = !!paginationConfig;
  const pageSize = resolvePageSize(paginationConfig?.pageSize, widgetConfig?.pagination?.pageSize, 10);
  const searchConfig = tableData.search || widgetConfig?.search || { enabled: false };
  const exportConfig = tableData.export || widgetConfig?.export || { enabled: false };
  const editingConfig = tableData.editing || widgetConfig?.editing || { enabled: false };
  const multiSelectConfig = tableData.multiSelect || widgetConfig?.multiSelect || { enabled: false };
  const bulkEditConfig = tableData.bulkEdit || widgetConfig?.bulkEdit || { enabled: false };
  const emptyText = tableData.emptyText || widgetConfig?.emptyText || "No data available.";
  const emptyHint = widgetConfig?.emptyHint || "Ensure the data array template resolves to a non-empty array.";
  const striped = widgetConfig?.striped !== false;
  const dense = !!widgetConfig?.dense;
  const stickyHeader = widgetConfig?.stickyHeader !== false;
  const cellPad = dense ? "px-2 py-1" : "px-3 py-2";

  // ── Local state ──
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [rowDraft, setRowDraft] = useState({});
  const [pendingEdits, setPendingEdits] = useState({});
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, colId }
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const clickTimeoutRef = useRef(null);

  // Keep pageSize in sync when config changes
  useEffect(() => {
    setPagination((p) => (p.pageSize === pageSize ? p : { ...p, pageSize, pageIndex: 0 }));
  }, [pageSize]);

  // Clear click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // Reset to first page when rows change identity (new query result)
  const rowsKeyRef = useRef(null);
  useEffect(() => {
    const key = Array.isArray(rows) ? rows.length : 0;
    if (rowsKeyRef.current !== null && rowsKeyRef.current !== key) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }
    rowsKeyRef.current = key;
  }, [rows]);

  // ── Server-side search debounce ──
  // Skip the initial mount: page auto-fetch already loads the first page,
  // and firing here would redundantly re-execute search queries on load.
  const searchInitRef = useRef(true);
  useEffect(() => {
    if (!searchConfig.enabled || !searchConfig.serverSide) return;
    if (searchInitRef.current) {
      searchInitRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (fireWidgetEvent) fireWidgetEvent("onSearch", { searchTerm: globalFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter, searchConfig.serverSide, searchConfig.enabled, fireWidgetEvent]);

  // ── Sync selection state to runtime ──
  const lastSyncSignatureRef = useRef(null);
  useEffect(() => {
    if (!setWidgetState) return;
    const selectedIndices = Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number);
    const signature = JSON.stringify([globalFilter, selectedIndices, pendingEdits]);
    if (lastSyncSignatureRef.current === signature) return;
    lastSyncSignatureRef.current = signature;
    setWidgetState(prev => ({
      ...prev,
      searchTerm: globalFilter,
      selectedRowIndices: selectedIndices,
      selectedRows: selectedIndices.map(i => rows[i]).filter(Boolean),
      pendingEdits,
    }));
  }, [globalFilter, rowSelection, rows, pendingEdits, setWidgetState]);

  // ── Build TanStack column defs ──
  const columnDefs = useMemo(() => {
    const defs = [];

    // Checkbox column for multi-select
    if (multiSelectConfig.enabled) {
      defs.push({
        id: "_select",
        header: ({ table }) => multiSelectConfig.showSelectAll ? (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
            className="h-3.5 w-3.5"
          />
        ) : null,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
            className="h-3.5 w-3.5"
            onClick={e => e.stopPropagation()}
          />
        ),
        size: 40,
        enableSorting: false,
        enableGlobalFilter: false,
      });
    }

    // Data columns
    configColumns.forEach(col => {
      defs.push({
        id: col.key,
        accessorFn: (row) => getNestedValue(row, col.key),
        header: ({ column }) => {
          const sortable = col.sortable !== false;
          const dir = column.getIsSorted();
          const content = (
            <span className="flex items-center gap-1">
              {col.label || col.key}
              {col.editable && (editingConfig.enabled || bulkEditConfig.enabled) && (
                <Pencil className="w-3 h-3 opacity-40" />
              )}
              {sortable && (
                dir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" />
                : dir === "desc" ? <ArrowDown className="w-3 h-3 text-primary" />
                : <ChevronsUpDown className="w-3 h-3 opacity-40" />
              )}
            </span>
          );
          if (!sortable) return content;
          return (
            <button type="button" onClick={column.getToggleSortingHandler()} className="flex items-center gap-1 hover:text-foreground" title={`Sort by ${col.label || col.key}`}>
              {content}
            </button>
          );
        },
        cell: ({ getValue, row, column, table }) => {
          const rowIdx = row.index;
          const colId = column.id;
          const { editingRowId, rowDraft, setRowDraft, pendingEdits, editingCell } = table.options.meta;
          const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
          const isCellEditing = bulkEditConfig.enabled && editingCell?.rowIdx === rowIdx && editingCell?.colId === colId;
          const pendingVal = pendingEdits[rowIdx]?.[colId];
          const hasPending = pendingVal !== undefined;

          // Inline row editing mode
          if (isRowEditing && col.editable) {
            return (
              <Input
                value={rowDraft[colId] ?? ""}
                onChange={e => setRowDraft(prev => ({ ...prev, [colId]: e.target.value }))}
                className="h-7 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 rounded"
                onClick={e => e.stopPropagation()}
              />
            );
          }

          // Bulk edit: active cell editor
          if (isCellEditing && col.editable) {
            return <EditableCell getValue={getValue} row={row} column={column} table={table} />;
          }

          if (hasPending) {
            return (
              <span className="text-primary font-medium">
                {formatCellValue(pendingVal, col) === "—" ? "—" : String(formatCellValue(pendingVal, col))}
                <Pencil className="inline-block w-3 h-3 ml-1 text-primary/60" />
              </span>
            );
          }

          return <TypedCellValue rawValue={getValue()} col={col} />;
        },
        meta: { editable: col.editable },
        enableSorting: col.sortable !== false,
        size: typeof col.width === "number" ? col.width : undefined,
      });
    });

    // Actions column for inline editing
    if (editingConfig.enabled) {
      defs.push({
        id: "_actions",
        header: () => null,
        cell: ({ row, table }) => {
          const rowIdx = row.index;
          const { editingRowId, setEditingRowId, setRowDraft, saveRow } = table.options.meta;
          const isEditing = editingRowId === rowIdx;
          if (isEditing) {
            return (
              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:bg-primary/10"
                  onClick={() => saveRow(rowIdx, row.original)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => { setEditingRowId(null); setRowDraft({}); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }
          return (
            <div className="flex justify-end" onClick={e => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground/50 hover:text-foreground"
                onClick={() => { setEditingRowId(rowIdx); setRowDraft({ ...row.original }); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
        size: 70,
        enableSorting: false,
        enableGlobalFilter: false,
      });
    }

    return defs;
  }, [configColumns, multiSelectConfig, editingConfig, bulkEditConfig]);

  // ── TanStack Table instance ──
  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: {
      globalFilter: (searchConfig.enabled && !searchConfig.serverSide) ? globalFilter : undefined,
      rowSelection,
      pagination: serverMode ? undefined : pagination,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: (searchConfig.enabled && !searchConfig.serverSide) ? getFilteredRowModel() : undefined,
    getPaginationRowModel: !serverMode ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: multiSelectConfig.enabled,
    autoResetPageIndex: false,
    meta: {
      updateCellData: (rowIdx, colId, value) => {
        setPendingEdits(prev => ({
          ...prev,
          [rowIdx]: { ...(prev[rowIdx] || {}), [colId]: value },
        }));
        setEditingCell(null);
      },
      editingRowId,
      setEditingRowId,
      rowDraft,
      setRowDraft,
      editingCell,
      pendingEdits,
      saveRow: (idx, originalRow) => handleSaveRow(idx, originalRow),
    },
  });

  // ── Server-side pagination handler ──
  const [serverPage, setServerPage] = useState(1);
  const serverPageSize = resolvePageSize(paginationConfig?.pageSize, 10);
  const serverTotalRows = coerceTotalRows(
    paginationConfig?.totalRows ?? paginationConfig?.totalTemplate ?? tableData.pagination?.totalRows,
    rows.length
  );
  const serverTotalPages = serverMode ? Math.max(1, Math.ceil(serverTotalRows / serverPageSize)) : 1;

  // Reset server page when result set changes
  useEffect(() => { setServerPage(1); }, [rows.length]);

  const handleServerPageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > serverTotalPages) return;
    setServerPage(newPage);
    const offset = (newPage - 1) * serverPageSize;
    if (fireWidgetEvent) fireWidgetEvent("onPageChange", { page: newPage, pageSize: serverPageSize, offset });
  }, [serverTotalPages, serverPageSize, fireWidgetEvent]);

  // ── Action handlers ──
  const handleExport = useCallback(() => {
    const format = exportConfig.format || "csv";
    if (exportConfig.serverSide) {
      if (fireWidgetEvent) fireWidgetEvent("onExport", { format, rowCount: rows.length });
      return;
    }
    let visibleRows;
    try {
      visibleRows = table.getFilteredRowModel().rows.map(r => r.original);
    } catch {
      visibleRows = table.getCoreRowModel().rows.map(r => r.original);
    }
    if (format === "json") downloadJSON(configColumns, visibleRows);
    else downloadCSV(configColumns, visibleRows);
    if (fireWidgetEvent) fireWidgetEvent("onExport", { format, rowCount: visibleRows.length });
  }, [exportConfig, fireWidgetEvent, rows, table, configColumns]);

  const handleSaveRow = useCallback((idx, originalRow) => {
    const changes = diffRowChanges(originalRow, rowDraft, configColumns);
    if (fireWidgetEvent) fireWidgetEvent("onRowSave", { rowIndex: idx, originalRow, updatedRow: { ...originalRow, ...rowDraft }, changes });
    setEditingRowId(null);
    setRowDraft({});
  }, [configColumns, rowDraft, fireWidgetEvent]);

  const handleSaveBulkEdits = useCallback(() => {
    const edits = Object.entries(pendingEdits).map(([rIdx, changes]) => ({
      rowIndex: Number(rIdx), originalRow: rows[Number(rIdx)], changes,
    }));
    if (fireWidgetEvent) fireWidgetEvent("onBulkEdit", { edits });
    setPendingEdits({});
  }, [pendingEdits, rows, fireWidgetEvent]);

  const handleBulkAction = useCallback((actionKey) => {
    const selectedIndices = Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number);
    const selectedRows = selectedIndices.map(i => rows[i]);
    if (actionKey === "delete") {
      if (fireWidgetEvent) fireWidgetEvent("onBulkDelete", { selectedRows, selectedRowIndices: selectedIndices });
    } else if (actionKey === "export") {
      if (fireWidgetEvent) fireWidgetEvent("onBulkExport", { selectedRows, format: "csv" });
    } else {
      if (fireWidgetEvent) fireWidgetEvent("onBulkAction", { actionKey, selectedRows });
    }
  }, [rowSelection, rows, fireWidgetEvent]);

  const handleRowSelect = useCallback((rowOriginal, rowIdx) => {
    if (setWidgetState) setWidgetState(prev => ({ ...prev, selectedRowIndex: rowIdx, selectedRow: rowOriginal }));
    if (onRowSelect) onRowSelect(rowOriginal, rowIdx);
    if (fireWidgetEvent) fireWidgetEvent("onRowSelect", { row: rowOriginal, rowIndex: rowIdx });
  }, [setWidgetState, onRowSelect, fireWidgetEvent]);

  // ── Widget methods (registered once; live data via refs) ──
  const rowsRef = useRef(rows);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  const runtimeRef = useRef({ setWidgetState, onRowSelect, fireWidgetEvent, runWorkflow, refreshData });
  useEffect(() => { runtimeRef.current = { setWidgetState, onRowSelect, fireWidgetEvent, runWorkflow, refreshData }; });

  const widgetMethodsRef = useRef(null);
  if (!widgetMethodsRef.current) {
    widgetMethodsRef.current = {
      refresh: () => {
        const rt = runtimeRef.current;
        if (rt.runWorkflow) rt.runWorkflow();
        if (rt.refreshData) rt.refreshData();
      },
      setSelectedRow: (index) => {
        const i = Number(index);
        const currentRows = rowsRef.current;
        const rt = runtimeRef.current;
        if (!Number.isNaN(i) && i >= 0 && i < currentRows.length) {
          if (rt.setWidgetState) rt.setWidgetState(prev => ({ ...prev, selectedRowIndex: i, selectedRow: currentRows[i] }));
          if (rt.onRowSelect) rt.onRowSelect(currentRows[i], i);
          if (rt.fireWidgetEvent) rt.fireWidgetEvent("onRowSelect", { row: currentRows[i], rowIndex: i });
        }
      },
      clearSelection: () => {
        const rt = runtimeRef.current;
        setRowSelection({});
        if (rt.setWidgetState) rt.setWidgetState(prev => ({ ...prev, selectedRowIndex: undefined, selectedRow: undefined, selectedRowIndices: [], selectedRows: [] }));
      },
    };
  }

  useEffect(() => {
    if (onWidgetInit) {
      onWidgetInit(widgetMethodsRef.current);
    }
  }, [onWidgetInit]);

  // ── Render states ──
  const showToolbar = searchConfig.enabled || exportConfig.enabled;
  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;
  const pendingEditCount = Object.values(pendingEdits).reduce((s, c) => s + Object.keys(c).length, 0);

  // Determine which rows to display and pagination info
  const displayRowModels = serverMode ? table.getCoreRowModel().rows : table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Loading data...
          </div>
        ) : (
          <>
            <p>{emptyText}</p>
            <p className="text-xs mt-1">{emptyHint}</p>
          </>
        )}
      </div>
    );
  }

  if (configColumns.length === 0) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6">
        <p>No visible columns.</p>
        <p className="text-xs mt-1">All columns are hidden — enable at least one column in Properties.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 gap-3 flex-shrink-0">
          {searchConfig.enabled ? (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                value={globalFilter ?? ""}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder={searchConfig.placeholder || "Search..."}
                className="h-7 text-xs pl-8 bg-background border-border rounded"
              />
            </div>
          ) : <div />}
          <div className="flex items-center gap-2">
            {exportConfig.enabled && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleExport}>
                <FileDown className="h-3.5 w-3.5 mr-1.5" />
                {exportConfig.buttonLabel || "Export"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm border-collapse">
          <thead className={stickyHeader ? "sticky top-0 z-10 bg-muted/50 backdrop-blur-sm" : "bg-muted/50"}>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className={`${cellPad} text-left text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap select-none`}
                    style={header.column.getSize() ? { width: header.column.getSize(), minWidth: header.column.getSize() } : undefined}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {displayRowModels.map((row, stripeIdx) => {
              const rowIdx = row.index;
              const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
              const hasPendingEdits = !!pendingEdits[rowIdx];
              const isRowSelected = row.getIsSelected();

              return (
                <tr
                  key={row.id}
                  className={`border-b border-border/50 last:border-b-0 cursor-pointer transition-colors ${
                    isRowSelected ? "bg-primary/5" :
                    isRowEditing ? "bg-primary/5" :
                    hasPendingEdits ? "bg-primary/[0.03]" :
                    widgetState?.selectedRowIndex === rowIdx ? "bg-primary/5 hover:bg-primary/10" :
                    striped && stripeIdx % 2 === 1 ? "bg-muted/20 hover:bg-muted/30" :
                    "hover:bg-muted/30"
                  }`}
                >
                  {row.getVisibleCells().map(cell => {
                    const isEditable = cell.column.columnDef.meta?.editable;
                    const colId = cell.column.id;
                    const isSpecialCol = colId === "_select" || colId === "_actions";

                    return (
                      <td
                        key={cell.id}
                        className={`${cellPad} text-sm text-foreground whitespace-nowrap`}
                        onClick={(e) => {
                          if (isSpecialCol) return; // Special columns handle their own action clicks

                          if (bulkEditConfig.enabled && isEditable) {
                            e.stopPropagation();
                            // Debounce the row selection click slightly so double-clicks can cancel it
                            if (clickTimeoutRef.current) {
                              clearTimeout(clickTimeoutRef.current);
                            }
                            clickTimeoutRef.current = setTimeout(() => {
                              handleRowSelect(row.original, rowIdx);
                              clickTimeoutRef.current = null;
                            }, 220);
                          } else {
                            // Non-editable columns trigger row selection instantly
                            handleRowSelect(row.original, rowIdx);
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (isSpecialCol) return;

                          if (bulkEditConfig.enabled && isEditable) {
                            e.stopPropagation();
                            if (clickTimeoutRef.current) {
                              clearTimeout(clickTimeoutRef.current);
                              clickTimeoutRef.current = null;
                            }
                            setEditingCell({ rowIdx, colId });
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating bars */}
      <div className="absolute bottom-12 left-0 right-0 px-4 flex flex-col gap-2 pointer-events-none z-30">
        {/* Multi-select action bar */}
        {multiSelectConfig.enabled && selectedCount > 0 && (
          <div className="flex items-center justify-between bg-card border border-border shadow-md rounded p-3 pointer-events-auto">
            <span className="text-xs font-medium text-foreground px-2">
              <span className="text-primary font-medium">{selectedCount}</span> row{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              {(multiSelectConfig.actions || []).map((act, i) => (
                <Button key={i} size="sm" variant={act.variant === "destructive" ? "destructive" : "outline"}
                  className="h-7 text-xs" onClick={() => handleBulkAction(act.actionKey)}>
                  {act.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Bulk edit save bar */}
        {bulkEditConfig.enabled && pendingEditCount > 0 && (
          <div className="flex items-center justify-between bg-card border border-primary/30 shadow-md rounded p-3 pointer-events-auto">
            <span className="text-xs font-medium text-foreground px-2">
              <span className="text-primary font-medium">{pendingEditCount}</span> unsaved change{pendingEditCount !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setPendingEdits({})}>
                Discard
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveBulkEdits}>
                {bulkEditConfig.saveLabel || "Save All Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {serverMode ? (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{serverTotalRows} total row{serverTotalRows !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Page {serverPage} of {serverTotalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(1)} disabled={serverPage === 1 || isLoading}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverPage - 1)} disabled={serverPage === 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverPage + 1)} disabled={serverPage >= serverTotalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverTotalPages)} disabled={serverPage >= serverTotalPages || isLoading}><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      ) : rows.length > pageSize && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total row{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

TableWidget.propTypes = {
  widgetConfig: PropTypes.object,
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  runWorkflow: PropTypes.func,
  isLoadingWorkflows: PropTypes.bool,
  onWidgetInit: PropTypes.func,
  refreshData: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  onRowSelect: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default TableWidget;
