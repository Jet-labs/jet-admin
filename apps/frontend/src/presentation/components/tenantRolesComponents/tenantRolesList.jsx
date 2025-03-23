import { useRoleManagementState, } from "../../../logic/contexts/roleManagementContext";
import { DataGrid, gridClasses, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { NoEntityUI } from "../ui/noEntityUI";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";

export const TenantRolesList = () => {
  const { tenantRoles, isLoadingTenantRoles, isFetchingTenantRoles } =
    useRoleManagementState();
  const apiRef = useGridApiRef();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();
  const { tenantID } = useParams();

  const columns = [
    {
      field: "roleID",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Role ID",
    },
    {
      field: "roleName",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Role Name",
    },
    {
      field: "roleDescription",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Role Description",
    },
    {
      field: "tenantID",
      display: "flex",
      // width: 300,
      headerClassName: "bg-white text-slate-700 font-semibold",
      flex: 1,
      headerName: "Role type",
      renderCell: (params) => {
        return params.value ? (
          <span className="p-1 border-orange-300 border bg-orange-100 rounded text-orange-700 text-xs font-semibold">
            Custom role
          </span>
        ) : (
          <span className="p-1 border-[#646cffaf] border bg-[#f8f8ff] rounded text-[#646cffaf] text-xs font-semibold">
            Global role
          </span>
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

  return isLoadingTenantRoles || isFetchingTenantRoles ? (
    <div
      className={`w-full h-full !overflow-y-hidden flex justify-center items-center`}
    >
      <CircularProgress />
    </div>
  ) : tenantRoles?.roles ? (
    <div className="flex flex-col w-full flex-grow h-full overflow-y-auto justify-between items-stretch text-sm font-medium text-slate-700">
      <DataGrid
        apiRef={apiRef}
        rows={tenantRoles.roles}
        columns={columns}
        density="standard"
        loading={isLoadingTenantRoles}
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
          "& .MuiDataGrid-columnHeader": {},
          "& .MuiDataGrid-row": {
            "&:hover": {
              cursor: "pointer",
            },
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#334155 !important",
            fontWeight: "700 !important",
          },
          // "& .MuiDataGrid-columnSeparator": {
          //   color: "#64748b !important",
          // },
          "--unstable_DataGrid-radius": "0",
          "& .MuiDataGrid-root": {
            borderRadius: 0,
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
          "& .MuiDataGrid-cellCheckbox": {
            width: "unset",
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
