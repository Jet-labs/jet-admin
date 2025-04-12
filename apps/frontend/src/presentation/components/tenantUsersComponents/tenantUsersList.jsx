import { useUserManagementState } from "../../../logic/contexts/userManagementContext";
import { DataGrid, gridClasses, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { NoEntityUI } from "../ui/noEntityUI";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";

export const TenantUsersList = () => {
  const { tenantUsers, isLoadingTenantUsers, isFetchingTenantUsers } =
    useUserManagementState();
  const apiRef = useGridApiRef();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();
  const { tenantID } = useParams();

  const columns = [
    {
      field: "email",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Email",
    },
    {
      field: "firebaseID",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Firebase ID",
    },
    {
      field: "firstName",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "First Name",
    },
    {
      field: "isTenantAdmin",
      headerName: "Membership",
      display: "flex",
      renderCell: (params) => (
        <>
          {params.value ? (
            <span className="p-1 border-green-300 bg-green-100 border rounded text-green-700 text-xs font-semibold">
              Admin
            </span>
          ) : (
            <span className="p-1 border-orange-300 border bg-orange-100 rounded text-orange-700 text-xs font-semibold">
              Member
            </span>
          )}
        </>
      ),
      flex: 1,
    },
    {
      field: "roles",
      display: "flex",
      headerName: "Roles",
      valueGetter: (value, row) => {
        return Array.from(row.roles)
          .map((role) => role.roleName)
          .join(", ");
      },
      // width: 500,
      headerClassName: "bg-white text-slate-700 font-semibold",
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

  return isLoadingTenantUsers || isFetchingTenantUsers ? (
    <div
      className={`w-full h-full !overflow-y-hidden flex justify-center items-center`}
    >
      <CircularProgress />
    </div>
  ) : tenantUsers?.users ? (
    <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium">
      <DataGrid
        apiRef={apiRef}
        rows={tenantUsers.users}
        columns={columns}
        loading={isLoadingTenantUsers}
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
          "& .MuiDataGrid-root": {
            borderRadius: 0,
          },
          "& .MuiIconButton-root": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader": {},
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#334155 !important",
            fontWeight: "700 !important",
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
            color: "#646cff !important",
            padding: "0.25rem !important",
          },
        }}
        // showCellVerticalBorder
        className="!border-0"
        onRowClick={(params, e, details) => {
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
    <div className="!w-full !p-2">
      <NoEntityUI message={CONSTANTS.ERROR_CODES.SERVER_ERROR.message} />
    </div>
  );
};
