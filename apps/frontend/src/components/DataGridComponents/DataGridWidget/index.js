import { useNavigate } from "react-router-dom";

import { LinearProgress, Pagination, useTheme } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAllRowsAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";

import "react-data-grid/lib/styles.css";
import { getAuthorizedColumnsForRead } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAppConstants } from "../../../contexts/appConstantsContext";
import { Loading } from "../../../pages/Loading";
import {
  getFormattedTableColumns,
  getTableIDProperty,
} from "../../../utils/tables";
import { DataGridActionComponent } from "../DataGridActionComponent";
import { ErrorComponent } from "../../ErrorComponent";
import { RawDataGridStatistics } from "../RawDataGridStatistics";

// import DataGrid from "react-data-grid";

export const DataGridWidget = ({
  tableName,
  onRowClick,
  showStats,
  containerClass,
}) => {
  const { dbModel } = useAppConstants();
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);
  const theme = useTheme();

  const {
    isLoading: isLoadingRows,
    data: data,
    isError: isLoadRowsError,
    error: loadRowsError,
    isFetching: isFetchingAllRows,
    isPreviousData: isPreviousRowsData,
    refetch: reloadData,
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
    if (readColumns) {
      const c = getFormattedTableColumns(readColumns);
      return c;
    } else {
      return null;
    }
  }, [readColumns]);

  const primaryColumns = useMemo(() => {
    if (dbModel) {
      return getTableIDProperty(tableName, dbModel);
    }
  }, [tableName, dbModel]);

  const getRowId = (row) => {
    if (primaryColumns.length > 1) {
      let id = ``;
      for (let i = 0; i < primaryColumns.length; i++) {
        id =
          i == primaryColumns.length - 1
            ? id.concat(`${String(row[primaryColumns[i]])}`)
            : id.concat(`${String(row[primaryColumns[i]])}__`);
      }

      return id;
    } else {
      return row[primaryColumns[0]];
    }
  };

  const selectByIDQueryBuilder = (row) => {
    let _query = {};
    let _queryName = primaryColumns.join("_");
    for (let i = 0; i < primaryColumns.length; i++) {
      _query[primaryColumns[i]] = row[primaryColumns[i]];
    }
    return primaryColumns.length > 1 ? { [_queryName]: _query } : _query;
  };

  return (
    <div
      className={`w-full h-full ${containerClass}   !overflow-y-auto !overflow-x-auto`}
    >
      <div
        xs={12}
        item
        className={`!w-full !p-4 !h-fit`}
        style={{ background: theme.palette.background.default }}
      >
        {showStats && (
          <RawDataGridStatistics
            tableName={tableName}
            filterQuery={filterQuery}
          />
        )}
        <DataGridActionComponent
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          reloadData={reloadData}
          tableName={tableName}
          setSortModel={setSortModel}
          sortModel={sortModel}
          compact={true}
        />

        {data?.rows && pmUser && authorizedColumns && primaryColumns && (
          <Pagination
            count={Boolean(data?.nextPage) ? page + 1 : page}
            page={page}
            onChange={(e, page) => {
              setPage(page);
            }}
            hideNextButton={!Boolean(data?.nextPage)}
            variant="text"
            shape="rounded"
            siblingCount={1}
          />
        )}
      </div>

      {isLoadingRows ? (
        <Loading />
      ) : data?.rows && pmUser && authorizedColumns && primaryColumns ? (
        <DataGrid
          rows={data.rows}
          loading={isLoadingRows || isFetchingAllRows}
          className="!border-0 data-grid-custom-class !flex !flex-grow"
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
            onRowClick
              ? onRowClick(param)
              : navigate(
                  LOCAL_CONSTANTS.ROUTES.ROW_VIEW.path(
                    tableName,
                    JSON.stringify(selectByIDQueryBuilder(param.row))
                  )
                );
          }}
          disableColumnFilter
          sortingMode="server"
          autoHeight={true}
          getRowHeight={() => "auto"}
          slots={{
            toolbar: () => (
              <GridToolbarContainer className="!px-2.5 justify-end">
                <GridToolbarExport />
              </GridToolbarContainer>
            ),
            loadingOverlay: LinearProgress,
          }}
        />
      ) : (
        <div className="!w-full !p-4">
          <ErrorComponent
            error={loadRowsError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR}
          />
        </div>
      )}
    </div>
  );
};
