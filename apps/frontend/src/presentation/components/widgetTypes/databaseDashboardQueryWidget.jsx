import React, { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import jsonSchemaGenerator from "to-json-schema";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseQueryByIDAPI,
  testDatabaseQueryByIDAPI,
} from "../../../data/apis/databaseQuery";
import { capitalize } from "@mui/material";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const DatabaseDashboardQueryWidget = ({
  tenantID,
  databaseQueryID,
  width,
  height,
}) => {
  DatabaseDashboardQueryWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseQueryID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const {
    isLoading: isLoadingDatabaseQuery,
    data: databaseQuery,
    error: loadDatabaseQueryError,
    isFetching: isFetchingDatabaseQuery,
    refetch: refetchDatabaseQuery,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      databaseQueryID,
    ],
    queryFn: () =>
      getDatabaseQueryByIDAPI({
        tenantID,
        databaseQueryID,
      }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseQueryData,
    data: databaseQueryResult,
    error: loadDatabaseQueryDataError,
    isFetching: isFetchingDatabaseQueryData,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      databaseQueryID,
      "data",
    ],
    queryFn: () =>
      testDatabaseQueryByIDAPI({
        tenantID,
        databaseQueryID,
      }),
    refetchOnWindowFocus: false,
  });

  const data = databaseQueryResult?.result;
  const dataSchema = data
    ? jsonSchemaGenerator(Array.isArray(data) ? data[0] : data)
    : {};
  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return {
          key,
          name: key,
          field: key,
          headerName: capitalize(key),
          flex: 1,
          minWidth: 150,
          renderCell: (params) => {
            return (
              <div className="text-sm whitespace-pre-wrap py-2">
                {params.value?.toString() || "-"}
              </div>
            );
          },
        };
      });
    }
  }, [dataSchema]);

  const CustomFooter = () => {
    const rowCount = data?.length || 0;
    const totalPages = Math.ceil(rowCount / paginationModel.pageSize);

    return (
      <div className="cancelSelectorName flex items-center gap-2 p-2 border-t border-gray-200">
        <button
          className="p-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          disabled={paginationModel.page === 0}
        >
          <BiChevronLeft className="text-lg" />
        </button>
        <span className="text-xs text-gray-600">
          Page {paginationModel.page + 1} of {totalPages}
        </span>
        <button
          className="p-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          disabled={paginationModel.page >= totalPages - 1}
        >
          <BiChevronRight className="text-lg" />
        </button>
        <select
          className="p-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          value={paginationModel.pageSize}
          onChange={(e) =>
            setPaginationModel({
              page: 0,
              pageSize: Number(e.target.value),
            })
          }
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-600">{rowCount} total rows</span>
      </div>
    );
  };
  // ... rest of the loading/error states remain the same

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingDatabaseQuery || isLoadingDatabaseQueryData}
      error={loadDatabaseQueryError || loadDatabaseQueryDataError}
      isFetching={isFetchingDatabaseQuery || isFetchingDatabaseQueryData}
      refetch={refetchDatabaseQuery}
    >
      <div className="rounded bg-white" style={{ width, height }}>
        <div className="px-3 py-2 min-h-[48px] flex items-center border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 truncate line-clamp-2">
            {databaseQuery?.databaseQueryTitle || "Untitled Query"}
          </h2>
        </div>

        <div className="h-[calc(100%-48px)] relative overflow-hidden">
          {data?.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md">
                No data available for this query
              </div>
            </div>
          ) : (
            data && (
              <DataGrid
                rows={data.map((item, index) => ({
                  _g_uuid: `_index_${index}`,
                  ...item,
                }))}
                getRowId={(row) => row._g_uuid}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50]}
                hideFooterPagination
                slots={{
                  noRowsOverlay: () => (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md">
                        No results found
                      </div>
                    </div>
                  ),
                  footer: CustomFooter,
                }}
                defaultColumnOptions={{
                  sortable: true,
                  resizable: true,
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    py: 1,
                    fontSize: "0.875rem",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "transparent",
                    borderBottom: "1px solid #e5e7eb",
                  },
                }}
              />
            )
          )}
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
