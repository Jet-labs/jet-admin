import { BiCalendar } from "react-icons/bi";
import moment from "moment";
import ReactJson from "react-json-view";
import React from "react";

/**
 * Generates column definitions for MUI DataGrid with custom rendering and editing components.
 * @param {object} param0 - Configuration object.
 * @param {string} param0.tenantID - Tenant ID.
 * @param {string} param0.databaseSchemaName - Schema name.
 * @param {string} param0.databaseTableName - Table name.
 * @param {Array<DatabaseTableColumn>} param0.databaseTableColumns - Array of column metadata objects.
 * @param {*} [param0.customIntMappings] - Optional custom mappings for integer types.
 * @param {Map} [param0.databaseTableColumnForeignKeyMap] - Map of foreign key references.
 * @returns {Array<object>} - Array of DataGrid column definitions.
 */
export const getFormattedCronJobHistoryColumns = () => {
  try {
    const formattedColumns = [
      {
        field: "cronJobHistoryID",
        headerName: "History ID",
        width: 150,
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
        field: "cronJobID",
        headerName: "Job ID",
        width: 150,
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
        field: "status",
        headerName: "Status",
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
            <div className="w-fit flex h-full flex-row justify-start items-center">
              {params.value}
            </div>
          );
        },
      },
      {
        field: "scheduledAt",
        headerName: "Scheduled At",
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
            <div className="flex h-full w-fit flex-row items-center gap-2 text-muted-foreground">
              <BiCalendar className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="flex h-full items-center overflow-hidden text-ellipsis break-all whitespace-pre-wrap text-xs text-foreground">
                {params.value
                  ? moment(params.value).toDate().toISOString()
                  : ""}
              </span>
            </div>
          );
        },
      },
      {
        field: "startTime",
        headerName: "Start Time",
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
            <div className="flex h-full w-fit flex-row items-center gap-2 text-muted-foreground">
              <BiCalendar className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="flex h-full items-center overflow-hidden text-ellipsis break-all whitespace-pre-wrap text-xs text-foreground">
                {params.value
                  ? moment(params.value).toDate().toISOString()
                  : ""}
              </span>
            </div>
          );
        },
      },
      {
        field: "endTime",
        headerName: "End Time",
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
            <div className="flex h-full w-fit flex-row items-center gap-2 text-muted-foreground">
              <BiCalendar className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="flex h-full items-center overflow-hidden text-ellipsis break-all whitespace-pre-wrap text-xs text-foreground">
                {params.value
                  ? moment(params.value).toDate().toISOString()
                  : ""}
              </span>
            </div>
          );
        },
      },
      {
        field: "result",
        headerName: "Result",
        width: 500,
        editable: false,
        sortable: true,
        type: "object",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          return JSON.parse(value);
        },
        renderCell: (params) => {
          return (
            <div className="max-h-32 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-foreground">
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
