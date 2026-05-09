import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useTenantRoles } from "../../../logic/hooks/useTenantRoles";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Badge } from "@jet-admin/ui";
import { DATAGRID_SX } from "../../../shared/dataGridTheme";

export const TenantRolesList = () => {
  const { tenantID } = useParams();
  const {
    tenantRoles,
    tenantRolesError,
    isLoadingTenantRoles,
    isFetchingTenantRoles,
  } = useTenantRoles(tenantID);
  const apiRef = useGridApiRef();
  const navigate = useNavigate();


  const columns = [
    {
      field: "roleID",
      flex: 1,
      headerName: "Role ID",
    },
    {
      field: "roleTitle",
      flex: 1,
      headerName: "Role Name",
    },
    {
      field: "roleDescription",
      flex: 2,
      headerName: "Role Description",
    },
    {
      field: "tenantID",
      headerName: "Role Type",
      flex: 1,
      renderCell: ({ value }) => (
        <Badge
          variant={value ? "warning" : "outline"}
          className={!value ? "border-primary/30 bg-primary/5 text-primary" : ""}
        >
          {value ? "Custom Role" : "Global Role"}
        </Badge>
      ),
    },
  ];

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
        <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
          <DataGrid
            apiRef={apiRef}
            rows={tenantRoles.roles}
            columns={columns}
            loading={isLoadingTenantRoles || isFetchingTenantRoles}
            getRowId={(row) => row.roleID}
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
          <NoEntityUI message="No roles found" />
        </div>
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};
