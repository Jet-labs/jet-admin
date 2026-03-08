import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useMemo, useRef, useState } from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { CONSTANTS } from "../../../constants";
import { getCronJobHistoryAPI } from "../../../data/apis/cronJob";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { getFormattedCronJobHistoryColumns } from "./cronJobHistoryGridColumnFormatter";

export const CronJobHistoryGrid = ({ tenantID, cronJobID }) => {
  CronJobHistoryGrid.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const datagridRef = useRef();
  const datagridAPIRef = useRef();

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
      getCronJobHistoryAPI({
        tenantID,
        cronJobID,
        page,
        pageSize,
      }),
    refetchOnWindowFocus: false,
  });

  const cronJobHistorySchema =
    cronJobHistory &&
    Array.isArray(cronJobHistory.cronJobHistory) &&
    cronJobHistory.cronJobHistory.length > 0
      ? jsonSchemaGenerator(cronJobHistory.cronJobHistory[0])
      : null;

  const columns = useMemo(() => {
    if (cronJobHistorySchema && cronJobHistorySchema.properties) {
      const formattedColumns = getFormattedCronJobHistoryColumns({
        cronJobHistorySchema,
      });
      return formattedColumns;
    } else {
      return null;
    }
  }, [cronJobHistorySchema]);

  const _getRowID = (row) => {
    return row.cronJobHistoryID;
  };

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingCronJobHistory}
      error={loadCronJobHistoryError}
      loadingContainerClass="flex-1"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        {cronJobHistory ? (
          <div className="flex h-full w-full flex-col overflow-hidden text-sm font-medium">
            <div className="border-b border-border px-3 py-3">
              <h1 className="text-lg font-semibold text-foreground">
                {CONSTANTS.STRINGS.VIEW_CRON_JOB_HISTORY_TITLE}
              </h1>

              {cronJobID && (
                <span className="mt-1 block text-xs text-muted-foreground">{`Job ID: ${cronJobID}`}</span>
              )}
            </div>
            <div className="flex h-full w-full flex-col overflow-hidden p-3">
              {columns?.length ? (
              <DataGrid
                ref={datagridRef}
                apiRef={datagridAPIRef}
                rows={cronJobHistory.cronJobHistory}
                columns={columns}
                  loading={isLoadingCronJobHistory || isFetchingCronJobHistory}
                getRowId={(row) => _getRowID(row)} // Custom row ID getter
                sx={{
                  border: 0,
                  "--unstable_DataGrid-radius": "0.5rem",
                  "& .MuiDataGrid-root": {
                    borderRadius: 0,
                  },
                  "& .MuiIconButton-root": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    fontWeight: "400",
                  },
                  "& .MuiCheckbox-root": {
                    padding: "4px",
                  },
                  "& .MuiDataGrid-columnHeaderCheckbox": {
                    minWidth: "auto !important",
                    width: "auto !important",
                    flex: "0 0 auto !important",
                    padding: "0.25rem !important",
                    "& .MuiDataGrid-columnHeaderTitleContainer": {
                      width: "auto",
                      minWidth: "auto",
                      flex: "none",
                    },
                  },
                  "& .MuiDataGrid-cellCheckbox": {
                    minWidth: "auto !important",
                    width: "auto !important",
                    flex: "0 0 auto !important",
                    color: "hsl(var(--primary))",
                    padding: "0.25rem !important",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "hsl(var(--muted) / 0.5)",
                  },
                }}
                showCellVerticalBorder
                  className="bg-background"
                disableRowSelectionOnClick
                disableColumnFilter
                // onSortModelChange={(model) => {
                //   if (model.length > 0) {
                //     const { field, sort } = model[0];
                //     setCronJobHistoryColumnSortModel({
                //       field: field,
                //       order: lowerCase(sort),
                //     });
                //   }
                // }}
                paginationMode="server"
                rowCount={
                  !isNaN(cronJobHistory?.cronJobHistoryCount)
                    ? parseInt(cronJobHistory.cronJobHistoryCount)
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
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6">
                  <NoEntityUI message="No scheduled job history is available yet." />
                </div>
              )}
            </div>
          </div>
        ) : (
            <div className="p-3">
            <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
          </div>
        )}
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
