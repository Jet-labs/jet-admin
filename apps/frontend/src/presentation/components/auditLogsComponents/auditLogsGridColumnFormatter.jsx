import { Calendar } from 'lucide-react';
import moment from "moment";
import React from "react";

/**
 * Generates column definitions for MUI DataGrid with custom rendering and editing components.
 * @param {object} param0 - Configuration object.
 * @param {string} param0.tenantID - Tenant ID.
 * @param {*} [param0.customIntMappings] - Optional custom mappings for integer types.
 * @returns {Array<object>} - Array of DataGrid column definitions.
 */
export const getFormattedAuditLogColumns = ({ onMetadataClick } = {}) => {
  try {
    const formattedColumns = [
      // {
      //   field: "auditLogID",
      //   headerName: "Log ID",
      //   width: 350,
      //   editable: false,
      //   sortable: true,
      //   type: "number",
      //   headerAlign: "left",
      //   align: "left",
      //   valueGetter: (value) => {
      //     return value;
      //   },
      //   renderCell: (params) => {
      //     return (
      //       <div className="w-fit flex h-full flex-row justify-start items-center">
      //         {params.value}
      //       </div>
      //     );
      //   },
      // },
      {
        field: "tblUsers",
        headerName: "User",
        width: 220,
        editable: false,
        sortable: false,
        type: "string",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          if (!value) return null;
          const name = [value.firstName, value.lastName].filter(Boolean).join(" ");
          return name || value.email || value.userID;
        },
        renderCell: (params) => {
          if (!params.row.tblUsers) {
            return (
              <div className="w-fit flex h-full flex-row justify-start items-center">
                <span className="text-muted-foreground text-xs italic">—</span>
              </div>
            );
          }
          const { firstName, lastName, email } = params.row.tblUsers;
          const name = [firstName, lastName].filter(Boolean).join(" ");
          return (
            <div className="flex flex-col justify-center h-full">
              {name && <span className="text-sm font-medium leading-tight">{name}</span>}
              <span className="text-xs text-muted-foreground leading-tight">{email}</span>
            </div>
          );
        },
      },
      {
        field: "tblAPIKeys",
        headerName: "API Key",
        width: 200,
        editable: false,
        sortable: false,
        type: "string",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          if (!value) return null;
          return value.apiKeyTitle || value.apiKeyPrefix || value.apiKeyID;
        },
        renderCell: (params) => {
          if (!params.row.tblAPIKeys) {
            return (
              <div className="w-fit flex h-full flex-row justify-start items-center">
                <span className="text-muted-foreground text-xs italic">—</span>
              </div>
            );
          }
          const { apiKeyTitle, apiKeyPrefix } = params.row.tblAPIKeys;
          return (
            <div className="flex flex-col justify-center h-full">
              {apiKeyTitle && <span className="text-sm font-medium leading-tight">{apiKeyTitle}</span>}
              {apiKeyPrefix && (
                <span className="text-xs text-muted-foreground font-mono leading-tight">{apiKeyPrefix}••••••••</span>
              )}
            </div>
          );
        },
      },
      {
        field: "success",
        headerName: "Success",
        width: 150,
        editable: false,
        sortable: true,
        type: "boolean",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div
              className={
                "w-full flex h-full flex-row justify-start items-center"
              }
            >
              <span
                className={`${"px-2 py-0.5 rounded text-sm font-medium w-min"} ${
                  // eslint-disable-next-line no-extra-boolean-cast
                  !!params.value
                    ? "bg-green-950/40 text-green-400 w-full flex  flex-row justify-start items-center p-2"
                    : "bg-red-950/40 text-red-400 w-full flex  flex-row justify-start items-center p-2"
                }`}
              >
                {String(Boolean(params.value))}
              </span>
            </div>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created At",
        width: 300,
        editable: false,
        sortable: true,
        type: "date",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return moment(value).toDate();
        },
        renderCell: (params) => {
          return (
            <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
              <Calendar className="text-primary flex-shrink-0" />
              <span className="text-justify break-all overflow-hidden text-ellipsis whitespace-pre-wrap h-full flex items-center">
                {params.value
                  ? moment(params.value).toDate().toISOString()
                  : ""}
              </span>
            </div>
          );
        },
      },
      {
        field: "type",
        headerName: "Type",
        width: 150,
        editable: false,
        sortable: true,
        type: "string",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div
              className={
                "w-full flex h-full flex-row justify-start items-center"
              }
            >
              <span className="px-2 py-0.5 rounded text-sm font-medium w-min bg-primary/10 text-primary  flex  flex-row justify-start items-center p-2">
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "subType",
        headerName: "Sub Type",
        width: 150,
        editable: false,
        sortable: true,
        type: "string",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          let chipStyle =
            "px-2 py-0.5 rounded text-sm font-medium w-min bg-primary/10 text-primary  flex  flex-row justify-start items-center p-2";
          switch (params.value) {
            case "GET":
              chipStyle += " bg-green-950/40 text-green-400";
              break
            case "POST":
              chipStyle += " bg-blue-950/40 text-blue-400";
              break;
            case "PUT":
              chipStyle += " bg-yellow-100 text-yellow-800";
              break;
            case "DELETE":
              chipStyle += " bg-red-950/40 text-red-400";
              break;
            default:
              break;
          }
          return (
            <div
              className={
                "w-full flex h-full flex-row justify-start items-center"
              }
            >
              <span className={chipStyle}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "metadata",
        headerName: "Metadata",
        width: 200,
        editable: false,
        sortable: false,
        type: "object",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          const hasData = params.value !== null && params.value !== undefined;
          return (
            <div className="w-full flex h-full flex-row justify-start items-center">
              {hasData ? (
                  <button
                  onClick={() => onMetadataClick?.(params.value)}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1 border border-primary/20"
                >
                  <span>View Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </button>
              ) : (
                <span className="text-muted-foreground text-xs italic">—</span>
              )}
            </div>
          );
        },
      },
    ];
    return formattedColumns;
  } catch (error) {
    console.error("Error encountered in getFormattedTableColumns:", error);
    return []; // Return empty array on error to prevent grid crash
  }
};
