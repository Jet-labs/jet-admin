import { Calendar, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import moment from "moment";
import React from "react";

const NEUTRAL_CHIP =
  "inline-flex items-center rounded border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground";

/**
 * Generates column definitions for MUI DataGrid with custom rendering and editing components.
 * @param {object} param0 - Configuration object.
 * @param {*} [param0.customIntMappings] - Optional custom mappings for integer types.
 * @returns {Array<object>} - Array of DataGrid column definitions.
 */
export const getFormattedAuditLogColumns = ({ onMetadataClick } = {}) => {
  try {
    const formattedColumns = [
      {
        field: "tblUsers",
        headerName: "User",
        width: 200,
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
        width: 160,
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
                <span className="text-xs text-muted-foreground font-mono leading-tight">
                  {apiKeyPrefix}••••••••
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "success",
        headerName: "Result",
        width: 120,
        editable: false,
        sortable: true,
        type: "boolean",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          const succeeded = Boolean(params.value);
          const Icon = succeeded ? CheckCircle2 : XCircle;
          return (
            <div className="flex h-full w-full items-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${
                  succeeded
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {succeeded ? "Success" : "Failed"}
              </span>
            </div>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 190,
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
            <div className="flex h-full w-fit flex-row items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="whitespace-nowrap text-xs text-foreground">
                {params.value
                  ? moment(params.value).format("MMM D, YYYY · HH:mm")
                  : "—"}
              </span>
            </div>
          );
        },
      },
      {
        field: "type",
        headerName: "Type",
        width: 120,
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
            <div className="flex h-full w-full flex-row items-center">
              <span className={NEUTRAL_CHIP}>{params.value || "—"}</span>
            </div>
          );
        },
      },
      {
        field: "subType",
        headerName: "Method",
        width: 110,
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
            <div className="flex h-full w-full flex-row items-center">
              <span className={`${NEUTRAL_CHIP} font-mono`}>{params.value || "—"}</span>
            </div>
          );
        },
      },
      {
        field: "metadata",
        headerName: "Details",
        width: 120,
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
            <div className="flex h-full w-full flex-row items-center">
              {hasData ? (
                <button
                  type="button"
                  onClick={() => onMetadataClick?.(params.value)}
                  title="View request details"
                  className="inline-flex items-center gap-1.5 rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  <span>View</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
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
