import { useNavigate } from "react-router-dom";

import { Chip, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllRowsAPI } from "../../api/tables";
import { useAuthState } from "../../contexts/authContext";

import { LOCAL_CONSTANTS } from "../../constants";
import { useConstants } from "../../contexts/constantsContext";
import { Loading } from "../Loading";

import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { DataGridActionComponent } from "../../components/DataGridActionComponent";
import { ErrorComponent } from "../../components/ErrorComponent";
import { RawDatagridStatistics } from "../../components/RawDataGridStatistics";
const AccountManagement = () => {
  const tableName = LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME;
  
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);
  const {
    isLoading: isLoadingAllAccounts,
    data: data,
    isError: isLoadAllAccountsError,
    error: loadAllAccountsError,
    isFetching: isFetchingAllAllAccounts,
    isPreviousData: isPreviousAllAccountsData,
    refetch: reloadAllAccounts,
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
    staleTime: Infinity,
    keepPreviousData: true,
  });

  const getRowId = (row) => {
    return row.pm_user_id;
  };

  const columns = [
    { field: "pm_user_id", headerName: "User ID" },
    { field: "username", headerName: "Username", width: 200 },
    {
      field: "tbl_pm_policy_objects",
      headerName: "Role",
      width: 200,
      valueGetter: (value, row) => {
        return value.value.title;
      },
      renderCell: (params) => (
        <Chip
          label={`${params.value}`}
          size="small"
          variant="outlined"
          color={"info"}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created at",
      width: 300,
      valueGetter: (value, row) => {
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss a");
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
      field: "updated_at",
      headerName: "Updated at",
      width: 300,
      valueGetter: (value, row) => {
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss a");
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
  ];
  return (
    <div>
      <div className={`!w-full !p-4`}>
        <RawDatagridStatistics
          tableName={tableName}
          altTableName={"Account management"}
          filterQuery={filterQuery}
        />
        <DataGridActionComponent
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          reloadData={reloadAllAccounts}
          tableName={tableName}
          setSortModel={setSortModel}
          sortModel={sortModel}
        />
      </div>
      {isLoadingAllAccounts ? (
        <Loading />
      ) : data?.rows && pmUser ? (
        <div className="px-4">
          <DataGrid
            rows={data.rows}
            loading={isLoadingAllAccounts || isFetchingAllAllAccounts}
            columns={columns}
            initialState={{}}
            editMode="row"
            hideFooterPagination={true}
            hideFooterSelectedRowCount={true}
            checkboxSelection
            disableRowSelectionOnClick
            getRowId={getRowId}
            hideFooter={true}
            onRowClick={(param) => {
              navigate(
                LOCAL_CONSTANTS.ROUTES.ACCOUNT_SETTINGS.path(
                  JSON.stringify({
                    pm_user_id: param.row.pm_user_id,
                  })
                )
              );
            }}
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
              loadAllAccountsError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR
            }
          />
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
