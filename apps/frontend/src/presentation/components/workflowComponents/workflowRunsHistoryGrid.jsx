import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { getWorkflowRunHistoryAPI } from "../../../data/apis/workflow";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

import { DATAGRID_SX } from "../../../shared/dataGridTheme";

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(value);
  return isValid(d) ? d : null;
}

function formatDateTime(value) {
  const d = safeDate(value);
  return d ? format(d, "MMM d, yyyy · HH:mm:ss") : "—";
}

function formatDuration(startedAt, completedAt) {
  const start = safeDate(startedAt);
  const end = safeDate(completedAt);
  if (!start || !end) return "—";
  const ms = Math.max(0, end.getTime() - start.getTime());
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, className: "text-green-600 dark:text-green-400", bg: "bg-green-950/40 border-green-200 dark:border-green-800" },
  failed: { icon: AlertCircle, className: "text-red-600 dark:text-red-400", bg: "bg-red-950/40 border-red-200 dark:border-red-800" },
  running: { icon: Clock, className: "text-blue-600 dark:text-blue-400", bg: "bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  pending: { icon: Clock, className: "text-amber-600 dark:text-amber-400", bg: "bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  cancelled: { icon: XCircle, className: "text-muted-foreground/70", bg: "bg-background border-border" },
};

export function WorkflowRunStatusBadge({ value }) {
  const key = (value ?? "").toLowerCase();
  const config = STATUS_CONFIG[key] ?? {
    icon: Clock,
    className: "text-muted-foreground",
    bg: "bg-muted border-border",
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${config.bg} ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      {value ?? "—"}
    </span>
  );
}

WorkflowRunStatusBadge.propTypes = {
  value: PropTypes.string,
};

// ─── Column definitions ──────────────────────────────────────────────────────

const getWorkflowRunColumns = () => [
  {
    field: "instanceID",
    headerName: "Run ID",
    width: 150,
    editable: false,
    sortable: false,
    headerAlign: "left",
    align: "left",
    renderCell: ({ value }) => (
      <div className="flex h-full items-center font-mono text-xs tabular-nums text-foreground">
        {String(value ?? "").substring(0, 8)}
      </div>
    ),
  },
  {
    field: "workflowTitle",
    headerName: "Workflow",
    flex: 1,
    minWidth: 180,
    editable: false,
    sortable: false,
    headerAlign: "left",
    align: "left",
    renderCell: ({ row }) => (
      <div className="flex h-full items-center">
        {row.workflowTitle ? (
          <span className="truncate text-xs font-medium text-foreground">
            {row.workflowTitle}
          </span>
        ) : (
          <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Unsaved test run
          </span>
        )}
      </div>
    ),
  },
  {
    field: "isTest",
    headerName: "Type",
    width: 110,
    editable: false,
    sortable: false,
    headerAlign: "left",
    align: "left",
    renderCell: ({ value }) => (
      <div className="flex h-full items-center">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
            value
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-foreground"
          }`}
        >
          {value ? "Test" : "Live"}
        </span>
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    editable: false,
    sortable: false,
    headerAlign: "left",
    align: "left",
    renderCell: ({ value }) => (
      <div className="flex h-full items-center">
        <WorkflowRunStatusBadge value={value} />
      </div>
    ),
  },
  {
    field: "startedAt",
    headerName: "Started At",
    width: 220,
    editable: false,
    sortable: false,
    type: "dateTime",
    headerAlign: "left",
    align: "left",
    valueGetter: (value) => safeDate(value),
    renderCell: ({ value }) => (
      <div className="flex h-full items-center">
        <span className="font-mono text-xs text-foreground tabular-nums">
          {formatDateTime(value)}
        </span>
      </div>
    ),
  },
  {
    field: "duration",
    headerName: "Duration",
    width: 120,
    editable: false,
    sortable: false,
    headerAlign: "left",
    align: "left",
    valueGetter: (value, row) => formatDuration(row.startedAt, row.completedAt),
    renderCell: ({ value }) => (
      <div className="flex h-full items-center">
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {value}
        </span>
      </div>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const WorkflowRunsHistoryGrid = ({ tenantID, workflowID }) => {
  WorkflowRunsHistoryGrid.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    workflowID: PropTypes.string,
  };

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("live");

  const {
    isLoading: isLoadingRuns,
    data: runsData,
    error: loadRunsError,
    isFetching: isFetchingRuns,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.WORKFLOW_RUNS(tenantID),
      workflowID ?? "all",
      statusFilter,
      typeFilter,
      page,
      pageSize,
    ],
    queryFn: () =>
      getWorkflowRunHistoryAPI({
        tenantID,
        ...(workflowID ? { workflowID } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(typeFilter === "live" ? { isTest: false } : typeFilter === "test" ? { isTest: true } : {}),
        page,
        pageSize,
      }),
    refetchOnWindowFocus: false,
  });

  const rows = runsData?.instances ?? [];
  const total = parseInt(runsData?.totalCount ?? 0, 10) || 0;
  const hasData = rows.length > 0;

  const columns = useMemo(() => getWorkflowRunColumns(), []);

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingRuns}
      error={loadRunsError}
      loadingContainerClass="flex-1"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <PageHeader
          title={
            workflowID
              ? CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_HISTORY_BY_ID.title
              : CONSTANTS.STRINGS.VIEW_WORKFLOW_RUNS_TITLE
          }
          parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE}
          id={workflowID}
        >
          {!isLoadingRuns && total > 0 && (
            <span className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {total.toLocaleString()} run{total !== 1 ? "s" : ""}
            </span>
          )}
        </PageHeader>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex w-full flex-row justify-between items-center gap-2 border-b border-border px-2 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Status
            </span>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[160px] text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Type
            </span>
            <Select
              value={typeFilter}
              onValueChange={(val) => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[130px] text-xs">
                <SelectValue placeholder="Run type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="all">All types</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex h-full w-full flex-col overflow-hidden p-2">
          {!runsData ? (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-border bg-muted/20 p-6">
              <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
            </div>
          ) : hasData ? (
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isLoadingRuns || isFetchingRuns}
              getRowId={(row) => row.instanceID}

              showCellVerticalBorder
              className="bg-background"
              disableColumnFilter
              paginationMode="server"
              rowCount={total}
              pageSizeOptions={[20, 50, 100]}
              paginationModel={{ page: page - 1, pageSize }}
              onPaginationModelChange={({ page: p, pageSize: ps }) => {
                setPage(p + 1);
                setPageSize(ps);
              }}
              hideFooterSelectedRowCount
              getRowHeight={() => "auto"}
              onRowClick={(params) =>
                navigate(
                  CONSTANTS.ROUTES.VIEW_WORKFLOW_RUN_DETAILS_BY_ID.path(
                    tenantID,
                    params.id
                  )
                )
              }
              sx={{
                ...DATAGRID_SX,
                "& .MuiDataGrid-row": {
                  ...DATAGRID_SX["& .MuiDataGrid-row"],
                  cursor: "pointer",
                },
                "& .MuiDataGrid-cell": {
                  ...DATAGRID_SX["& .MuiDataGrid-cell"],
                  padding: "8px 10px",
                  maxHeight: "none !important",
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-border bg-muted/20 p-6">
              <NoEntityUI message={CONSTANTS.STRINGS.WORKFLOW_RUNS_NO_RUNS} />
            </div>
          )}
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
