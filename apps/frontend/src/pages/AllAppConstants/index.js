import { useNavigate } from "react-router-dom";

import { Chip, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAllRowsAPI, getAuthorizedColumnsForRead } from "../../api/tables";
import { useAuthState } from "../../contexts/authContext";

import { LOCAL_CONSTANTS } from "../../constants";
import { Loading } from "../Loading";

import moment from "moment";
import "react-data-grid/lib/styles.css";
import { BiCalendar } from "react-icons/bi";
import { DataGridActionComponent } from "../../components/DataGridComponents/DataGridActionComponent";
import { ErrorComponent } from "../../components/ErrorComponent";
import { RawDataGridStatistics } from "../../components/DataGridComponents/RawDataGridStatistics";
import {
  getFieldFormatting,
  getFormattedTableColumns,
} from "../../utils/tables";
import { useAppConstants } from "../../contexts/appConstantsContext";
const AllAppConstants = () => {
  const tableName = LOCAL_CONSTANTS.STRINGS.APP_CONSTANTS_TABLE_NAME;

  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);
  const { dbModel, internalAppConstants } = useAppConstants();
  const isAuthorizedToAddAppConstant = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddAppConstant();
  }, [pmUser]);

  const {
    isLoading: isLoadingAllAppConstants,
    data: data,
    isError: isLoadAllAppConstantsError,
    error: loadAllAppConstantsError,
    isFetching: isFetchingAllAllAppConstants,
    isPreviousData: isPreviousAllAppConstantsData,
    refetch: reloadAllAppConstants,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),

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
    return row.pm_app_constant_id;
  };

  const {
    isLoading: isLoadingReadColumns,
    data: readColumns,
    error: loadReadColumnsError,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),

      `read_column`,
    ],
    queryFn: () => getAuthorizedColumnsForRead({ tableName }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const authorizedColumns = useMemo(() => {
    console.log({ iiiinternalAppConstants: internalAppConstants });
    if (readColumns) {
      const c = getFormattedTableColumns(
        readColumns,
        internalAppConstants?.CUSTOM_INT_VIEW_MAPPING?.[tableName]
      );
      return c;
    } else {
      return null;
    }
  }, [readColumns, internalAppConstants]);

  const columns = [
    { field: "pm_app_constant_id", headerName: "ID" },
    { field: "pm_app_constant_title", headerName: "Name", width: 300 },

    {
      field: "pm_app_constant_value",
      headerName: "Value",
      width: 200,
      valueGetter: (value, row) => {
        console.log({ value, row });
        return value?.row?.pm_app_constant_value;
      },
      renderCell: (params) => {
        return getFieldFormatting({
          type: "code",
          isID: false,
          isList: false,
          params,
        });
      },
    },
    { field: "is_internal", headerName: "Internal usage", width: 200 },
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
        <RawDataGridStatistics
          tableName={tableName}
          altTableName={"App constant management"}
          filterQuery={filterQuery}
        />
        <DataGridActionComponent
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          reloadData={reloadAllAppConstants}
          tableName={tableName}
          setSortModel={setSortModel}
          sortModel={sortModel}
          addRowNavigation={LOCAL_CONSTANTS.ROUTES.ADD_APP_CONSTANT.path()}
          allowAdd={isAuthorizedToAddAppConstant}
        />
      </div>
      {isLoadingAllAppConstants ? (
        <Loading />
      ) : data?.rows && pmUser ? (
        <div className="px-4">
          <DataGrid
            rows={data.rows}
            loading={isLoadingAllAppConstants || isFetchingAllAllAppConstants}
            columns={authorizedColumns}
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
                LOCAL_CONSTANTS.ROUTES.APP_CONSTANT_VIEW.path(
                  JSON.stringify({
                    pm_app_constant_id: param.row.pm_app_constant_id,
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
              loadAllAppConstantsError ||
              LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR
            }
          />
        </div>
      )}
    </div>
  );
};

export default AllAppConstants;
