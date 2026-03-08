import { DataGrid, gridClasses, useGridApiRef } from "@mui/x-data-grid";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useRoleManagementState } from "../../../logic/contexts/roleManagementContext";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Badge } from "@jet-admin/ui";

export const TenantRolesList = () => {
  const {
    tenantRoles,
    tenantRolesError,
    isLoadingTenantRoles,
    isFetchingTenantRoles,
  } = useRoleManagementState();
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const { tenantID } = useParams();

  const columns = [
    {
      field: "roleID",
      display: "flex",
      // width: 300,
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Role ID",
    },
    {
      field: "roleTitle",
      display: "flex",
      // width: 300,
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Role Name",
    },
    {
      field: "roleDescription",
      display: "flex",
      // width: 300,
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Role Description",
    },
    {
      field: "tenantID",
      display: "flex",
      // width: 300,
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Role type",
      renderCell: (params) => {
        return params.value ? (
          <Badge variant="warning">
            Custom role
          </Badge>
        ) : (
            <Badge
              variant="outline"
              className="border-primary/50 bg-primary/10 text-primary"
            >
            Global role
            </Badge>
        );
      },
    },
  ];

  const _getRowID = (row) => {
    return row.roleID;
  };

  const _handleRowClick = (tenantRoleID) => {
    navigate(
      CONSTANTS.ROUTES.UPDATE_TENANT_ROLE_BY_ID.path(tenantID, tenantRoleID)
    );
  };

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenantRoles}
      error={tenantRolesError}
    >
      {tenantRoles?.roles?.length ? (
        <div className="flex h-full w-full flex-grow flex-col items-stretch justify-between overflow-y-auto text-sm font-medium text-foreground">
          <DataGrid
            apiRef={apiRef}
            rows={tenantRoles.roles}
            columns={columns}
            density="compact"
            loading={isLoadingTenantRoles || isFetchingTenantRoles}
            getRowId={(row) => _getRowID(row)}
            sx={{
              [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: "none",
                },
              [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                {
                  outline: "none",
                },
              "--unstable_DataGrid-radius": "0",
              "& .MuiDataGrid-row": {
                "&:hover": {
                  cursor: "pointer",
                },
              },
              "& .MuiIconButton-root": {
                outline: "none",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                fontWeight: "400",
              },
            }}
            className="!border-0"
            onRowClick={(params) => {
              _handleRowClick(params.id);
            }}
            // paginationMode="server"
            //   rowCount={
            //     databaseTableStatistics
            //       ? parseInt(databaseTableStatistics.databaseTableRowCount)
            //       : 0
            //   }
            // pageSizeOptions={[20, 50, 100]}
            // paginationModel={{ page: page - 1, pageSize }}
            // onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
            //   setPage(newPage + 1); // Convert to 1-based for API
            //   setPageSize(newPageSize);
            // }}
            hideFooterPagination
            hideFooterSelectedRowCount
          />
        </div>
      ) : (
          <div className="w-full p-2">
            <NoEntityUI message="No roles found" />
        </div>
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};
