import { DataGrid, gridClasses, useGridApiRef } from "@mui/x-data-grid";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";
import { useUserManagementState } from "../../../logic/contexts/userManagementContext";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

export const TenantUsersList = () => {
  const {
    tenantUsers,
    tenantUsersError,
    isLoadingTenantUsers,
    isFetchingTenantUsers,
  } = useUserManagementState();
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const { tenantID } = useParams();

  const columns = [
    {
      field: "email",
      display: "flex",
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Email",
    },
    {
      field: "firebaseID",
      display: "flex",
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "Firebase ID",
    },
    {
      field: "firstName",
      display: "flex",
      headerClassName: "bg-muted text-foreground font-semibold",
      flex: 1,
      headerName: "First Name",
    },
    {
      field: "isTenantAdmin",
      headerName: "Membership",
      display: "flex",
      headerClassName: "bg-muted text-foreground font-semibold",
      renderCell: (params) => (
        <Badge variant={params.value ? "outline" : "warning"} className={params.value ? "border-primary/50 bg-primary/10 text-primary" : undefined}>
          {params.value ? "Admin" : "Member"}
        </Badge>
      ),
      flex: 1,
    },
    {
      field: "roles",
      display: "flex",
      headerName: "Roles",
      headerClassName: "bg-muted text-foreground font-semibold",
      valueGetter: (value, row) => {
        return Array.from(row.roles || [])
          .map((role) => role.roleTitle)
          .join(", ");
      },
      flex: 2,
    },
  ];

  const _getRowID = (row) => {
    return row.userID;
  };

  const _handleRowClick = (tenantUserID) => {
    navigate(
      CONSTANTS.ROUTES.UPDATE_TENANT_USER_BY_ID.path(tenantID, tenantUserID)
    );
  };

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenantUsers}
      error={tenantUsersError}
    >
      {tenantUsers?.users?.length ? (
        <div className="flex h-full w-full flex-grow flex-col items-stretch justify-between overflow-y-auto text-sm font-medium text-foreground">
          <DataGrid
            apiRef={apiRef}
            rows={tenantUsers.users}
            columns={columns}
            density="compact"
            loading={isLoadingTenantUsers || isFetchingTenantUsers}
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
              "& .MuiCheckbox-root": {
                padding: "4px",
              },
              "& .MuiDataGrid-columnHeaderCheckbox": {
                minWidth: "auto !important",
                width: "auto !important",
                flex: "0 0 auto !important",
                padding: "0.25rem !important",
                "& .MuiDataGrid-columnHeaderTitleContainer": {
                  width: "auto",
                  minWidth: "auto",
                  flex: "none",
                },
              },
              "& .MuiDataGrid-cellCheckbox": {
                minWidth: "auto !important",
                width: "auto !important",
                flex: "0 0 auto !important",
                color: "hsl(var(--primary))",
                padding: "0.25rem !important",
              },
            }}
            // showCellVerticalBorder
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
            <NoEntityUI message="No users found" />
        </div>
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};
