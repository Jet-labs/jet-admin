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
import { Button, Input, Checkbox, Badge, SkeletonTable, WidgetBusy, WidgetEmpty, WidgetError, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from "@jet-admin/ui";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Pencil, Check, X, FileDown, ArrowUp, ArrowDown, ChevronsUpDown,
  ChevronDown, ChevronRight as ChevronExpand, Save, Trash2,
} from "lucide-react";
import {
  getNestedValue,
  normalizeColumns,
  formatCellValue,
  buildCSVContent,
  buildJSONContent,
  buildXLSXBytes,
  coerceTotalRows,
  resolvePageSize,
  diffRowChanges,
} from "./tableUtils";
import { evaluateConditions } from "../config/ConditionBuilder";

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

const withExtension = (filename, extension) => {
  if (!filename) return undefined;
  const value = String(filename).trim();
  if (!value) return undefined;
  return value.toLowerCase().endsWith(`.${extension}`) ? value : `${value}.${extension}`;
};

const downloadCSV = (columns, rows, filename) =>
  downloadFile(buildCSVContent(columns, rows), withExtension(filename, "csv") || `export-${Date.now()}.csv`, "text/csv;charset=utf-8;");

const downloadJSON = (columns, rows, filename) =>
  downloadFile(buildJSONContent(columns, rows), withExtension(filename, "json") || `export-${Date.now()}.json`, "application/json");

