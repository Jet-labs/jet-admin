import { BiCalendar, BiLink, BiUnlink } from "react-icons/bi";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { Box, InputBase, MenuItem, Select } from "@mui/material"; // Import necessary MUI components
import moment from "moment";
import React, { useCallback, useState } from "react";
import ReactJson from "react-json-view";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { DatabaseTableColumn } from "../../../data/models/databaseTableColumn";
import { PostgreSQLUtils } from "../../../utils/postgre";
import { EditCellWrapper } from "../ui/editCellWrapper";
import { DatabaseTableGridJSONEditor } from "./databaseTableGridJSONEditor";


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
  type,
  isList,
  params,
  customIntMapping,
  foreignKeyReference, // Indicates if the field is part of a foreign key
}) => {
  const uniqueKey = `databaseTableGridFormatter_${params.id}_${params.field}`;
  const cellValue = params.value;
  const convertedType = CONSTANTS.POSTGRE_SQL_DATA_TYPES[type]?.js_type;
  const commonTextStyle =
    "text-justify break-all overflow-hidden text-ellipsis whitespace-pre-wrap h-full flex items-center";
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
            key={`foreignKeyIndicator_${uniqueKey}`}
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
        boolValue
          ? "bg-green-100 text-green-800 w-full flex  flex-row justify-start items-center p-2"
          : "bg-red-100 text-red-800 w-full flex  flex-row justify-start items-center p-2"
      }`;
      return isList ? (
        <div className="space-y-1 w-full flex h-full flex-row justify-start items-center">
          {cellValue?.map((value, index) => (
            <div key={index} className={boolStyle}>
              {foreignKeyReference
                ? renderForeignKeyIndicator(String(Boolean(value)))
                : String(Boolean(value))}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={"w-full flex h-full flex-row justify-start items-center"}
        >
          {foreignKeyReference ? (
            renderForeignKeyIndicator(String(boolValue))
          ) : (
            <span className={boolStyle}>{String(boolValue)}</span>
          )}
        </div>
      );
    }

    case CONSTANTS.JS_DATA_TYPES.DATE:
      return (
        <div className="space-x-2 w-fit flex h-full flex-row justify-start items-center">
          <BiCalendar className="text-[#646cff] flex-shrink-0" />
          <span className={commonTextStyle}>
            {cellValue
              ? foreignKeyReference
                ? renderForeignKeyIndicator(
                    moment(cellValue).toDate().toISOString()
                  )
                : moment(cellValue).toDate().toISOString()
              : ""}
          </span>
        </div>
      );

    case CONSTANTS.JS_DATA_TYPES.NUMBER: {
      const renderValue = (value) => (
        <div className="w-fit flex h-full flex-row justify-start items-center">
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
              key={`reactJson_${uniqueKey}`}
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
        <span className={commonTextStyle}>{JSON.stringify(cellValue)}</span>
      );
  }
};

/**
 * Component rendered inside the cell during JSON edit mode. Manages the popup.
 */
const JsonEditCell = ({ params }) => {
  JsonEditCell.propTypes = {
    params: PropTypes.object.isRequired,
  };
  const [isPopupOpen, setIsPopupOpen] = useState(true); // Start open when edit begins

  // Callback when Save is clicked in the popup
  const handleSave = useCallback(
    (newValue) => {
      params.api.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue,
      });
      params.api.stopCellEditMode({ id: params.id, field: params.field }); // Stop editing, saving the value
      setIsPopupOpen(false); // Close popup
    },
    [params.api, params.id, params.field]
  );

  // Callback when Cancel is clicked in the popup or dialog is closed
  const handleCancel = useCallback(() => {
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: true,
    }); // Stop editing, discard changes
    setIsPopupOpen(false); // Close popup
  }, [params.api, params.id, params.field]);

  // Render the popup
  return (
    <>
      {/* Optional: Render something minimal in the cell itself while popup is open */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          pl: 1,
          fontStyle: "italic",
          color: "grey",
        }}
      >
        Editing JSON...
      </Box>
      <DatabaseTableGridJSONEditor
        title={`Edit "${params.field}"`}
        open={isPopupOpen}
        value={params.value} // Pass the value from the grid (processed by valueGetter)
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
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
export const getFormattedTableColumns = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableColumns,
  customIntMappings,
  databaseTableColumnForeignKeyMap,
}) => {
  try {
    // Map over the raw column metadata
    return databaseTableColumns.map((column) => {
      // Determine the JS type equivalent for the PostgreSQL type
      const convertedType =
        CONSTANTS.POSTGRE_SQL_DATA_TYPES[column.databaseTableColumnType]
          ?.js_type || "string"; // Default to string if type not found

      // Check if this column has a foreign key reference
      const foreignKeyReference =
        databaseTableColumnForeignKeyMap?.get(column.databaseTableColumnName)
          ?.length > 0
          ? databaseTableColumnForeignKeyMap?.get(
              column.databaseTableColumnName
            )
          : null;

      // Base column definition
      const columnDef = {
        field: column.databaseTableColumnName,
        sortable: true,
        headerName: String(column.databaseTableColumnName), // Header text
        headerAlign: "left",
        type: convertedType, // Inform DataGrid about the data type
        editable: !column.isID && !column.isList, // Make non-ID and non-list columns editable
        dbType: column.databaseTableColumnType, // Store original DB type if needed later
        isList: column.isList, // Store list information
        width: getFieldWidth(column.databaseTableColumnType), // Calculate width
        foreignKeyReference, // Store foreign key info if needed by renderCell

        // --- Value Getter ---
        // Ensures the grid receives the correct data type (e.g., Date object for 'date' type)
        // especially if the raw data is a string.
        valueGetter: (value) => {
          // If the column type is date or datetime, ensure a Date object or null is returned
          if (convertedType === "date" || convertedType === "datetime") {
            if (value && !(value instanceof Date)) {
              try {
                const dateObj = new Date(value);
                // Check if the parsed date is valid before returning
                return !isNaN(dateObj.getTime()) ? dateObj : null;
              } catch (e) {
                console.error(
                  `Error parsing value in valueGetter for field ${column.databaseTableColumnName}:`,
                  value,
                  e
                );
                return null; // Return null if parsing fails
              }
            }
            // Return the value if it's already a Date, or null/undefined as is
            return value instanceof Date ? value : null;
          }
          // For other types, return the value directly
          return value;
        },

        // --- Cell Renderer (Read Mode) ---
        renderCell: (params) => {
          // Delegate formatting to a helper function
          // Ensure params.value passed here is potentially transformed by valueGetter
          return getFieldFormatting({
            tenantID,
            databaseSchemaName,
            databaseTableName,
            type: column.databaseTableColumnType,
            isID: column.isID,
            isList: column.isList,
            params, // Pass the full params object
            customIntMapping:
              customIntMappings?.[column.databaseTableColumnName],
            foreignKeyReference,
          });
        },

        // --- Edit Cell Renderer (Edit Mode) ---
        renderEditCell: (params) => {
          // Skip rendering an editor for list types as requested
          if (column.isList) {
            return (
              <span
                style={{
                  paddingLeft: "10px",
                  fontStyle: "italic",
                  color: "grey",
                }}
              >
                Cannot edit lists directly
              </span>
            );
          }
          // Skip rendering editor for non-editable cells (redundant check, but safe)
          if (!params.colDef.editable) {
            // Render read-only view if needed, or let grid handle it
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
          }

          // --- Handlers specific to the editing component ---

          // Generic handler for text, number, json inputs
          const handleChange = (event) => {
            let value = event.target.value;
            // Basic type coercion based on the column's expected JS type
            if (convertedType === "number") {
              value = event.target.value === "" ? null : Number(value); // Handle empty string as null for numbers
              if (value !== null && isNaN(value)) value = null; // Handle invalid number input -> null
            }
            // Update the grid's internal edit state immediately.
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: value,
              debounceMs: 200,
            }); // Add debounce
          };

          // Handler for Date input
          const handleDateChange = (event) => {
            const stringValue = event.target.value;
            let dateValue = null;
            if (stringValue) {
              try {
                // For type="date", the string is 'YYYY-MM-DD'. Parse it correctly.
                // Adding time prevents potential timezone shifts away from the intended date.
                dateValue = new Date(`${stringValue}T00:00:00`);
                if (isNaN(dateValue.getTime())) {
                  // Check if parsing was successful
                  dateValue = null;
                }
              } catch (e) {
                console.error("Error parsing date string:", e);
                dateValue = null; // Set to null if parsing fails
              }
            }
            // Pass the Date object or null to the grid
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: dateValue,
            });
          };

          // Handler for DateTime input
          const handleDateTimeChange = (event) => {
            const stringValue = event.target.value;
            let dateTimeValue = null;
            if (stringValue) {
              try {
                // For type="datetime-local", the string is 'YYYY-MM-DDTHH:mm'.
                dateTimeValue = new Date(stringValue);
                if (isNaN(dateTimeValue.getTime())) {
                  // Check if parsing was successful
                  dateTimeValue = null;
                }
              } catch (e) {
                console.error("Error parsing datetime string:", e);
                dateTimeValue = null; // Set to null if parsing fails
              }
            }
            // Pass the Date object or null to the grid
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: dateTimeValue,
            });
          };

          // Handler specifically for boolean Select component
          const handleSelectChange = (event) => {
            let value = event.target.value;
            if (value === "true") value = true;
            else if (value === "false") value = false;
            else value = null; // Assume any other value means null (if nullable)
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: value,
            });
          };

          // --- Determine the editor component based on type ---
          let editor;
          // Common props for InputBase components (excluding onChange which varies)
          // Use params.value which might have been processed by valueGetter to be a Date object
          const initialValue = params.value;
          const commonInputProps = {
            // value: initialValue ?? '', // This won't work directly for Date objects in input defaultValue
            autoFocus: true, // Focus the input when editing starts
            fullWidth: true, // Make input take available width
            sx: {
              // Styling for the input within the cell
              height: "100%",
              boxSizing: "border-box",
              padding: "0 8px", // Add some horizontal padding
              fontSize: "inherit", // Inherit font size from cell
              border: "none", // Remove default borders
              "& .MuiInputBase-input": {
                // Target the actual input element
                padding: 0, // Remove default input padding
                height: "100%",
                boxSizing: "border-box",
              },
              "&.Mui-focused": {
                // Optional: remove outline on focus if desired
                // outline: 'none',
                // boxShadow: 'none',
              },
            },
          };

          // Switch based on the determined JS type
          switch (convertedType) {
            case "number":
              // Use 'value' prop for controlled number input if needed, or defaultValue
              editor = (
                <InputBase
                  {...commonInputProps}
                  type="number"
                  defaultValue={initialValue ?? ""}
                  onChange={handleChange}
                />
              );
              break;

            case "boolean":
              // Using Select for boolean: true, false, (optional: null)
              editor = (
                <Select
                  // Use initialValue directly for boolean comparison
                  value={
                    initialValue === null || initialValue === undefined
                      ? "null"
                      : String(initialValue)
                  }
                  onChange={handleSelectChange}
                  autoFocus
                  fullWidth
                  variant="standard" // Simplest variant, looks clean in a cell
                  disableUnderline // Remove the underline for cleaner look
                  sx={{
                    height: "100%",
                    boxSizing: "border-box",
                    fontSize: "inherit",
                    // Target the displayed value element for alignment and padding
                    "& .MuiSelect-select": {
                      height: "100% !important", // Ensure it takes full height
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "8px",
                      paddingRight: "8px !important", // Override default padding
                      paddingTop: "0",
                      paddingBottom: "0",
                      boxSizing: "border-box",
                    },
                    // Remove default icon padding if needed
                    "& .MuiSelect-icon": {
                      right: 0,
                    },
                  }}
                >
                  {/* Provide options for boolean values */}
                  <MenuItem value="true" sx={{ fontSize: "inherit" }}>
                    true
                  </MenuItem>
                  <MenuItem value="false" sx={{ fontSize: "inherit" }}>
                    false
                  </MenuItem>
                  {/* Add option for null ONLY if the column is nullable in the DB */}
                  {/* {column.isNullable && <MenuItem value="null" sx={{ fontSize: 'inherit' }}>(null)</MenuItem>} */}
                </Select>
              );
              break;

            case "date": {
              // Format Date object from initialValue (processed by valueGetter) for input type="date"
              let dateValueStr = "";
              try {
                // initialValue should be a Date object here thanks to valueGetter
                if (
                  initialValue instanceof Date &&
                  !isNaN(initialValue.getTime())
                ) {
                  dateValueStr = initialValue.toISOString().split("T")[0];
                }
              } catch (e) {
                console.error("Error formatting date for input:", e);
              }
              // Use defaultValue for uncontrolled input, pass specific handler
              editor = (
                <InputBase
                  {...commonInputProps}
                  type="date"
                  defaultValue={dateValueStr}
                  onChange={handleDateChange}
                />
              );
              break;
            }

            case "datetime": {
              // Format Date object from initialValue (processed by valueGetter) for input type="datetime-local"
              let dateTimeValueStr = "";
              try {
                // initialValue should be a Date object here
                if (
                  initialValue instanceof Date &&
                  !isNaN(initialValue.getTime())
                ) {
                  // Convert to local time string suitable for datetime-local
                  const tzoffset = initialValue.getTimezoneOffset() * 60000; //offset in milliseconds
                  const localISOTime = new Date(
                    initialValue.getTime() - tzoffset
                  )
                    .toISOString()
                    .slice(0, 16);
                  dateTimeValueStr = localISOTime;
                }
              } catch (e) {
                console.error("Error formatting datetime for input:", e);
              }
              // Use defaultValue for uncontrolled input, pass specific handler
              editor = (
                <InputBase
                  {...commonInputProps}
                  type="datetime-local"
                  defaultValue={dateTimeValueStr}
                  onChange={handleDateTimeChange}
                />
              );
              break;
            }

            case "object":
              // Display JSON as a string in a multiline input (textarea)
              // initialValue should be an object/array here thanks to valueGetter (if it was a valid string initially)
              editor = <JsonEditCell params={params} />;
              break;

            case "string":
            default: // Default to text input for strings or unknown types
              // Use defaultValue for uncontrolled input
              editor = (
                <InputBase
                  {...commonInputProps}
                  type="text"
                  defaultValue={initialValue ?? ""}
                  onChange={handleChange}
                />
              );
              break;
          }

          // Wrap the determined editor component with the cancel button logic
          return <EditCellWrapper params={params}>{editor}</EditCellWrapper>;
        },
      };

      return columnDef; // Return the complete column definition
    });
  } catch (error) {
    console.error("Error encountered in getFormattedTableColumns:", error);
    return []; // Return empty array on error to prevent grid crash
  }
};
