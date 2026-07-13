import { Calendar } from 'lucide-react';
import moment from "moment";
import ReactJson from "react-json-view";
import React from "react";

/**
 * Generates column definitions for MUI DataGrid with custom rendering and editing components.
 * @param {object} param0 - Configuration object.
 * @param {string} param0.tenantID - Tenant ID.
 * @param {*} [param0.customIntMappings] - Optional custom mappings for integer types.
 * @returns {Array<object>} - Array of DataGrid column definitions.
 */
export const getFormattedAuditLogColumns = () => {
  try {
    const formattedColumns = [
      {
        field: "auditLogID",
        headerName: "Log ID",
        width: 350,
        editable: false,
        sortable: true,
        type: "number",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div className="w-fit flex h-full flex-row justify-start items-center">
              {params.value}
            </div>
          );
        },
      },
      {
        field: "userID",
        headerName: "User ID",
        width: 100,
        editable: false,
        sortable: true,
        type: "number",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div className="w-fit flex h-full flex-row justify-start items-center">
              {params.value}
            </div>
          );
        },
      },
      {
        field: "tenantID",
        headerName: "Tenant ID",
        width: 100,
        editable: false,
        sortable: true,
        type: "number",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div className="w-fit flex h-full flex-row justify-start items-center">
              {params.value}
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
        width: 300,
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
        width: 300,
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
        width: 500,
        editable: false,
        sortable: true,
        type: "object",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return value;
        },
        renderCell: (params) => {
          return (
            <div className="max-h-32 overflow-auto rounded !text-foreground p-2">
              <ReactJson
                src={params.value}
                theme="rjv-default"
                displayDataTypes={false}
                collapsed={true}
                style={{ backgroundColor: "transparent" }}
              />
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
