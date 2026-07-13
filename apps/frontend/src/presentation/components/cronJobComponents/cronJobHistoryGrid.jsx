import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { getCronJobHistoryAPI } from "../../../data/apis/cronJob";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { getFormattedCronJobHistoryColumns } from "./cronJobHistoryGridColumnFormatter";
import { PageHeader } from "@jet-admin/ui";

import { DATAGRID_SX } from "../../../shared/dataGridTheme";

// ─── Component ───────────────────────────────────────────────────────────────

export const CronJobHistoryGrid = ({ tenantID, cronJobID }) => {
  CronJobHistoryGrid.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const {
    isLoading: isLoadingCronJobHistory,
    data: cronJobHistory,
    error: loadCronJobHistoryError,
    isFetching: isFetchingCronJobHistory,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      cronJobID,
      "history",
      page,
      pageSize,
    ],
    queryFn: () =>
      getCronJobHistoryAPI({ tenantID, cronJobID, page, pageSize }),
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(() => getFormattedCronJobHistoryColumns(), []);

  const rows = cronJobHistory?.cronJobHistory ?? [];
  const total = parseInt(cronJobHistory?.cronJobHistoryCount ?? 0, 10) || 0;
  const hasData = rows.length > 0;

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingCronJobHistory}
      error={loadCronJobHistoryError}
      loadingContainerClass="flex-1"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <PageHeader
          title={CONSTANTS.STRINGS.VIEW_CRON_JOB_HISTORY_TITLE}
          id={cronJobID ? String(cronJobID) : undefined}
        >
          {!isLoadingCronJobHistory && !isNaN(total) && total > 0 && (
            <span className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {total.toLocaleString()} run{total !== 1 ? "s" : ""}
            </span>
          )}
        </PageHeader>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex h-full w-full flex-col overflow-hidden p-3">
          {!cronJobHistory ? (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-border bg-muted/20 p-6">
              <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
            </div>
          ) : hasData ? (
            <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoadingCronJobHistory || isFetchingCronJobHistory}
                getRowId={(row) => row.cronJobHistoryID}

                showCellVerticalBorder
                className="bg-background"
                disableRowSelectionOnClick
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
                sx={{
                  ...DATAGRID_SX,
                  "& .MuiDataGrid-cell": {
                    ...DATAGRID_SX["& .MuiDataGrid-cell"],
                    padding: "8px 10px",
                    maxHeight: "none !important",
                  },
                }}
              />
            ) : (
                <div className="flex h-full items-center justify-center rounded border border-dashed border-border bg-muted/20 p-6">
              <NoEntityUI message="No execution history yet. This job hasn't run." />
            </div>
          )}
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};