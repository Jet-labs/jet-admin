import { useNavigate } from "react-router-dom";

import { Chip, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllRowsAPI } from "../../api/tables";
import { useAuthState } from "../../contexts/authContext";

import { LOCAL_CONSTANTS } from "../../constants";
import { Loading } from "../Loading";
import { parse, stringify, toJSON, fromJSON } from "flatted";
import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { DataGridActionComponent } from "../../components/DataGridComponents/DataGridActionComponent";
import { ErrorComponent } from "../../components/ErrorComponent";
import { RawDataGridStatistics } from "../../components/DataGridComponents/RawDataGridStatistics";
import { CodeEditor } from "../../components/CodeEditorComponent";
const JobHistory = () => {
  const tableName = LOCAL_CONSTANTS.STRINGS.JOB_HISTORY_TABLE_NAME;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);
  const {
    isLoading: isLoadingJobHistory,
    data: data,
    isError: isLoadJobHistoryError,
    error: loadJobHistoryError,
    isFetching: isFetchingAllJobHistory,
    isPreviousData: isPreviousJobHistoryData,
    refetch: reloadJobHistory,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
      page,
      filterQuery,
      sortModel,
    ],
    queryFn: () =>
      fetchAllRowsAPI({
        tableName,
        page,
        filterQuery: filterQuery,
        sortModel: sortModel,
      }),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
    keepPreviousData: true,
  });

  const getRowId = (row) => {
    return row.pm_job_history_id;
  };

  const columns = [
    { field: "pm_job_history_id", headerName: "ID" },
    { field: "pm_job_id", headerName: "Job ID", width: 200 },

    {
      field: "created_at",
      headerName: "Created at",
      width: 300,
      valueGetter: (value, row) => {
        return moment(value.value).format("dddd, MMMM Do YYYY, h:mm:ss a");
      },
      renderCell: (params) => {
        return (
          <Chip
            label={`${params.value}`}
            size="small"
            variant="outlined"
            color={"secondary"}
            icon={<BiCalendar className="!text-sm" />}
            sx={{
              borderRadius: 1,
            }}
          />
        );
      },
    },
    {
      field: "history_result",
      headerName: "Result/Error",
      minWidth: 300,
      valueGetter: (value, row) => {
        return JSON.stringify(value.row.history_result, null, 2);
      },
      renderCell: (params) => (
        <CodeEditor
          outlined={false}
          readOnly={true}
          code={`${params.value}`}
          language="json"
          height="100px"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full !overflow-y-auto !overflow-x-auto">
      <div className={`!w-full !p-4`}>
        <RawDataGridStatistics
          tableName={tableName}
          altTableName={"Jobs history"}
          filterQuery={filterQuery}
        />
        <DataGridActionComponent
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          reloadData={reloadJobHistory}
          tableName={tableName}
          setSortModel={setSortModel}
          sortModel={sortModel}
          allowAdd={false}
        />
      </div>
      {isLoadingJobHistory ? (
        <Loading />
      ) : data?.rows && pmUser ? (
        <div className="px-4">
          <DataGrid
            rows={data.rows}
            loading={isLoadingJobHistory || isFetchingAllJobHistory}
            columns={columns}
            initialState={{}}
            editMode="row"
            hideFooterPagination={true}
            hideFooterSelectedRowCount={true}
            checkboxSelection
            disableRowSelectionOnClick
            getRowId={getRowId}
            hideFooter={true}
            disableColumnFilter
            sortingMode="server"
            autoHeight={true}
            rowHeight={200}
            getRowHeight={() => "auto"}
          />
          <div className="flex flex-row w-full justify-end pb-2">
            <Pagination
              count={Boolean(data?.nextPage) ? page + 1 : page}
              page={page}
              onChange={(e, page) => {
                setPage(page);
              }}
              hideNextButton={!Boolean(data?.nextPage)}
              variant="text"
              shape="rounded"
              className="!mt-2"
              siblingCount={1}
            />
          </div>
        </div>
      ) : (
        <div className="!w-full !p-4">
          <ErrorComponent
            error={
              loadJobHistoryError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR
            }
          />
        </div>
      )}
    </div>
  );
};

export default JobHistory;
