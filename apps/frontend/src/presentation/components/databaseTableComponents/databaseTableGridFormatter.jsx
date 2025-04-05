import { BiCalendar, BiLink, BiUnlink } from "react-icons/bi";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import moment from "moment";
import ReactJson from "react-json-view";
import { DatabaseTableColumn } from "../../../data/models/databaseTableColumn";
import { PostgreSQLUtils } from "../../../utils/postgre";

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
  tenantID,
  databaseSchemaName,
  databaseTableName,
  type,
  isID,
  isList,
  params,
  customIntMapping,
  foreignKeyReference, // Indicates if the field is part of a foreign key
}) => {
  const cellValue = params.value;
  const convertedType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]?.js_type;
  const commonTextStyle =
    "text-justify break-all overflow-hidden text-ellipsis whitespace-pre-wrap";
  const chipStyle = "px-2 py-0.5 rounded text-sm font-medium w-min";
  const foreignKeyIndicatorStyle =
    cellValue === undefined || cellValue === null || cellValue === ""
      ? ""
      : "inline-flex items-center  text-blue-600 ";

  const foreignKeyReferenceLink = () => {
    return `${CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.path(
      tenantID,
      databaseSchemaName,
      foreignKeyReference?.[0]?.referencedTable
    )}?filterQuery=${encodeURIComponent(
      JSON.stringify([
        {
          field: foreignKeyReference?.[0]?.referencedColumns[0],
          operator: "=",
          value: PostgreSQLUtils.processFilterValueAccordingToFieldType({
            type: CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].js_type,
            value: cellValue,
          }),
          fieldType: type,
        },
      ])
    )}`;
  };
  const renderForeignKeyIndicator = (value) => {
    return (
      <span className={foreignKeyIndicatorStyle}>
        {value === undefined || value === null || value === "" ? (
          <div className="p-1 bg-red-100 mr-2 rounded cursor-not-allowed">
            <BiUnlink size={14} className="text-red-400" />
          </div>
        ) : (
          <Link
            to={foreignKeyReferenceLink()}
            target="_blank"
            className="p-1 bg-slate-100 mr-2 rounded cursor-pointer"
          >
            <BiLink size={14} />
          </Link>
        )}
        {/* Icon to indicate foreign key */}
        <span>{value}</span>
      </span>
    );
  };
  switch (convertedType) {
    case CONSTANTS.JS_DATA_TYPES.STRING:
      return isList ? (
        <ul className="space-y-1">
          {cellValue?.map((value, index) => (
            <li key={index} className={commonTextStyle}>
              {foreignKeyReference ? renderForeignKeyIndicator(value) : value}
            </li>
          ))}
        </ul>
      ) : (
        <span className={commonTextStyle}>
          {foreignKeyReference
            ? renderForeignKeyIndicator(cellValue)
            : cellValue}
        </span>
      );

    case CONSTANTS.JS_DATA_TYPES.BOOLEAN: {
      const boolValue = Boolean(cellValue);
      const boolStyle = `${chipStyle} ${
        boolValue ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`;
      return isList ? (
        <div className="space-y-1">
          {cellValue?.map((value, index) => (
            <div key={index} className={boolStyle}>
              {foreignKeyReference
                ? renderForeignKeyIndicator(String(Boolean(value)))
                : String(Boolean(value))}
            </div>
          ))}
        </div>
      ) : (
        <div className={boolStyle}>
          {foreignKeyReference
            ? renderForeignKeyIndicator(String(boolValue))
            : String(boolValue)}
        </div>
      );
    }

    case CONSTANTS.JS_DATA_TYPES.DATE:
      return (
        <div className="flex items-center space-x-2">
          <BiCalendar className="text-[#646cff] flex-shrink-0" />
          <span className={commonTextStyle}>
            {foreignKeyReference
              ? renderForeignKeyIndicator(
                  moment(cellValue).format("YYYY-MM-DD HH:mm")
                )
              : moment(cellValue).format("YYYY-MM-DD HH:mm")}
          </span>
        </div>
      );

    case CONSTANTS.JS_DATA_TYPES.NUMBER: {
      const renderValue = (value) => (
        <div className="space-y-1">
          {foreignKeyReference
            ? renderForeignKeyIndicator(customIntMapping?.[value] || value)
            : customIntMapping?.[value] || value}
        </div>
      );
      return isList ? (
        <div className="flex flex-wrap gap-1">
          {cellValue?.map((value, index) => (
            <div key={index}>
              {customIntMapping ? (
                <span title={value}>{renderValue(value)}</span>
              ) : (
                renderValue(value)
              )}
            </div>
          ))}
        </div>
      ) : (
        renderValue(cellValue)
      );
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
          {isList ? JSON.stringify(cellValue) : cellValue}
        </span>
      );
  }
};

/**
 *
 * @param {object} param0
 * @param {Array<DatabaseTableColumn>} param0.databaseTableColumns
 * @param {*} param0.customIntMappings
 * @returns
 */
export const getFormattedTableColumns = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableColumns,
  customIntMappings,
  databaseTableColumnForeignKeyMap,
}) => {
  try {
    return databaseTableColumns.map((column) => {
      const convertedType =
        CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.databaseTableColumnType]
          ?.js_type;
      const foreignKeyReference =
        databaseTableColumnForeignKeyMap?.get(column.databaseTableColumnName)
          ?.length > 0
          ? databaseTableColumnForeignKeyMap?.get(
              column.databaseTableColumnName
            )
          : null;

      return {
        field: column.databaseTableColumnName,
        name: column.databaseTableColumnName,
        key: column.databaseTableColumnName,
        sortable: true,
        headerName: String(column.databaseTableColumnName),
        type: convertedType,
        editable: !column.isID,
        dbType: column.databaseTableColumnType,
        isList: column.isList,
        width: getFieldWidth(column.databaseTableColumnType),
        display: "flex",
        foreignKeyReference,
        valueGetter: (value, row) => {
          return PostgreSQLUtils.processFilterValueAccordingToFieldType({
            type: convertedType,
            value: value,
          });
        },
        renderCell: (params) => {
          return getFieldFormatting({
            tenantID,
            databaseSchemaName,
            databaseTableName,
            type: column.databaseTableColumnType,
            isID: column.isID,
            isList: column.isList,
            params,
            customIntMapping:
              customIntMappings?.[column.databaseTableColumnName],
            foreignKeyReference,
          });
        },

        // valueGetter: (value) => {
        //   return getFieldValue(value, column.type).value;
        // },
      };
    });
  } catch (error) {
    console.warn("Error in formatting columns", error);
  }
};