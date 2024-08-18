import { useNavigate } from "react-router-dom";

import { Button, Chip, Grid, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAllRowsAPI } from "../../api/tables";
import { useAuthState } from "../../contexts/authContext";

import { LOCAL_CONSTANTS } from "../../constants";
import { Loading } from "../Loading";

import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { DataGridActionComponent } from "../../components/DataGridComponents/DataGridActionComponent";
import { ErrorComponent } from "../../components/ErrorComponent";
import { RawDataGridStatistics } from "../../components/DataGridComponents/RawDataGridStatistics";
import { getAllAccountsAPI } from "../../api/accounts";
import { FaPlus, FaRedoAlt } from "react-icons/fa";
const AllAccounts = () => {
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);

  const accountAddAuthorization = useMemo(() => {
    return pmUser && pmUser.extractAccountAddAuthorization();
  }, [pmUser]);

  const {
    isLoading: isLoadingAllAccounts,
    data: data,
    isError: isLoadAllAccountsError,
    error: loadAllAccountsError,
    isFetching: isFetchingAllAllAccounts,
    isPreviousData: isPreviousAllAccountsData,
    refetch: reloadAllAccounts,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_ACCOUNTS`],
    queryFn: () => getAllAccountsAPI(),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
    keepPreviousData: true,
  });

  const getRowId = (row) => {
    return row.pm_user_id;
  };

  const columns = [
    { field: "pm_user_id", headerName: "User ID" },
    { field: "username", headerName: "Username", width: 200 },
    { field: "first_name", headerName: "First name", width: 200 },
    { field: "last_name", headerName: "Last name", width: 200 },
    {
      field: "tbl_pm_policy_objects",
      headerName: "Role ID",
      width: 200,
      valueGetter: (value, row) => {
        return value?.row?.pm_policy_object_id;
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

  const _handleNavigateAccountAdditionForm = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_ACCOUNT.path());
  };
  return (
    <div>
      {isLoadingAllAccounts ? (
        <Loading />
      ) : data && pmUser ? (
        <div className="px-4">
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            className="!flex !flex-row !justify-end !items-center !w-full !py-3"
          >
            <Button
              onClick={reloadAllAccounts}
              startIcon={<FaRedoAlt className="!text-sm" />}
              size="medium"
              variant="outlined"
              className="!ml-2"
            >
              Reload
            </Button>
            {accountAddAuthorization && (
              <Button
                onClick={_handleNavigateAccountAdditionForm}
                startIcon={<FaPlus className="!text-sm" />}
                size="medium"
                variant="contained"
                className="!ml-2"
              >
                Add
              </Button>
            )}
          </Grid>
          <DataGrid
            rows={data}
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
                  param.row.pm_user_id
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

export default AllAccounts;
