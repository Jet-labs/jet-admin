import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@jet-admin/ui";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";

/**
 * TableWidget
 *
 * Renders tabular data from workflow context.
 * Supports server-side pagination by calling `runWorkflow` with
 * the configured page/pageSize arg keys as inputParams.
 */
export const TableWidget = ({
  widgetConfig,
  data: processedData,
  runWorkflow,
  isLoadingWorkflows,
}) => {
  const tableData = useMemo(() => {
    if (processedData && typeof processedData === "object") {
      // processedData comes from the builder — it has { data, columns, pagination }
      if (Array.isArray(processedData.data)) return processedData;
    }
    // Fallback: data is directly an array (no builder processing)
    if (Array.isArray(processedData)) {
      return { data: processedData, columns: [], pagination: { enabled: false } };
    }
    return { data: [], columns: [], pagination: { enabled: false } };
  }, [processedData]);

  const rows = tableData.data;

  // Resolve columns: configured > auto-detected from first row keys
  const activeColumns = useMemo(() => {
    const configColumns = tableData.columns?.length
      ? tableData.columns
      : widgetConfig?.columns?.length
        ? widgetConfig.columns
        : [];

    if (configColumns.length > 0) return configColumns;

    // Auto-detect from data
    if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
      return Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
    }
    return [];
  }, [tableData.columns, widgetConfig?.columns, rows]);

  // Pagination state
  const paginationConfig = tableData.pagination?.enabled
    ? tableData.pagination
    : widgetConfig?.pagination?.enabled
      ? widgetConfig.pagination
      : null;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalRows = paginationConfig?.totalRows ?? rows.length;
  const totalPages = paginationConfig
    ? Math.max(1, Math.ceil(totalRows / pageSize))
    : 1;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (paginationConfig && runWorkflow) {
      runWorkflow({
        inputParams: {
          [paginationConfig.pageParam || "page"]: newPage,
          [paginationConfig.pageSizeParam || "limit"]: pageSize,
        },
      });
    }
  };

  // If backend does slicing, rows is already the page slice.
  // If all data is returned at once, do client-side slicing.
  const isBackendPaginated =
    paginationConfig && totalRows > rows.length;

  const displayRows = isBackendPaginated
    ? rows
    : paginationConfig
      ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : rows;

  // Empty / No data state
  if (!rows || rows.length === 0) {
    if (isLoadingWorkflows) {
      return (
        <div className="flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6 relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/90 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-md bg-slate-100/90 px-4 py-2 text-sm text-slate-500 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Loading data…
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6">
        <p>No data available.</p>
        <p className="text-xs mt-1">
          Ensure the data array template resolves to a non-empty array.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden relative">
      {isLoadingWorkflows && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/50 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-md bg-slate-100/90 px-4 py-2 text-sm text-slate-500 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            Updating data…
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <tr>
              {activeColumns.map((col, idx) => (
                <th
                  key={idx}
                  className="text-left px-3 py-2 text-xs font-medium text-muted-foreground border-b whitespace-nowrap select-none"
                >
                  {col.label || col.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {activeColumns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-sm text-foreground whitespace-nowrap"
                  >
                    {row[col.key] != null ? String(row[col.key]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {paginationConfig && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20 gap-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {totalRows} total row{totalRows !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              square
              className="h-7 w-7"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoadingWorkflows}
            >
              <MdFirstPage className="text-base" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              square
              className="h-7 w-7"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingWorkflows}
            >
              <MdChevronLeft className="text-base" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              square
              className="h-7 w-7"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingWorkflows}
            >
              <MdChevronRight className="text-base" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              square
              className="h-7 w-7"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoadingWorkflows}
            >
              <MdLastPage className="text-base" />
            </Button>
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
};

export default TableWidget;