const downloadXLSX = (columns, rows, filename) =>
  downloadFile(
    buildXLSXBytes(columns, rows),
    withExtension(filename, "xlsx") || `export-${Date.now()}.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

// ── Editable Cell Component ──
const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => { setValue(initialValue); }, [initialValue]);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  const onBlur = () => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
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
        if (e.key === "Escape") {
          cancelledRef.current = true;
          setValue(initialValue);
          e.stopPropagation();
          e.target.blur();
        }
        if (e.key === "Tab") { onBlur(); }
      }}
      className="h-7 w-full rounded border-primary/30 bg-background text-xs focus-visible:ring-primary/50"
    />
  );
};

// ── Typed cell renderer ──
const TypedCellValue = ({ rawValue, col }) => {
  const type = col.type || "text";
  const align = col.align || (type === "number" || type === "currency" || type === "date" ? "right" : "left");
  const alignClass = align === "right" ? "text-right tabular-nums" : align === "center" ? "text-center" : "text-left";
  if (type === "link") {
    const href = rawValue ? String(rawValue) : "";
    if (!href) return <span className="text-muted-foreground">—</span>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block max-w-[240px] truncate text-primary underline underline-offset-2 hover:opacity-80">
        {col.format || href}
      </a>
    );
  }
  if (type === "image") {
    const src = rawValue ? String(rawValue) : "";
    if (!src) return <span className="text-muted-foreground">—</span>;
    return <img src={src} alt={col.label || "image"} className="h-8 w-8 rounded-control border border-border object-cover" loading="lazy" onClick={(e) => e.stopPropagation()} />;
  }
  if (type === "badge") {
    const text = formatCellValue(rawValue, { type: "text" });
    if (text === "—") return <span className="text-muted-foreground">—</span>;
    return <Badge variant="secondary" className="whitespace-nowrap text-[11px]">{text}</Badge>;
  }
  if (type === "boolean") {
    if (rawValue === true || rawValue === "true" || rawValue === 1 || rawValue === "1")
      return <Badge variant="secondary" className="border-success/25 bg-success/10 text-[11px] text-success">Yes</Badge>;
    if (rawValue === false || rawValue === "false" || rawValue === 0 || rawValue === "0")
      return <Badge variant="secondary" className="bg-muted text-[11px] text-muted-foreground">No</Badge>;
    return <span className="text-muted-foreground">—</span>;
  }
  if (type === "currency") {
    const number = Number(rawValue);
    if (!Number.isFinite(number)) return <span className={alignClass}>{formatCellValue(rawValue, { type: "text" })}</span>;
    try {
      return (
        <span className={alignClass}>
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: col.currency || "USD",
            minimumFractionDigits: col.decimals === undefined ? 0 : Number(col.decimals),
            maximumFractionDigits: col.decimals === undefined ? 2 : Number(col.decimals),
          }).format(number)}
        </span>
      );
    } catch {
      return <span className={alignClass}>{String(rawValue)}</span>;
    }
  }
  if (type === "progress") {
    const number = Math.max(0, Math.min(100, Number(rawValue) || 0));
    return (
      <span className="flex min-w-[80px] items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-primary" style={{ width: `${number}%` }} />
        </span>
        <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">{Math.round(number)}%</span>
      </span>
    );
  }
  const display = formatCellValue(rawValue, col);
  return <span className={alignClass}>{display}</span>;
};

// ── Main TableWidget ──
export const TableWidget = ({
  widgetConfig,
  widgetTitle,
  widgetID,
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
  const rowKey = widgetConfig?.rowKey || "id";
  const resolveRowId = useCallback(
    (row, index) => {
      const key = row?.[rowKey];
      return key !== undefined && key !== null && key !== "" ? String(key) : `__row_${index}`;
    },
    [rowKey]
  );

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
  const serverMode = !!paginationConfig && (paginationConfig.mode ? paginationConfig.mode === "server" : true);
  const pageSize = resolvePageSize(paginationConfig?.pageSize, widgetConfig?.pagination?.pageSize, 10);
  const searchConfig = tableData.search || widgetConfig?.search || { enabled: false };
  const exportConfig = tableData.export || widgetConfig?.export || { enabled: false };
  const editingConfig = tableData.editing || widgetConfig?.editing || { enabled: false };
  const multiSelectConfig = tableData.multiSelect || widgetConfig?.multiSelect || { enabled: false };
  const bulkEditConfig = tableData.bulkEdit || widgetConfig?.bulkEdit || { enabled: false };
  const emptyText = tableData.emptyText || widgetConfig?.emptyText || "No data available.";
  const emptyHint = widgetConfig?.emptyHint || "Ensure the data array template resolves to a non-empty array.";
  const noResultsText = widgetConfig?.noResultsText || "No rows match the current filters.";
  const loadingText = widgetConfig?.loadingText || "Updating...";
  const searchingText = widgetConfig?.searchingText || "Searching...";
  const striped = widgetConfig?.striped !== false;
  const dense = !!widgetConfig?.dense;
  const hoverHighlight = widgetConfig?.hoverHighlight !== false;
  const stickyHeader = widgetConfig?.stickyHeader !== false;
  const density = widgetConfig?.properties?.density || (dense ? "compact" : "comfortable");
  const cellPad = density === "compact" ? "px-2 py-1" : density === "spacious" ? "px-3 py-3" : "px-3 py-2";
  const errorText = tableData.error || widgetConfig?.error;
  const resizableColumns = !!widgetConfig?.resizableColumns;
  const virtualizeRows = !!widgetConfig?.virtualize;
  const expandableRows = !!widgetConfig?.expandableRows;
  const detailFields = Array.isArray(widgetConfig?.detailFields) ? widgetConfig.detailFields.filter(Boolean) : [];
  const detailTitleKey = widgetConfig?.detailTitleKey || "";
  const savedViewsConfig = widgetConfig?.savedViews || {};
  const savedViewsEnabled = !!savedViewsConfig.enabled;
  const savedViewsStorageKey = `jet.table.views.${savedViewsConfig.storageKey || widgetID || widgetTitle || "default"}`;

  // ── Local state ──
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const loadingMessage = isSearching ? searchingText : loadingText;
  const [sorting, setSorting] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [rowDraft, setRowDraft] = useState({});
  const [pendingEdits, setPendingEdits] = useState({});
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, colId }
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [columnSizing, setColumnSizing] = useState({});
  const [columnPinning, setColumnPinning] = useState({ left: [], right: [] });
  const [expandedRowIds, setExpandedRowIds] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState("");
  const [viewName, setViewName] = useState("");
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false);
  const [scrollState, setScrollState] = useState({ top: 0, height: 0 });
  const clickTimeoutRef = useRef(null);

  // Column pinning follows column config (saved views can override it later).
  const pinSignature = configColumns.map((column) => `${column.key}:${column.pinned || ""}`).join("|");
  useEffect(() => {
    setColumnPinning({
      left: configColumns.filter((column) => column.pinned === "left").map((column) => column.key),
      right: configColumns.filter((column) => column.pinned === "right").map((column) => column.key),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinSignature]);

  // Load saved views for this table instance.
  useEffect(() => {
    if (!savedViewsEnabled || typeof window === "undefined") {
      setSavedViews([]);
      return;
    }
    try {
      const raw = window.localStorage.getItem(savedViewsStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedViews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedViews([]);
    }
  }, [savedViewsEnabled, savedViewsStorageKey]);

  const persistViews = useCallback((next) => {
    setSavedViews(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(savedViewsStorageKey, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
  }, [savedViewsStorageKey]);

  const saveCurrentView = useCallback(() => {
    const name = viewName.trim();
    if (!name) return;
    const view = {
      id: `view_${Date.now()}`,
      name,
      globalFilter,
      columnFilters,
      sorting,
      columnSizing,
      columnPinning,
      pageSize: pagination.pageSize,
    };
    const next = [...savedViews.filter((item) => item.name !== name), view];
    persistViews(next);
    setActiveViewId(view.id);
    setViewName("");
    setViewPopoverOpen(false);
  }, [viewName, globalFilter, columnFilters, sorting, columnSizing, columnPinning, pagination.pageSize, savedViews, persistViews]);

  const applySavedView = useCallback((viewId) => {
    setActiveViewId(viewId);
    if (!viewId) return;
    const view = savedViews.find((item) => item.id === viewId);
    if (!view) return;
    setGlobalFilter(view.globalFilter || "");
    setColumnFilters(Array.isArray(view.columnFilters) ? view.columnFilters : []);
    setSorting(Array.isArray(view.sorting) ? view.sorting : []);
    setColumnSizing(view.columnSizing || {});
    setColumnPinning(view.columnPinning || { left: [], right: [] });
    setPagination((current) => ({ ...current, pageIndex: 0, pageSize: Number(view.pageSize) || current.pageSize }));
  }, [savedViews]);

  const deleteSavedView = useCallback(() => {
    if (!activeViewId) return;
    persistViews(savedViews.filter((item) => item.id !== activeViewId));
    setActiveViewId("");
  }, [activeViewId, savedViews, persistViews]);

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

  // ── Server-side search ──
  // Server-side search is explicit: click the search button or press Enter.
  // This avoids firing a query on every keystroke and lets the bound query's
  // isLoading state drive the table overlay.
  const runServerSearch = useCallback(async () => {
    if (!searchConfig.serverSide || !fireWidgetEvent) return;
    setIsSearching(true);
    try {
      await fireWidgetEvent("onSearch", { searchTerm: globalFilter.trim() });
    } finally {
      setIsSearching(false);
    }
  }, [fireWidgetEvent, globalFilter, searchConfig.serverSide]);

  // ── Sync selection state to runtime ──
  const lastSyncSignatureRef = useRef(null);
  useEffect(() => {
    if (!setWidgetState) return;
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    const selectedIndices = selectedIds
      .map((id) => rows.findIndex((row, index) => resolveRowId(row, index) === id))
      .filter((index) => index >= 0);
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
  }, [globalFilter, rowSelection, rows, pendingEdits, setWidgetState, resolveRowId]);

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

    // Expand column for detail rows
    if (expandableRows) {
      defs.push({
        id: "_expand",
        header: () => null,
        cell: ({ row }) => {
          const isOpen = !!expandedRowIds[row.id];
          return (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpandedRowIds((prev) => {
                  const next = { ...prev };
                  if (next[row.id]) delete next[row.id];
                  else next[row.id] = true;
                  return next;
                });
                fireWidgetEvent?.("onRowExpand", { row: row.original, rowIndex: row.index, expanded: !isOpen });
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={isOpen ? "Collapse row details" : "Expand row details"}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronExpand className="h-3.5 w-3.5" />}
            </button>
          );
        },
        size: 36,
        enableSorting: false,
        enableGlobalFilter: false,
        enableResizing: false,
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

          const cellValue = getValue();
          const styleConfig = col.conditionalStyles;
          let conditionalClass = "";
          if (styleConfig && Array.isArray(styleConfig.rules) && styleConfig.rules.length > 0) {
            try {
              const matches = evaluateConditions(styleConfig, { row: row.original, value: cellValue, ...row.original });
              if (matches) {
                const tone = styleConfig.style?.tone || "neutral";
                const emphasis = styleConfig.style?.emphasis || "normal";
                const toneText = {
                  success: "text-success",
                  warning: "text-warning",
                  danger: "text-destructive",
                  info: "text-info",
                  primary: "text-primary",
                  neutral: "text-foreground",
                }[tone] || "text-foreground";
                const toneBg = {
                  success: "bg-success/10",
                  warning: "bg-warning/10",
                  danger: "bg-destructive/10",
                  info: "bg-info/10",
                  primary: "bg-primary/10",
                  neutral: "",
                }[tone] || "";
                conditionalClass = cn(
                  "inline-flex min-w-0 max-w-full items-center rounded-[2px] px-0.5",
                  toneText,
                  toneBg,
                  emphasis === "bold" && "font-semibold",
                  emphasis === "muted" && "text-muted-foreground"
                );
              }
            } catch {
              conditionalClass = "";
            }
          }

          return (
            <span className={conditionalClass || undefined}>
              <TypedCellValue rawValue={cellValue} col={col} />
            </span>
          );
        },
        meta: { editable: col.editable, align: col.align, conditionalStyles: col.conditionalStyles },
        enableSorting: col.sortable !== false,
        enableColumnFilter: !!col.filterable,
        enablePinning: true,
        enableResizing: resizableColumns,
        size: typeof col.width === "number" ? col.width : undefined,
        minSize: Number(col.minWidth) > 0 ? Number(col.minWidth) : 60,
        maxSize: Number(col.maxWidth) > 0 ? Number(col.maxWidth) : undefined,
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
  }, [configColumns, multiSelectConfig, editingConfig, bulkEditConfig, expandableRows, expandedRowIds, resizableColumns, fireWidgetEvent]);

  // ── TanStack Table instance ──
  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: {
      globalFilter: (searchConfig.enabled && !searchConfig.serverSide) ? globalFilter : undefined,
      columnFilters,
      rowSelection,
      pagination: serverMode ? undefined : pagination,
      sorting,
      columnSizing,
      columnPinning,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    enableColumnResizing: resizableColumns,
    columnResizeMode: "onChange",
    enablePinning: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverMode ? undefined : getFilteredRowModel(),
    getPaginationRowModel: !serverMode ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row, index) => resolveRowId(row, index),
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
      if (fireWidgetEvent) fireWidgetEvent("onExport", { format, rowCount: rows.length, scope: exportConfig.scope || "filtered" });
      return;
    }
    const scope = exportConfig.scope || "filtered";
    let visibleRows;
    try {
      if (scope === "selected") {
        const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
        visibleRows = selectedIds
          .map((id) => {
            const index = rows.findIndex((row, rowIndex) => resolveRowId(row, rowIndex) === id);
            return index >= 0 ? rows[index] : null;
          })
          .filter(Boolean);
      } else if (scope === "page") {
        visibleRows = table.getRowModel().rows.map((row) => row.original);
      } else if (scope === "all") {
        visibleRows = rows;
      } else {
        visibleRows = table.getFilteredRowModel().rows.map((row) => row.original);
      }
    } catch {
      visibleRows = rows;
    }
    if (format === "json") downloadJSON(configColumns, visibleRows);
    else if (format === "xlsx") downloadXLSX(configColumns, visibleRows, exportConfig.filename);
    else downloadCSV(configColumns, visibleRows, exportConfig.filename);
    if (fireWidgetEvent) fireWidgetEvent("onExport", { format, rowCount: visibleRows.length, scope });
  }, [exportConfig, fireWidgetEvent, rows, table, configColumns, rowSelection, resolveRowId]);

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
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    const selectedIndices = selectedIds
      .map((id) => rows.findIndex((row, index) => resolveRowId(row, index) === id))
      .filter((index) => index >= 0);
    const selectedRows = selectedIndices.map(i => rows[i]);
    if (actionKey === "delete") {
      if (fireWidgetEvent) fireWidgetEvent("onBulkDelete", { selectedRows, selectedRowIndices: selectedIndices });
    } else if (actionKey === "export") {
      if (fireWidgetEvent) fireWidgetEvent("onBulkExport", { selectedRows, format: "csv" });
    } else {
      if (fireWidgetEvent) fireWidgetEvent("onBulkAction", { actionKey, selectedRows });
    }
  }, [rowSelection, rows, fireWidgetEvent, resolveRowId]);

  // Single dispatch route (B04/F02): row selection notifies ONLY the direct
  // onRowSelect callback. The page slot shapes it into exactly one
  // fireWidgetEvent("onRowSelect", { row, rowIndex }) call; firing here too
  // would execute the action chain twice with differing payloads.
  const handleRowSelect = useCallback((rowOriginal, rowIdx) => {
    if (setWidgetState) setWidgetState(prev => ({ ...prev, selectedRowIndex: rowIdx, selectedRow: rowOriginal }));
    if (onRowSelect) onRowSelect(rowOriginal, rowIdx);
  }, [setWidgetState, onRowSelect]);

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
      // Programmatic selection emits the same single onRowSelect event as a
      // click (exactly-once policy for method-triggered events).
      setSelectedRow: (index) => {
        const i = Number(index);
        const currentRows = rowsRef.current;
        const rt = runtimeRef.current;
        if (!Number.isNaN(i) && i >= 0 && i < currentRows.length) {
          if (rt.setWidgetState) rt.setWidgetState(prev => ({ ...prev, selectedRowIndex: i, selectedRow: currentRows[i] }));
          if (rt.onRowSelect) rt.onRowSelect(currentRows[i], i);
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
  const showToolbar = searchConfig.enabled || exportConfig.enabled || savedViewsEnabled;
  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;
  const pendingEditCount = Object.values(pendingEdits).reduce((s, c) => s + Object.keys(c).length, 0);
  const filterableColumns = configColumns.filter((column) => column.filterable);
  const hasActiveFilters = !!globalFilter || columnFilters.length > 0;

  // Determine which rows to display and pagination info
  const displayRowModels = serverMode ? table.getCoreRowModel().rows : table.getRowModel().rows;
  const noMatches = rows.length > 0 && displayRowModels.length === 0 && hasActiveFilters;

  // Window very long unpaginated pages without a virtualization dependency.
  const rowHeight = density === "compact" ? 33 : density === "spacious" ? 49 : 41;
  const virtualizeEnabled = virtualizeRows && !serverMode && displayRowModels.length > 40 && Object.keys(expandedRowIds).length === 0;
  const virtualViewportHeight = scrollState.height || 480;
  const virtualOverscan = 8;
  const virtualStart = virtualizeEnabled ? Math.max(0, Math.floor(scrollState.top / rowHeight) - virtualOverscan) : 0;
  const virtualEnd = virtualizeEnabled
    ? Math.min(displayRowModels.length, Math.ceil((scrollState.top + virtualViewportHeight) / rowHeight) + virtualOverscan)
    : displayRowModels.length;
  const windowRowModels = virtualizeEnabled ? displayRowModels.slice(virtualStart, virtualEnd) : displayRowModels;
  const topSpacerHeight = virtualizeEnabled ? virtualStart * rowHeight : 0;
  const bottomSpacerHeight = virtualizeEnabled ? Math.max(0, (displayRowModels.length - virtualEnd) * rowHeight) : 0;
  const visibleColumnCount = table.getVisibleLeafColumns().length || configColumns.length;
  const currentViewName = savedViews.find((view) => view.id === activeViewId)?.name || "";

  if (errorText && !isLoading) {
    return (
      <div className={`widget-density-${density} flex h-full w-full flex-col`} data-density={density}>
        <WidgetError
          title="Could not load table data"
          message={String(errorText)}
          onRetry={refreshData ? () => refreshData() : runWorkflow ? () => runWorkflow() : undefined}
        />
      </div>
    );
  }

  if (isLoading && rows.length === 0) {
    return (
      <div className={`widget-density-${density} relative flex h-full w-full flex-col p-2`} data-density={density} aria-busy="true">
        <span className="sr-only" role="status" aria-live="polite">{loadingMessage}</span>
        <SkeletonTable rows={6} columns={Math.max(3, configColumns.length || 4)} />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={`widget-density-${density} flex h-full w-full flex-col`} data-density={density}>
        <WidgetEmpty
          title={emptyText}
          description={emptyHint}
          action={
            refreshData ? (
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => refreshData()}>
                Retry
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  if (configColumns.length === 0) {
    return (
      <div className={`widget-density-${density} flex h-full w-full flex-col`} data-density={density}>
        <WidgetEmpty
          title="No visible columns"
          description="All columns are hidden. Enable at least one column in the Content tab."
        />
      </div>
    );
  }

  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  const leftPinOffsets = {};
  let leftCursor = 0;
  for (const column of table.getLeftLeafColumns()) {
    leftPinOffsets[column.id] = leftCursor;
    leftCursor += column.getSize();
  }
  const rightPinOffsets = {};
  let rightCursor = 0;
  for (const column of [...table.getRightLeafColumns()].reverse()) {
    rightPinOffsets[column.id] = rightCursor;
    rightCursor += column.getSize();
  }

  const pinStyleFor = (column, header = false) => {
    const pinned = column.getIsPinned?.();
    if (!pinned) return undefined;
    const zIndex = header ? 25 : 6;
    if (pinned === "left") {
      return { position: "sticky", left: leftPinOffsets[column.id] ?? 0, zIndex, boxShadow: "1px 0 0 hsl(var(--border))" };
    }
    if (pinned === "right") {
      return { position: "sticky", right: rightPinOffsets[column.id] ?? 0, zIndex, boxShadow: "-1px 0 0 hsl(var(--border))" };
    }
    return undefined;
  };

  return (
    <div className={`widget-density-${density} relative flex h-full w-full min-h-0 flex-col overflow-hidden`} data-density={density} aria-busy={(isLoading || isSearching) || undefined}>
      {/* Loading overlay */}
      {(isLoading || isSearching) && (
        <WidgetBusy label={loadingMessage} />
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
                onKeyDown={e => {
                  if (e.key === "Enter" && searchConfig.serverSide) {
                    e.preventDefault();
                    runServerSearch();
                  }
                }}
                placeholder={searchConfig.placeholder || "Search..."}
                className={`h-7 text-xs pl-8 bg-background border-border rounded ${searchConfig.serverSide ? "pr-9" : ""}`}
                aria-label={searchConfig.serverSide ? "Search (press Enter)" : "Search"}
              />
              {searchConfig.serverSide && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0.5 top-0.5 h-6 w-6"
                  onClick={runServerSearch}
                  disabled={isSearching || isLoading || !fireWidgetEvent}
                  aria-label="Run search"
                  title="Run search"
                >
                  {isSearching || isLoading ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" className="animate-spin">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
              {globalFilter && !searchConfig.serverSide && (
                <button
                  type="button"
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-0.5 top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : <div />}
          <div className="flex items-center gap-2">
            {savedViewsEnabled && (
              <>
                <Select
                  value={activeViewId || "__current"}
                  onValueChange={(value) => applySavedView(value === "__current" ? "" : value)}
                >
                  <SelectTrigger className="h-7 w-[150px] text-xs" aria-label="Saved table view">
                    <SelectValue placeholder="Views" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__current">Current view</SelectItem>
                    {savedViews.map((view) => (
                      <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover open={viewPopoverOpen} onOpenChange={setViewPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs" aria-label="Save current view">
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save view
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-60 space-y-2 p-2">
                    <p className="text-[11px] font-medium text-foreground">Save current view</p>
                    <p className="text-[10px] leading-snug text-muted-foreground">Stores search, filters, sorting, widths and pinned columns in this browser.</p>
                    <Input
                      value={viewName}
                      onChange={(event) => setViewName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveCurrentView();
                        }
                      }}
                      placeholder="View name"
                      aria-label="View name"
                      className="h-7 text-xs"
                    />
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setViewPopoverOpen(false)}>Cancel</Button>
                      <Button size="sm" className="h-7 text-xs" onClick={saveCurrentView} disabled={!viewName.trim()}>Save</Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {currentViewName && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={deleteSavedView}
                    aria-label={`Delete view ${currentViewName}`}
                    title={`Delete view ${currentViewName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
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
      <div
        className="min-h-0 flex-1 overflow-auto"
        onScroll={(event) => {
          if (!virtualizeEnabled) return;
          const target = event.currentTarget;
          setScrollState({ top: target.scrollTop, height: target.clientHeight });
        }}
      >
        {noMatches ? (
          <WidgetEmpty
            title={noResultsText}
            description="Adjust the search or column filters to see more rows."
            action={
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
        <table className="w-full border-collapse text-sm" aria-label={widgetTitle || "Data table"}>
          <thead className={stickyHeader ? "sticky top-0 z-10 bg-muted/50 backdrop-blur-sm" : "bg-muted/50"}>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
              <tr>
                {headerGroup.headers.map(header => {
                  const sorted = header.column.getIsSorted();
                  const pinned = header.column.getIsPinned?.();
                  return (
                  <th
                    key={header.id}
                    aria-sort={header.column.getCanSort() ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                    className={`relative ${cellPad} select-none border-b border-border text-left text-xs font-medium text-muted-foreground whitespace-nowrap ${pinned ? "bg-muted" : ""}`}
                    style={{ ...(header.column.getSize() ? { width: header.column.getSize(), minWidth: header.column.getSize() } : {}), ...(pinStyleFor(header.column, true) || {}) }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {resizableColumns && header.column.getCanResize() && (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${header.column.id} column`}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none ${header.column.getIsResizing() ? "bg-primary" : "bg-transparent hover:bg-primary/40"}`}
                      />
                    )}
                  </th>
                  );
                })}
              </tr>
              {filterableColumns.length > 0 && !serverMode && (
                <tr>
                  {headerGroup.headers.map((header) => {
                    const columnConfig = configColumns.find((column) => column.key === header.column.id);
                    const pinned = header.column.getIsPinned?.();
                    if (!columnConfig?.filterable) {
                      return <th key={`${header.id}-filter`} className={`border-b border-border/60 bg-muted/20 px-1 py-1 ${pinned ? "bg-muted" : ""}`} style={pinStyleFor(header.column, true)} />;
                    }
                    return (
                      <th key={`${header.id}-filter`} className={`border-b border-border/60 bg-muted/20 px-1 py-1 ${pinned ? "bg-muted" : ""}`} style={pinStyleFor(header.column, true)}>
                        <Input
                          value={(header.column.getFilterValue() ?? "")}
                          onChange={(event) => header.column.setFilterValue(event.target.value)}
                          placeholder={`Filter ${columnConfig.label || columnConfig.key}`}
                          aria-label={`Filter ${columnConfig.label || columnConfig.key}`}
                          className="h-6 w-full border-border/60 bg-background text-[10px]"
                        />
                      </th>
                    );
                  })}
                </tr>
              )}
              </React.Fragment>
            ))}
          </thead>
          <tbody>
            {topSpacerHeight > 0 && (
              <tr aria-hidden="true" style={{ height: topSpacerHeight }}>
                <td colSpan={visibleColumnCount} className="border-0 p-0" />
              </tr>
            )}
            {windowRowModels.map((row, windowIndex) => {
              const rowIdx = row.index;
              const stripeIdx = virtualizeEnabled ? virtualStart + windowIndex : windowIndex;
              const isRowEditing = editingConfig.enabled && editingRowId === rowIdx;
              const hasPendingEdits = !!pendingEdits[rowIdx];
              const isRowSelected = row.getIsSelected();
              const isExpanded = !!expandedRowIds[row.id];

              return (
                <React.Fragment key={row.id}>
                <tr
                  tabIndex={0}
                  aria-selected={isRowSelected || widgetState?.selectedRowIndex === rowIdx}
                  aria-expanded={expandableRows ? isExpanded : undefined}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleRowSelect(row.original, rowIdx);
                    }
                  }}
                  className={`cursor-pointer border-b border-border/50 transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                    isRowSelected ? "bg-primary/5" :
                    isRowEditing ? "bg-primary/5" :
                    hasPendingEdits ? "bg-primary/[0.03]" :
                    widgetState?.selectedRowIndex === rowIdx ? "bg-primary/5 hover:bg-primary/10" :
                    striped && stripeIdx % 2 === 1 ? `bg-muted/20 ${hoverHighlight ? "hover:bg-muted/30" : ""}` :
                    hoverHighlight ? "hover:bg-muted/30" : ""
                  }`}
                >
                  {row.getVisibleCells().map(cell => {
                    const isEditable = cell.column.columnDef.meta?.editable;
                    const colId = cell.column.id;
                    const isSpecialCol = colId === "_select" || colId === "_actions" || colId === "_expand";
                    const pinned = cell.column.getIsPinned?.();

                    return (
                      <td
                        key={cell.id}
                        className={`${cellPad} text-sm text-foreground whitespace-nowrap ${pinned ? "bg-background" : ""}`}
                        style={pinStyleFor(cell.column)}
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
                {expandableRows && isExpanded && (
                  <tr className="border-b border-border/50 bg-muted/20">
                    <td colSpan={visibleColumnCount} className="p-0">
                      <div className="flex flex-col gap-2 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {detailTitleKey && row.original?.[detailTitleKey] !== undefined ? (
                              <p className="truncate text-xs font-semibold text-foreground">{String(row.original[detailTitleKey])}</p>
                            ) : (
                              <p className="text-xs font-semibold text-foreground">Row details</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">Row {rowIdx + 1}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedRowIds((prev) => {
                                const next = { ...prev };
                                delete next[row.id];
                                return next;
                              });
                              fireWidgetEvent?.("onRowExpand", { row: row.original, rowIndex: rowIdx, expanded: false });
                            }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                            aria-label="Collapse row details"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                          {(detailFields.length ? detailFields : Object.keys(row.original || {}).slice(0, 12)).map((key) => (
                            <div key={key} className="min-w-0">
                              <dt className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{String(key).replace(/_/g, " ")}</dt>
                              <dd className="truncate text-xs text-foreground">
                                {formatCellValue(getNestedValue(row.original, key), { type: "text" })}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
            {bottomSpacerHeight > 0 && (
              <tr aria-hidden="true" style={{ height: bottomSpacerHeight }}>
                <td colSpan={visibleColumnCount} className="border-0 p-0" />
              </tr>
            )}
          </tbody>
        </table>
        )}
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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(1)} disabled={serverPage === 1 || isLoading} aria-label="First page" title="First page"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverPage - 1)} disabled={serverPage === 1 || isLoading} aria-label="Previous page" title="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverPage + 1)} disabled={serverPage >= serverTotalPages || isLoading} aria-label="Next page" title="Next page"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleServerPageChange(serverTotalPages)} disabled={serverPage >= serverTotalPages || isLoading} aria-label="Last page" title="Last page"><ChevronsRight className="h-4 w-4" /></Button>
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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} aria-label="First page" title="First page"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page" title="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page" title="Next page"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} aria-label="Last page" title="Last page"><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

TableWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetTitle: PropTypes.string,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
