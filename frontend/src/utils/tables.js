import { Chip, ListItem } from "@mui/material";

import { BiCalendar } from "react-icons/bi";
import { LOCAL_CONSTANTS } from "../constants";
import { Model } from "../models/data/model";
import { jsonToReadable } from "./string";

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
  if (prismaModel.primaryKey && prismaModel.primaryKey.fields?.length > 0) {
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

export const getFieldFormatting = ({ type, isList, isID, params }) => {
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
          variant="outlined"
          color={"secondary"}
          icon={<BiCalendar className="!text-sm" />}
          sx={{
            borderRadius: 1,
          }}
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
        params.value.map((data) => {
          return (
            <ListItem key={data}>
              <Chip
                label={`${data}`}
                size="small"
                variant="outlined"
                color={"info"}
              />
            </ListItem>
          );
        })
      ) : (
        <Chip
          label={`${params.value}`}
          size="small"
          variant="outlined"
          color={"info"}
          sx={{
            borderRadius: 1,
          }}
        />
      );
      break;
    }
    // if (appConstants.CUSTOM_INT_MAPPINGS[tableName]?.[params.field]) {
    //   f = (
    //     <Chip
    //       sx={{
    //         backgroundColor: appConstants.CUSTOM_INT_COLOR_MAPPINGS[
    //           tableName
    //         ]?.[params.field]?.[params.value]
    //           ? `${
    //               appConstants.CUSTOM_INT_COLOR_MAPPINGS[tableName][
    //                 params.field
    //               ][params.value]
    //             }`
    //           : "#62ff00",
    //       }}
    //       className={"!lowercase !text-black !font-bold"}
    //       label={`${
    //         appConstants.CUSTOM_INT_MAPPINGS[tableName][params.field][
    //           params.value
    //         ]
    //       }`}
    //       size="small"
    //     ></Chip>
    //   );
    // } else {
    //   f = params.value;
    // }

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
      var m = params.value ? jsonToReadable(params.value) : null;
      f = m ? (
        <div className="h-auto p-2">
          <ul>
            {m.map((k) => {
              return <li>{k}</li>;
            })}
          </ul>
        </div>
      ) : null;

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
export const getFormattedTableColumns = (columns) => {
  try {
    return columns.map((column) => {
      return {
        field: column.name,
        name: column.name,
        key: column.name,
        sortable: false,
        headerName: String(column.name).toLocaleLowerCase(),
        type: column.type,
        width: getFieldWidth(column.type),
        renderCell: (params) => {
          return getFieldFormatting({
            type: column.type,
            isID: column.isId,
            isList: column.isList,
            params,
          });
        },
      };
    });
  } catch (error) {
    console.error(error);
  }
};

