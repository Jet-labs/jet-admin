import { Box, Chip, List, ListItem, Paper, Tooltip } from "@mui/material";

import { BiCalendar } from "react-icons/bi";
import { LOCAL_CONSTANTS } from "../constants";
import { Model } from "../models/data/model";
import ReactJson from "react-json-view";
import moment from "moment";

/**
 *
 * @param {object} param0
 * @param {Array<object>} param0.columns
 * @param {object} param0.values
 */
export const processTableFieldValuesBeforeSubmit = ({ columns, values }) => {
  const _values = structuredClone(values);

  columns.forEach((column) => {
    const columnType = column.type;
    // Handle null values
    if (values[column.name] === null || values[column.name] === undefined) {
      _values[column.name] = "NULL";
      return;
    }
    if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.timestamptz.name
    ) {
      _values[column.name] = `'${values[column.name]}'::timestamptz`;
    } else if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.time.name
    ) {
      _values[column.name] = `'${values[column.name]}'::time`;
    } else if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.date.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.timestamp.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.timetz.name
    ) {
      _values[column.name] = `'${values[column.name]}'`;
    } else if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.text.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.varchar.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.bpchar.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.json.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.jsonb.name
    ) {
      _values[column.name] = `'${values[column.name]}'`;
    } else if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.bool.name
    ) {
      _values[column.name] = values[column.name] ? "TRUE" : "FALSE";
    } else if (
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.int2.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.int4.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.int8.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.numeric.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.float4.name ||
      columnType === LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.float8.name
    ) {
      // No quotes needed for numeric values
      _values[column.name] = values[column.name];
    } else {
      // Default case: no type conversion or encapsulation
      _values[column.name] = values[column.name];
    }
  });

  return _values;
};

/**
 *
 * @param {String} field
 * @param {Model} tableModel
 * @returns
 */
export const getFieldModelFromModel = (field, tableModel) => {
  return tableModel.fields.find((fieldModel) => fieldModel.name === field);
};

/**
 *
 * @param {String} tableName
 * @param {Model[]} dbModel
 * @returns
 */
export const getTableIDProperty = (tableName, dbModel) => {
  const prismaModel = dbModel.find((m) => m.name === tableName);
  let tableIDs = [];
  if (
    prismaModel &&
    prismaModel.primaryKey &&
    prismaModel.primaryKey.fields?.length > 0
  ) {
    tableIDs = prismaModel.primaryKey.fields;
  } else {
    const idField = prismaModel?.fields.find((f) => f.isId);
    tableIDs = [idField.name];
  }
  return tableIDs;
};

export const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 *
 * @param {object} param0
 * @param {String} param0.type
 * @param {Boolean} param0.isList
 * @param {Boolean} param0.isID
 * @param {any} param0.params
 * @param {object} param0.customIntMapping
 * @returns
 */
