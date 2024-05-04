import { useNavigate } from "react-router-dom";

import { Pagination } from "@mui/material";
import {
  DataGrid,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchAllRowsAPI } from "../../api/get";
import { useAuthState } from "../../contexts/authContext";

import { LOCAL_CONSTANTS } from "../../constants";
import { useConstants } from "../../contexts/constantsContext";
import { Loading } from "../../pages/Loading";
import { getAllTableFields, getTableIDProperty } from "../../utils/tables";
import { DataGridActionComponent } from "../DataGridActionComponent";
import { ErrorComponent } from "../ErrorComponent";
import { RawDatagridStatistics } from "../RawDataGridStatistics";
import "react-data-grid/lib/styles.css";

// import DataGrid from "react-data-grid";

export const RawDatagrid = ({
  tableName,
  onRowClick,
  showStats,
  containerClass,
}) => {
  const { dbModel } = useConstants();
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState(null);
  const [sortModel, setSortModel] = useState(null);

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
      `REACT_QUERY_KEY_${String(tableName).toUpperCase()}`,
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

  const authorizedColumns = useMemo(() => {
    if (pmUser && dbModel && tableName && data) {
      const u = pmUser;
      const c = u.extractAuthorizedColumnsForReadFromPolicyObject(tableName);
      if (c === true) {
        return getAllTableFields(dbModel, tableName);
      } else if (c === false) {
        return null;
      } else {
        const a = getAllTableFields(dbModel, tableName);

        return a.filter((header) => {
          return c.includes(header.field);
        });
      }
    } else {
      return null;
    }
  }, [pmUser, tableName, dbModel, data]);

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
    console.log(_query, _queryName);
    return primaryColumns.length > 1 ? { [_queryName]: _query } : _query;
  };

  return (
    <div>
      <div className={`!w-full !p-4 ${containerClass}`}>
        {showStats && (
          <RawDatagridStatistics
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
        />
      </div>
      {isLoadingRows ? (
        <Loading />
      ) : data?.rows && pmUser && authorizedColumns && primaryColumns ? (
        <div className="px-4">
          <DataGrid
            rows={data.rows}
            loading={isLoadingRows || isFetchingAllRows}
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
                      JSON.stringify(selectByIDQueryBuilder(param.row))
                    )
                  );
            }}
            disableColumnFilter
            sortingMode="server"
            autoHeight={true}
            rowHeight={150}
            getRowHeight={() => "auto"}
            slots={{
              toolbar: () => (
                <GridToolbarContainer>
                  <GridToolbarDensitySelector />
                  <GridToolbarColumnsButton />
                </GridToolbarContainer>
              ),
            }}
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
            error={loadRowsError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR}
          />
        </div>
      )}
    </div>
  );
};
