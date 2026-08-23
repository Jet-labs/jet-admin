import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { Download, X } from "lucide-react";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useRef, useState } from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { CONSTANTS } from "../../../constants";
import { exportAuditLogsCSVAPI, getAuditLogsAPI } from "../../../data/apis/auditLog";
import { DATAGRID_SX } from "../../../shared/dataGridTheme";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { AuditLogMetadataViewer } from "./AuditLogMetadataViewer";
import { getFormattedAuditLogColumns } from "./auditLogsGridColumnFormatter";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AuditLogsGrid = ({ tenantID }) => {
  AuditLogsGrid.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Date filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const datagridRef = useRef();
  const datagridAPIRef = useRef();

  // When a filter changes, reset to page 1
  const applyFilters = useCallback(
    ({ newDateFrom = appliedDateFrom, newDateTo = appliedDateTo } = {}) => {
      setAppliedDateFrom(newDateFrom);
      setAppliedDateTo(newDateTo);
      setPage(1);
    },
    [appliedDateFrom, appliedDateTo]
  );

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setPage(1);
  };

  const hasActiveFilters = appliedDateFrom || appliedDateTo;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAuditLogsCSVAPI({
        tenantID,
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
      });
    } catch (err) {
      console.error("Audit log CSV export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const {
    isLoading: isLoadingAuditLogs,
    data: auditLogsData,
    error: loadAuditLogsError,
    isFetching: isFetchingAuditLogs,
    isPreviousData: isPreviousAuditLogsData,
    refetch: refetchAuditLogs,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.AUDIT_LOGS(tenantID),
      page,
      pageSize,
      appliedDateFrom,
      appliedDateTo,
    ],
    queryFn: () =>
      getAuditLogsAPI({
        tenantID,
        page,
        pageSize,
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
      }),
    refetchOnWindowFocus: false,
  });

  const auditLogsSchema =
    auditLogsData &&
    Array.isArray(auditLogsData.auditLogs) &&
    auditLogsData.auditLogs.length > 0
      ? jsonSchemaGenerator(auditLogsData.auditLogs[0])
      : null;

  const columns = useMemo(() => {
    if (auditLogsSchema && auditLogsSchema.properties) {
      return getFormattedAuditLogColumns({
        auditLogsSchema,
        onMetadataClick: (value) => setSelectedMetadata(value),
      });
    }
    return null;
  }, [auditLogsSchema]);

  const _getRowID = (row) => row.auditLogID;

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingAuditLogs}
      error={loadAuditLogsError}
      isFetching={isFetchingAuditLogs}
      isPreviousData={isPreviousAuditLogsData}
      refetch={refetchAuditLogs}
    >
      <div className={`w-full h-full !overflow-y-hidden flex flex-col justify-start items-stretch`}>
        {auditLogsData ? (
          <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">

            {/* ── Header bar ─────────────────────────────────────────── */}
            <PageHeader title={CONSTANTS.STRINGS.VIEW_AUDIT_LOGS_TITLE}>
              {/* Date range filters */}
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Date range:
              </span>

              <Input
                id="audit-logs-date-from"
                type="date"
                size="sm"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  applyFilters({ newDateFrom: e.target.value });
                }}
                aria-label="Filter from date"
                className="w-auto"
              />

              <span className="text-xs text-muted-foreground">to</span>

              <Input
                id="audit-logs-date-to"
                type="date"
                size="sm"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  applyFilters({ newDateTo: e.target.value });
                }}
                aria-label="Filter to date"
                className="w-auto"
              />

              {hasActiveFilters && (
                <>
                  <span className="text-xs text-muted-foreground italic">
                    {appliedDateFrom && appliedDateTo
                      ? `${moment(appliedDateFrom).format("MMM D, YYYY")} – ${moment(appliedDateTo).format("MMM D, YYYY")}`
                      : appliedDateFrom
                        ? `From ${moment(appliedDateFrom).format("MMM D, YYYY")}`
                        : `Until ${moment(appliedDateTo).format("MMM D, YYYY")}`}
                  </span>
                  <Button
                    id="audit-logs-clear-filters-btn"
                    variant="secondary"
                    size="sm"
                    onClick={clearFilters}
                    title="Clear date filters"
                  >
                    <X size={11} />
                    Clear
                  </Button>
                </>
              )}

              {/* Export button */}
              <Button
                id="audit-logs-export-csv-btn"
                variant="primary-outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                title="Export all matching logs as CSV (server-side)"
              >
                {isExporting ? (
                  <>
                    <Spinner size={13} />
                    Exporting…
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    Export CSV
                  </>
                )}
              </Button>
            </PageHeader>

            {/* ── Data grid ──────────────────────────────────────────── */}
            <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
              <DataGrid
                ref={datagridRef}
                apiRef={datagridAPIRef}
                rows={auditLogsData.auditLogs}
                columns={columns}
                density="compact"
                loading={isLoadingAuditLogs || isFetchingAuditLogs}
                getRowId={(row) => _getRowID(row)}
                sx={{
                  ...DATAGRID_SX,
                  "& .MuiDataGrid-cell": {
                    ...DATAGRID_SX["& .MuiDataGrid-cell"],
                    fontSize: "0.875rem",
                  },
                }}
                showCellVerticalBorder
                className="!border-0"
                disableRowSelectionOnClick
                disableColumnFilter
                paginationMode="server"
                rowCount={
                  !isNaN(auditLogsData?.auditLogsCount)
                    ? parseInt(auditLogsData.auditLogsCount)
                    : 0
                }
                pageSizeOptions={[20, 50, 100]}
                paginationModel={{ page: page - 1, pageSize }}
                onPaginationModelChange={({
                  page: newPage,
                  pageSize: newPageSize,
                }) => {
                  setPage(newPage + 1);
                  setPageSize(newPageSize);
                }}
                hideFooterSelectedRowCount
              />
            </div>
          </div>
        ) : (
          <div className="!w-full !p-2">
            <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
          </div>
        )}
      </div>

      {/* Metadata dialog */}
      {selectedMetadata !== null && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedMetadata(null);
          }}
        >
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                Human-readable breakdown of this audit log entry.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="overflow-auto max-h-[70vh] px-1 py-2">
                <AuditLogMetadataViewer metadata={selectedMetadata} />
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};