export const getFieldFormatting = ({
  type,
  isID,
  isList,
  params,
  customIntMapping,
}) => {
  let f = params.value;
  const convertedType = LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]
    ? LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].normalizedType
    : LOCAL_CONSTANTS.DATA_TYPES.JSON;

  switch (convertedType) {
    case LOCAL_CONSTANTS.DATA_TYPES.STRING:
      if (isList) {
        f = (
          <ul>
            {params.value.map((value) => (
              <li className="!text-justify break-all text-ellipsis whitespace-pre-wrap">
                {value}
              </li>
            ))}
          </ul>
        );
      } else {
        f = (
          <span className="!text-justify break-all text-ellipsis whitespace-pre-wrap">
            {params.value}
          </span>
        );
      }

      break;
    case LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN: {
      f = isList ? (
        params.value.map((data) => {
          return (
            <ListItem key={data}>
              <Chip
                label={`${Boolean(data)}`}
                size="small"
                variant="filled"
                className=" !h-min !py-0.5 !border !border-slate-500 !rounded"
                sx={{
                  maxHeight: null,
                }}
                color={Boolean(params.value) ? "success" : "error"}
              />
            </ListItem>
          );
        })
      ) : (
        <Chip
          label={`${Boolean(params.value)}`}
          size="small"
          variant="filled"
          className=" !h-min !py-0.5 !border !border-slate-500 !rounded"
          sx={{
            maxHeight: null,
          }}
          color={Boolean(params.value) ? "success" : "error"}
        />
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.DATETIME: {
      if (isList) {
        params.value.map((data) => {
          return (
            <ListItem key={data}>
              <Chip
                label={`${moment(data).toLocaleString()}`}
                size="small"
                variant="filled"
                className=" !h-min !py-0.5 !border !border-slate-500 !rounded"
                sx={{
                  maxHeight: null,
                }}
                color={"default"}
                icon={<BiCalendar className="!text-sm !text-current" />}
              />
            </ListItem>
          );
        });
      }
      f = (
        <Chip
          label={`${moment(params.value).toLocaleString()}`}
          size="small"
          variant="filled"
          className=" !h-min !py-0.5 !border !border-slate-500 !rounded"
          sx={{
            maxHeight: null,
          }}
          color={"default"}
          icon={<BiCalendar className="!text-sm !text-current" />}
        />
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.INT: {
      let value = params.value;
      if (isList) {
        value = JSON.stringify(params.value);
      }
      f = isList ? (
        <div className="flex flex-row justify-start items-start w-full !flex-wrap h-auto flex-grow">
          {params.value.map((data) => {
            const _d = customIntMapping?.[data] ? customIntMapping[data] : data;
            const _class = customIntMapping?.[data]
              ? "!bg-slate-200 !text-slate-800 !h-min !pt-0.5 !border !border-slate-500 !rounded"
              : "!rounded-sm";
            return (
              <div key={data} className="p-0.5 w-min">
                {customIntMapping && customIntMapping[value] ? (
                  <Tooltip
                    placement="right"
                    className="!p-0"
                    sx={{ background: "background.secondary" }}
                    title={value}
                  >
                    <Chip
                      label={`${_d}`}
                      size="small"
                      variant="filled"
                      className={_class}
                      sx={{
                        maxHeight: null,
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Chip
                    label={`${_d}`}
                    size="small"
                    variant="filled"
                    className={_class}
                    sx={{
                      maxHeight: null,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        (() => {
          const _d = customIntMapping?.[value]
            ? customIntMapping[value]
            : value;
          const _class = customIntMapping?.[value]
            ? "!bg-slate-200 !text-slate-800 !h-min !pt-0.5 !border !border-slate-500 !rounded"
            : "!rounded !bg-transparent";
          return customIntMapping && customIntMapping[value] ? (
            <Tooltip
              placement="right"
              className="!p-0"
              sx={{ background: "background.secondary" }}
              title={value}
            >
              <Chip
                label={`${_d}`}
                size="small"
                variant="filled"
                className={_class}
                sx={{
                  maxHeight: null,
                }}
              />
            </Tooltip>
          ) : (
            <Chip
              label={`${_d}`}
              size="small"
              variant="filled"
              className={_class}
              sx={{
                maxHeight: null,
              }}
            />
          );
        })()
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.DECIMAL: {
      let value = params.value;
      if (isList) {
        value = JSON.stringify(params.value);
      }
      f = (
        <span className="!text-justify break-all text-ellipsis whitespace-pre-wrap">
          {value}
        </span>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.FLOAT: {
      let value = params.value;
      if (isList) {
        value = JSON.stringify(params.value);
      }
      f = (
        <span className="!text-justify break-all text-ellipsis whitespace-pre-wrap">
          {value}
        </span>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.JSON:
      // var m = params.value ? p : null;
      f = (
        <div className="p-2">
          <Tooltip
            placement="right"
            className="!p-0"
            sx={{ background: "background.secondary" }}
            title={
              <Box
                sx={{ bgcolor: "background.secondary" }}
                className="!max-h-32 !overflow-y-auto rounded"
              >
                <ReactJson
                  src={params.value}
                  theme={
                    localStorage.getItem(
                      LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
                    ) === "dark"
                      ? "google"
                      : "ashes"
                  }
                />
              </Box>
            }
          >
            <div className="!max-h-32 !overflow-hidden rounded">
              <ReactJson
                src={params.value}
                theme={
                  localStorage.getItem(
                    LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
                  ) === "dark"
                    ? "google"
                    : "ashes"
                }
              />
            </div>
          </Tooltip>
        </div>
      );

      break;
    default: {
      let value = params.value;
      if (isList) {
        value = JSON.stringify(params.value);
      }
      f = (
        <span className="!text-justify break-all text-ellipsis whitespace-pre-wrap">
          {JSON.stringify(value)}
        </span>
      );
      break;
    }
  }
  return f;
};

/**
 *
 * @param {String} type
 * @returns
 */
export const getFieldWidth = (type) => {
  let w = 300;
  switch (type) {
    case LOCAL_CONSTANTS.DATA_TYPES.STRING:
      w = 300;
      break;
    case LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN:
      w = 150;
      break;
    case LOCAL_CONSTANTS.DATA_TYPES.DATETIME:
      w = 250;
      break;
    case LOCAL_CONSTANTS.DATA_TYPES.INT:
      w = 150;
      break;
    case LOCAL_CONSTANTS.DATA_TYPES.JSON:
      w = 450;
      break;
    default:
      w = 300;
  }
  return w;
};

/**
 *
 * @param {object[]} columns
 * @returns
 */
export const getFormattedTableColumns = (columns, customIntMappings) => {
  try {
    return columns.map((column) => {
      return {
        field: column.name,
        name: column.name,
        key: column.name,
        sortable: false,
        headerName: String(column.name).toLocaleLowerCase(),
        type: LOCAL_CONSTANTS.DATA_TYPES.STRING.toLowerCase(),
        isList: column.isList,
        width: getFieldWidth(column.type),
        renderCell: (params) => {
          return getFieldFormatting({
            type: column.type,
            isID: column.isId,
            isList: column.isList,
            params,
            customIntMapping: customIntMappings?.[column.name],
          });
        },
        // valueGetter: (value) => {
        //   return getFieldValue(value, column.type).value;
        // },
      };
    });
  } catch (error) {}
};
