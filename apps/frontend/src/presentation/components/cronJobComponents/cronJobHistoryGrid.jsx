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
    tenantID: PropTypes.number.isRequired,
    cronJobID: PropTypes.number.isRequired,
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
    isPreviousData: isPreviousCronJobHistoryData,
    refetch: refetchCronJobHistory,
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
      isFetching={isFetchingCronJobHistory}
      isPreviousData={isPreviousCronJobHistoryData}
      refetch={refetchCronJobHistory}
    >
      <div
        className={`w-full h-full !overflow-y-hidden flex flex-col justify-start items-stretch`}
      >
        {cronJobHistory ? (
          <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
            <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
                {CONSTANTS.STRINGS.VIEW_CRON_JOB_HISTORY_TITLE}
              </h1>

              {cronJobID && (
                <span className="text-xs text-[#646cff] mt-2">{`Job ID: ${cronJobID} `}</span>
              )}
            </div>
            <DataGrid
              ref={datagridRef}
              apiRef={datagridAPIRef}
              rows={cronJobHistory.cronJobHistory}
              onRowDoubleClick={(param) => {
                console.log({ param });
              }}
              autoHeight={true}
              getRowHeight={() => "auto"}
              columns={columns}
              loading={isLoadingCronJobHistory}
              getRowId={(row) => _getRowID(row)} // Custom row ID getter
              sx={{
                "--unstable_DataGrid-radius": "0",
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
                  color: "#646cff !important",
                  padding: "0.25rem !important",
                },
              }}
              showCellVerticalBorder
              className="!border-0"
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
                setPage(newPage + 1); // Convert to 1-based for API
                setPageSize(newPageSize);
              }}
              hideFooterSelectedRowCount
            />
          </div>
        ) : (
          <div className="!w-full !p-2">
            <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
          </div>
        )}
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
