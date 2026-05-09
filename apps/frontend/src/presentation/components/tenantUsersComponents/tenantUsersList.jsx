import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";
import { useTenantUsers } from "../../../logic/hooks/useTenantUsers";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DATAGRID_SX } from "../../../shared/dataGridTheme";

export const TenantUsersList = () => {
  const { tenantID } = useParams();
  const {
    tenantUsers,
    tenantUsersError,
    isLoadingTenantUsers,
    isFetchingTenantUsers,
  } = useTenantUsers(tenantID);
  const apiRef = useGridApiRef();
  const navigate = useNavigate();

  const columns = [
    {
      field: "email",
      flex: 1,
      headerName: "Email",
    },
    {
      field: "firebaseID",
      flex: 1,
      headerName: "Firebase ID",
    },
    {
      field: "firstName",
      flex: 1,
      headerName: "First Name",
    },
    {
      field: "isTenantAdmin",
      headerName: "Membership",
      flex: 1,
      renderCell: ({ value }) => (
        <Badge
          variant={value ? "outline" : "warning"}
          className={value ? "border-primary/30 bg-primary/5 text-primary" : undefined}
        >
          {value ? "Admin" : "Member"}
        </Badge>
      ),
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 2,
      renderCell: ({ row }) => {
        const roleStr = Array.from(row.roles || [])
          .map((role) => role.roleTitle)
          .join(", ");
        return <span className="truncate">{roleStr || "—"}</span>;
      },
    },
  ];

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
        <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
          <DataGrid
            apiRef={apiRef}
            rows={tenantUsers.users}
            columns={columns}
            loading={isLoadingTenantUsers || isFetchingTenantUsers}
            getRowId={(row) => row.userID}
            sx={DATAGRID_SX}
            getRowHeight={() => "auto"}
            className="!border-0"
            onRowClick={(params) => _handleRowClick(params.id)}
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
