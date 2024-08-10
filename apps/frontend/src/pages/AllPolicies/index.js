import { useNavigate } from "react-router-dom";
import { useAuthState } from "../../contexts/authContext";

import { Button, Chip, Grid, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAllRowsAPI } from "../../api/tables";

import { LOCAL_CONSTANTS } from "../../constants";
import { Loading } from "../Loading";

import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { DataGridActionComponent } from "../../components/DataGridComponents/DataGridActionComponent";
import { ErrorComponent } from "../../components/ErrorComponent";
import { RawDataGridStatistics } from "../../components/DataGridComponents/RawDataGridStatistics";
import { getAllPoliciesAPI } from "../../api/policy";
import { FaPlus, FaRedoAlt } from "react-icons/fa";

const AllPolicies = () => {
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);
  const {
    isLoading: isLoadingAllPolicies,
    data: data,
    isError: isLoadAllPoliciesError,
    error: loadAllPoliciesError,
    isFetching: isFetchingAllAllPolicies,
    isPreviousData: isPreviousAllPoliciesData,
    refetch: reloadAllPolicies,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_POLICIES`],
    queryFn: () => getAllPoliciesAPI(),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: Infinity,
    keepPreviousData: true,
  });

  const getRowId = (row) => {
    return row.pmPolicyObjectID;
  };

  const isAuthorizedToAddPolicy = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddPolicy();
  }, [pmUser]);

  const columns = [
    { field: "pmPolicyObjectID", headerName: "Policy ID" },
    { field: "pmPolicyObjectTitle", headerName: "Title", width: 200 },
    {
      field: "createdAt",
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
  ];
  const _handleNavigatePolicyAdditionForm = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_POLICY.path());
  };
  return (
    <div>
      {isLoadingAllPolicies ? (
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
              onClick={reloadAllPolicies}
              startIcon={<FaRedoAlt className="!text-sm" />}
              size="medium"
              variant="outlined"
              className="!ml-2"
            >
              Reload
            </Button>
            {isAuthorizedToAddPolicy && (
              <Button
                onClick={_handleNavigatePolicyAdditionForm}
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
            loading={isLoadingAllPolicies || isFetchingAllAllPolicies}
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
                LOCAL_CONSTANTS.ROUTES.POLICY_SETTINGS.path(
                  param.row.pmPolicyObjectID
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
              loadAllPoliciesError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR
            }
          />
        </div>
      )}
    </div>
  );
};

export default AllPolicies;
