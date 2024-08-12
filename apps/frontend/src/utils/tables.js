import { Box, Chip, List, ListItem, Paper, Tooltip } from "@mui/material";

import { BiCalendar } from "react-icons/bi";
import { LOCAL_CONSTANTS } from "../constants";
import { Model } from "../models/data/model";
import { jsonToReadable } from "./string";
import ReactJson from "react-json-view";
/**
 *
 * @param {String} field
 * @param {Model} tableModel
 * @returns
 */
export const getFieldModelFromModel = (field, tableModel) =>
  tableModel.fields.find((fieldModel) => fieldModel.name === field);

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

export const getFieldFormatting = ({
  type,
  isList,
  isID,
  params,
  customIntMapping,
}) => {
  let f = params.value;

  switch (type) {
    case LOCAL_CONSTANTS.DATA_TYPES.STRING:
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
    case LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN: {
      let value = params.value;
      if (isList) {
        value = JSON.stringify(params.value);
      }
      f = isList ? (
        params.value.map((data) => {
          return (
            <ListItem key={data}>
              <Chip
                label={`${Boolean(data)}`}
                size="small"
                variant="outlined"
                color={Boolean(data) ? "success" : "error"}
              />
            </ListItem>
          );
        })
      ) : (
        <Chip
          label={`${Boolean(params.value)}`}
          size="small"
          variant="outlined"
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
                label={`${data}`}
                size="small"
                variant="outlined"
                color={"secondary"}
                sx={{
                  borderRadius: 1,
                }}
                icon={<BiCalendar className="!text-sm" />}
              />
            </ListItem>
          );
        });
      }
      f = (
        <Chip
          label={`${params.value}`}
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
                <Chip
                  label={`${_d}`}
                  size="small"
                  variant="filled"
                  className={_class}
                  sx={{
                    maxHeight: null,
                  }}
                />
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
          return (
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
  console.log({ customIntMappings });
  try {
    return columns.map((column) => {
      return {
        field: column.name,
        name: column.name,
        key: column.name,
        sortable: false,
        headerName: String(column.name).toLocaleLowerCase(),
        type: column.type,
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
      };
    });
  } catch (error) {
    console.error(error);
  }
};
