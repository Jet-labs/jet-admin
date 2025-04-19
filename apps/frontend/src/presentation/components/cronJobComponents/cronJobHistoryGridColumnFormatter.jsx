import { BiCalendar } from "react-icons/bi";
import { CONSTANTS } from "../../../constants";

import moment from "moment";
import ReactJson from "react-json-view";
import { DatabaseTableColumn } from "../../../data/models/databaseTableColumn";


/**
 * Returns width for different field types
 */
const getFieldWidth = (type) => {
  const widths = {
    [CONSTANTS.DATA_TYPES.STRING]: 300,
    [CONSTANTS.DATA_TYPES.BOOLEAN]: 150,
    [CONSTANTS.DATA_TYPES.DATETIME]: 250,
    [CONSTANTS.DATA_TYPES.INT]: 150,
    [CONSTANTS.DATA_TYPES.JSON]: 450,
  };
  return widths[type] || 300;
};

const getFieldFormatting = ({
  type,
  isID,
  isList,
  params,
}) => {
  const cellValue = params.value;
  const convertedType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]?.js_type;
  const commonTextStyle =
    "text-justify break-all overflow-hidden text-ellipsis whitespace-pre-wrap h-full flex items-center";
  const chipStyle = "px-2 py-0.5 rounded text-sm font-medium w-min";


  switch (convertedType) {
    case CONSTANTS.JS_DATA_TYPES.STRING:
      return <span className={commonTextStyle}>{cellValue}</span>;

    case CONSTANTS.JS_DATA_TYPES.BOOLEAN: {
      const boolValue = Boolean(cellValue);
      const boolStyle = `${chipStyle} ${
        boolValue
          ? "bg-green-100 text-green-800 w-full flex  flex-row justify-start items-center p-2"
          : "bg-red-100 text-red-800 w-full flex  flex-row justify-start items-center p-2"
      }`;
      return (
        <div
          className={"w-full flex h-full flex-row justify-start items-center"}
        >
          {<span className={boolStyle}>{String(boolValue)}</span>}
        </div>
      );
    }

    case CONSTANTS.JS_DATA_TYPES.DATE:
      return (
        <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
          <BiCalendar className="text-[#646cff] flex-shrink-0" />
          <span className={commonTextStyle}>
            {cellValue
              ?  moment(cellValue).toDate().toISOString()
              : ""}
          </span>
        </div>
      );

    case CONSTANTS.JS_DATA_TYPES.NUMBER: {
      
      return <div className="w-fit flex h-full flex-row justify-start items-center">
          {value}
        </div>;
    }

    case CONSTANTS.JS_DATA_TYPES.OBJECT: {
      let parsedCellValue;
      try {
        parsedCellValue =
          typeof cellValue === "string" ? JSON.parse(cellValue) : cellValue;
      } catch (error) {
        console.warn("Invalid JSON data:", cellValue, error);
        parsedCellValue = null; // Fallback to null if parsing fails
      }

      return (
        <div className="max-h-32 overflow-auto rounded !text-slate-700 p-2">
          {parsedCellValue !== null ? (
            <ReactJson
              src={parsedCellValue}
              theme="rjv-default"
              displayDataTypes={false}
              collapsed={1}
              style={{ backgroundColor: "transparent" }}
            />
          ) : (
            <span className="text-red-500">Invalid JSON data</span>
          )}
        </div>
      );
    }

    default:
      return (
        <span className={commonTextStyle}>
          {cellValue}
        </span>
      );
  }
};

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
export const getFormattedCronJobHistoryColumns = ({
  cronJobHistorySchema,
}) => {
  try {
    // Map over the raw column metadata
    return [{
      field: "cronJobHistoryID",
      headerName: "History ID",
      width: 150,
      editable: false,
      sortable: true,
      type: "number",
      headerAlign: "left",
      align: "left",
      valueGetter: (value, row) => {
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
      valueGetter: (value, row) => {
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
      valueGetter: (value, row) => {
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
      valueGetter: (value, row) => {
        return moment(value).toDate();
      },
      renderCell: (params) => {
        return (
          <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
            <BiCalendar className="text-[#646cff] flex-shrink-0" />
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
      field: "startTime",
      headerName: "Start Time",
      width: 300,
      editable: false,
      sortable: true,
      type: "date",
      headerAlign: "left",
      align: "left",
      valueGetter: (value, row) => {
        return moment(value).toDate();
      },
      renderCell: (params) => {
        return (
          <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
            <BiCalendar className="text-[#646cff] flex-shrink-0" />
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
      field: "endTime",
      headerName: "End Time",
      width: 300,
      editable: false,
      sortable: true,
      type: "date",
      headerAlign: "left",
      align: "left",
      valueGetter: (value, row) => {
        return moment(value).toDate();
      },
      renderCell: (params) => {
        return (
          <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
            <BiCalendar className="text-[#646cff] flex-shrink-0" />
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
      field: 'result',
      headerName: "Result",
      width: 500,
      editable: false,
      sortable: true,
      type: "object",
      headerAlign: "left",
      align: "left",
      valueGetter: (value, row) => {
        return JSON.parse(value);
      },
      renderCell: (params) => {
        return (
          <div className="max-h-32 overflow-auto rounded !text-slate-700 p-2">
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
  ]
  } catch (error) {
    console.error("Error encountered in getFormattedTableColumns:", error);
    return []; // Return empty array on error to prevent grid crash
  }
};
