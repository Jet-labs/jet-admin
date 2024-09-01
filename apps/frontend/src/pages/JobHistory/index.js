import { useNavigate } from "react-router-dom";

import { Chip, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthState } from "../../contexts/authContext";

import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { getJobHistoryAPI } from "../../api/jobs";
import { ErrorComponent } from "../../components/ErrorComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { getFieldFormatting } from "../../utils/tables";
import { Loading } from "../Loading";
const JobHistory = () => {
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
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.JOB_HISTORY, page],
    queryFn: () =>
      getJobHistoryAPI({
        page,
        pageSize: 20,
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
      field: "pm_history_result",
      headerName: "Result/Error",
      minWidth: 300,
      valueGetter: (value, row) => {
        console.log({ value, row });
        return JSON.parse(value.row.pm_history_result);
      },
      renderCell: (params) => {
        return getFieldFormatting({
          type: LOCAL_CONSTANTS.DATA_TYPES.JSON,
          isID: false,
          isList: false,
          params,
        });
      },
    },
  ];

  // console.log({})

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full !overflow-y-auto !overflow-x-auto">
      {isLoadingJobHistory ? (
        <Loading />
      ) : data?.jobHistory && pmUser ? (
        <div className="px-4 pt-4 pb-2">
          <DataGrid
            rows={data.jobHistory}
            loading={isLoadingJobHistory || isFetchingAllJobHistory}
            columns={columns}
            initialState={{}}
            editMode="row"
            hideFooterPagination={true}
            hideFooterSelectedRowCount={true}
            checkboxSelection={false}
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
