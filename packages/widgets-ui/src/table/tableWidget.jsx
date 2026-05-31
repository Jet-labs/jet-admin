import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button, Input, Checkbox } from "@jet-admin/ui";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Download, Pencil, Check, X, FileDown,
} from "lucide-react";

// ── CSV Export Utility ──
const exportToCSV = (columns, rows, filename = "export.csv") => {
  const headers = columns.map(c => `"${(c.label || c.key || c.id).replace(/"/g, '""')}"`).join(",");
  const body = rows.map(r =>
    columns.map(c => {
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

const exportToJSON = (columns, rows, filename = "export.json") => {
  const keys = columns.map(c => c.key || c.id);
  const data = rows.map(r => {
    const obj = {};
    keys.forEach(k => { obj[k] = r[k] ?? null; });
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

  const rows = tableData.data || [];

  const isLoading = useMemo(() => {
    if (tableData.isLoading !== undefined) {
      return tableData.isLoading === true || tableData.isLoading === "true";
    }
    if (widgetConfig?.isLoading !== undefined) {
      return widgetConfig.isLoading === true || widgetConfig.isLoading === "true";
    }
    return !!isLoadingWorkflows;
  }, [tableData.isLoading, widgetConfig?.isLoading, isLoadingWorkflows]);

  // ── Resolve column definitions ──
  const configColumns = useMemo(() => {
    const cols = tableData.columns?.length ? tableData.columns
      : widgetConfig?.columns?.length ? widgetConfig.columns : [];
    if (cols.length > 0) return cols;
    if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
      return Object.keys(rows[0]).map(k => ({ key: k, label: k }));
    }
    return [];
  }, [tableData.columns, widgetConfig?.columns, rows]);

  // ── Feature configs ──
  const paginationConfig = tableData.pagination?.enabled ? tableData.pagination : widgetConfig?.pagination?.enabled ? widgetConfig.pagination : null;
  const searchConfig = tableData.search || widgetConfig?.search || { enabled: false };
  const exportConfig = tableData.export || widgetConfig?.export || { enabled: false };
  const editingConfig = tableData.editing || widgetConfig?.editing || { enabled: false };
  const multiSelectConfig = tableData.multiSelect || widgetConfig?.multiSelect || { enabled: false };
  const bulkEditConfig = tableData.bulkEdit || widgetConfig?.bulkEdit || { enabled: false };

  // ── Local state ──
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [rowDraft, setRowDraft] = useState({});
  const [pendingEdits, setPendingEdits] = useState({});
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, colId }
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const clickTimeoutRef = useRef(null);

  // Clear click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // ── Server-side search debounce ──
  useEffect(() => {
    if (!searchConfig.enabled || !searchConfig.serverSide) return;
    const timer = setTimeout(() => {
      if (fireWidgetEvent) fireWidgetEvent("onSearch", { searchTerm: globalFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter, searchConfig.serverSide, searchConfig.enabled, fireWidgetEvent]);

  // ── Sync selection state to runtime ──
  useEffect(() => {
    if (!setWidgetState) return;
    const selectedIndices = Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number);
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
        accessorKey: col.key,
        header: () => (
          <span className="flex items-center gap-1">
            {col.label || col.key}
            {col.editable && (editingConfig.enabled || bulkEditConfig.enabled) && (
              <Pencil className="w-3 h-3 opacity-40" />
            )}
          </span>
        ),
        cell: ({ getValue, row, column, table }) => {
          const rowIdx = row.index;
          const colId = column.id;
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

          const displayVal = hasPending ? pendingVal : getValue();
          return (
            <span className={hasPending ? "text-primary font-medium" : ""}>
              {displayVal != null ? String(displayVal) : "—"}
              {hasPending && <Pencil className="inline-block w-3 h-3 ml-1 text-primary/60" />}
            </span>
          );
        },
        meta: { editable: col.editable },
      });
    });

    // Actions column for inline editing
    if (editingConfig.enabled) {
      defs.push({
        id: "_actions",
        header: () => null,
        cell: ({ row }) => {
          const rowIdx = row.index;
          const isEditing = editingRowId === rowIdx;
          if (isEditing) {
            return (
              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:bg-primary/10"
                  onClick={() => handleSaveRow(rowIdx, row.original)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingRowId(null)}>
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
  }, [configColumns, multiSelectConfig, editingConfig, bulkEditConfig, editingRowId, rowDraft, editingCell, pendingEdits]);

  // ── TanStack Table instance ──
  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: {
      globalFilter: (searchConfig.enabled && !searchConfig.serverSide) ? globalFilter : undefined,
      rowSelection,
      pagination: paginationConfig ? undefined : pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: (searchConfig.enabled && !searchConfig.serverSide) ? getFilteredRowModel() : undefined,
    getPaginationRowModel: !paginationConfig ? getPaginationRowModel() : undefined,
    enableRowSelection: multiSelectConfig.enabled,
    meta: {
      updateCellData: (rowIdx, colId, value) => {
        setPendingEdits(prev => ({
          ...prev,
          [rowIdx]: { ...(prev[rowIdx] || {}), [colId]: value },
        }));
        setEditingCell(null);
      },
    },
  });

  // ── Server-side pagination handler ──
  const [serverPage, setServerPage] = useState(1);
  const serverPageSize = paginationConfig && rows.length > 0 ? rows.length : 10;
  const serverTotalRows = paginationConfig?.totalRows ?? rows.length;
  const serverTotalPages = paginationConfig ? Math.max(1, Math.ceil(serverTotalRows / serverPageSize)) : 1;

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
    const visibleRows = table.getFilteredRowModel().rows.map(r => r.original);
    if (format === "json") exportToJSON(configColumns, visibleRows, `export-${Date.now()}.json`);
    else exportToCSV(configColumns, visibleRows, `export-${Date.now()}.csv`);
  }, [exportConfig, fireWidgetEvent, rows, table, configColumns]);

  const handleSaveRow = useCallback((idx, originalRow) => {
    const changes = {};
    configColumns.forEach(c => {
      if (c.editable && String(originalRow[c.key]) !== String(rowDraft[c.key])) {
        changes[c.key] = rowDraft[c.key];
      }
    });
    if (fireWidgetEvent) fireWidgetEvent("onRowSave", { rowIndex: idx, originalRow, updatedRow: { ...rowDraft }, changes });
    setEditingRowId(null);
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

  // ── Widget init ──
  useEffect(() => {
    if (onWidgetInit) {
      onWidgetInit({
        refresh: () => { if (runWorkflow) runWorkflow(); if (refreshData) refreshData(); },
        setSelectedRow: (index) => {
          const i = Number(index);
          if (!isNaN(i) && i >= 0 && i < rows.length) {
            if (setWidgetState) setWidgetState(prev => ({ ...prev, selectedRowIndex: i, selectedRow: rows[i] }));
            if (onRowSelect) onRowSelect(rows[i], i);
          }
        },
      });
    }
  }, [onWidgetInit, runWorkflow, refreshData, rows, setWidgetState, onRowSelect]);

  // ── Render states ──
  const showToolbar = searchConfig.enabled || exportConfig.enabled;
  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;
  const pendingEditCount = Object.values(pendingEdits).reduce((s, c) => s + Object.keys(c).length, 0);

  // Determine which rows to display and pagination info
  const displayRowModels = paginationConfig ? table.getCoreRowModel().rows : table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Loading data...
          </div>
        ) : (
          <>
            <p>No data available.</p>
            <p className="text-xs mt-1">Ensure the data array template resolves to a non-empty array.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
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
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="text-left px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap select-none"
                    style={header.column.getSize() ? { width: header.column.getSize() } : undefined}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {displayRowModels.map(row => {
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
                        className="px-3 py-2 text-sm text-foreground whitespace-nowrap"
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
          <div className="flex items-center justify-between bg-card border border-border shadow-md rounded-lg p-3 pointer-events-auto">
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
          <div className="flex items-center justify-between bg-card border border-primary/30 shadow-md rounded-lg p-3 pointer-events-auto">
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
      {paginationConfig ? (
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
      ) : rows.length > 10 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 gap-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total row{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
