import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useMemo, useRef, useState } from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { CONSTANTS } from "../../../constants";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { getFormattedAuditLogColumns } from "./auditLogsGridColumnFormatter";
import { getAuditLogsAPI } from "../../../data/apis/auditLog";
import { DATAGRID_SX } from "../../../shared/dataGridTheme";

export const AuditLogsGrid = ({ tenantID,  }) => {
  AuditLogsGrid.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const datagridRef = useRef();
  const datagridAPIRef = useRef();

  const {
    isLoading: isLoadingAuditLogs,
    data: auditLogsData,
    error: loadAuditLogsError,
    isFetching: isFetchingAuditLogs,
    isPreviousData: isPreviousAuditLogsData,
    refetch: refetchAuditLogs,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.AUDIT_LOGS(tenantID), page, pageSize],
    queryFn: () =>
      getAuditLogsAPI({
        tenantID,
        page,
        pageSize,
      }),
    refetchOnWindowFocus: false,
  });

  const auditLogsSchema =
    auditLogsData &&
    Array.isArray(auditLogsData.auditLogs) &&
    auditLogsData.auditLogs.length > 0
      ? jsonSchemaGenerator(auditLogsData.auditLogs[0])
      : null;

  const columns = useMemo(() => {
    if (auditLogsSchema && auditLogsSchema.properties) {
      const formattedColumns = getFormattedAuditLogColumns({
        auditLogsSchema,
      });
      return formattedColumns;
    } else {
      return null;
    }
  }, [auditLogsSchema]);

  const _getRowID = (row) => {
    return row.auditLogID;
  };

  console.log(auditLogsData);

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingAuditLogs}
      error={loadAuditLogsError}
      isFetching={isFetchingAuditLogs}
      isPreviousData={isPreviousAuditLogsData}
      refetch={refetchAuditLogs}
    >
      <div
        className={`w-full h-full !overflow-y-hidden flex flex-col justify-start items-stretch`}
      >
        {auditLogsData ? (
          <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
            <div className="w-full px-3 py-2 border-b border-border flex flex-col justify-center items-start">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                {CONSTANTS.STRINGS.VIEW_AUDIT_LOGS_TITLE}
              </h1>
            </div>
            <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
              <DataGrid
                ref={datagridRef}
                apiRef={datagridAPIRef}
                rows={auditLogsData.auditLogs}
                columns={columns}
                density="compact"
                loading={isLoadingAuditLogs}
                getRowId={(row) => _getRowID(row)} // Custom row ID getter
                sx={{
                  ...DATAGRID_SX,
                  "& .MuiDataGrid-cell": {
                    ...DATAGRID_SX["& .MuiDataGrid-cell"],
                    fontSize: "0.875rem",
                  },
                }}
                showCellVerticalBorder
                className="!border-0"
                disableRowSelectionOnClick
                disableColumnFilter
                // onSortModelChange={(model) => {
                //   if (model.length > 0) {
                //     const { field, sort } = model[0];
                //     setAuditLogsColumnSortModel({
                //       field: field,
                //       order: lowerCase(sort),
                //     });
                //   }
                // }}
                paginationMode="server"
                rowCount={
                  !isNaN(auditLogsData?.auditLogsCount)
                    ? parseInt(auditLogsData.auditLogsCount)
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
          </div>
        ) : (
          <div className="!w-full !p-2">
            <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
          </div>
        )}
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
