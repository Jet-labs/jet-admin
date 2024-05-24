import { AccessTime, Key } from "@mui/icons-material";
import { Chip, ListItem } from "@mui/material";

import moment from "moment";
import { LOCAL_CONSTANTS } from "../constants";
import { Model } from "../models/data/model";
import { jsonToReadable } from "./string";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
/**
 *
 * @param {String} tableName
 * @param {Model[]} dbModel
 * @returns
 */
export const getTableModelFromModel = (tableName, dbModel) =>
  dbModel.find((datamodel) => datamodel.name === tableName);

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
                icon={<CalendarMonthIcon />}
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
          icon={<CalendarMonthIcon />}
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
 * @param {Model[]} dbModel
 * @param {String} tableName
 * @returns
 */
export const getRequiredFields = (tableName, dbModel) => {
  try {
    const tableModel = getTableModelFromModel(tableName, dbModel);
    return tableModel.fields
      .filter((f) => f.isRequired && !f.relationName)
      .map((f) => f.name);
  } catch (error) {
    console.error(error);
  }
};

/**
 *
 * @param {object[]} dbModel
 * @param {String} tableName
 * @returns
 */
export const getAllTableFields = (dbModel, tableName) => {
  try {
    const tableModel = getTableModelFromModel(tableName, dbModel);
    return tableModel.fields.map((field) => {
      return {
        field: field.name,
        name: field.name,
        key: field.name,
        sortable: false,
        headerName: String(field.name).toLocaleLowerCase(),
        type: field.type,
        width: getFieldWidth(field.type),
        renderCell: (params) => {
          return getFieldFormatting({
            type: field.type,
            isID: field.isId,
            isList: field.isList,
            params,
          });
        },
      };
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 *
 * @param {Model[]} dbModel
 * @param {String} tableName
 * @param {String} field
 * @returns
 */
export const getFieldType = (dbModel, tableName, field) => {
  try {
    const tableModel = getTableModelFromModel(tableName, dbModel);
    const fieldModel = getFieldModelFromModel(field, tableModel);
    return fieldModel.type;
  } catch (error) {
    console.error(error);
  }
};

export const getRawQueryFromTextQuery = (dbModel, tableName, q) => {
  try {
    const tableModel = getTableModelFromModel(tableName, dbModel);

    const queries = [];
    tableModel.fields.forEach((field) => {
      if (field.type == LOCAL_CONSTANTS.DATA_TYPES.STRING) {
        queries.push({
          [field.name]: {
            contains: q,
            mode: "insensitive",
          },
        });
      }
    });

    return { OR: queries };
  } catch (error) {
    console.error(error);
  }
};

export const getRawQueryFromFilters = (
  dbModel,
  tableName,
  filters,
  combinator
) => {
  try {
    const tableModel = getTableModelFromModel(tableName, dbModel);
    const queries = [];
    filters.map((filter) => {
      let query = {};
      let o = {};
      o[filter.operator] = filter.value;
      const fieldModel = getFieldModelFromModel(filter.field, tableModel);
      if (fieldModel.type == LOCAL_CONSTANTS.DATA_TYPES.STRING) {
        o["mode"] = "insensitive";
      }
      query[filter.field] = o;
      queries.push({ ...query });
    });
    const fq = {};
    fq[combinator] = [...queries];
    return fq;
  } catch (error) {
    console.error(error);
    return null;
  }
};
