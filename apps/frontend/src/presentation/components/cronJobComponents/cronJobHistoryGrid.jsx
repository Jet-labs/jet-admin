import { CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useRef, useState } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";

import { lowerCase } from "lodash";
import { getCronJobHistoryAPI } from "../../../data/apis/cronJob";
import { NoEntityUI } from "../ui/noEntityUI";
import jsonSchemaGenerator from "to-json-schema";
import { getFormattedCronJobHistoryColumns } from "./cronJobHistoryGridColumnFormatter";
export const CronJobHistoryGrid = ({
  tenantID,
  cronJobID,
  initialFilterQuery,
}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  
  
  const [cronJobHistoryColumnSortModel, setCronJobHistoryColumnSortModel] =
    useState(null);
  const [multipleSelectedQuery, setMultipleSelectedQuery] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [isSelectAllRowCheckBoxEnabled, setIsSelectAllRowCheckBoxEnabled] =
    useState(false);
  const [isAllRowSelectChecked, setIsAllRowSelectChecked] = useState(false);
  const [
    isCronJobHistoryColumnFiltersMenuOpen,
    setIsCronJobHistoryColumnFilterMenuOpen,
  ] = useState(false);


  const [cronJobHistoryNewRows, setCronJobHistoryNewRows] = useState([]);
  const [_rowSelectionModel, _setRowSelectionModel] = useState();
  const [cronJobHistoryGridDensity, setCronJobHistoryGridDensity] =
    useState("compact");
  const [cronJobHistoryGridAutoheight, setCronJobHistoryGridAutoheight] =
    useState(false);
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

  console.log({ cronJobHistory });
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
        console.log({ formattedColumns });
        return formattedColumns
        
      } else {
        return null;
      }
    }, [cronJobHistorySchema]);


  const _getRowID = useCallback(
    (row) => {
      return row.cronJobHistoryID;
    },
    []
  );

  


  return isLoadingCronJobHistory ? (
    <div
      className={`w-full h-full !overflow-y-hidden flex justify-center items-center`}
    >
      <CircularProgress />
    </div>
  ) : (
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
  );
};
