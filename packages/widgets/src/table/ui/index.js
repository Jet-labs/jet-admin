import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

/**
 * Generates a basic JSON Schema Draft 7 structure from a JavaScript value.
 *
 * Note: This is a simple inference based on a single data point.
 * It does not handle complex cases like mixed array types, required fields
 * inference beyond just present keys, or specific number types (integer vs float).
 *
 * @param {*} data - The JavaScript value to infer the schema from.
 * @returns {object} A JSON Schema object.
 */
function jsonSchemaGenerator(data) {
  // Handle null or undefined
  if (data === null || data === undefined) {
    // According to JSON Schema, null is a valid type.
    // We could also return {}, indicating an unknown type.
    return { type: "null" };
  }

  const dataType = typeof data;

  // Handle primitive types
  if (dataType === "string") {
    return { type: "string" };
  } else if (dataType === "number") {
    // A simple generator might not distinguish between integer and float.
    // We'll just use 'number'.
    // You could add logic here if needed, e.g., Number.isInteger(data) ? 'integer' : 'number'.
    return { type: "number" };
  } else if (dataType === "boolean") {
    return { type: "boolean" };
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // If the array has elements, infer the schema from the first element.
    // This aligns with the typical use case of generating columns from tabular data.
    if (data.length > 0) {
      // Recursively generate schema for items
      const itemSchema = jsonSchemaGenerator(data[0]);
      return {
        type: "array",
        items: itemSchema,
        // Optionally, specify minItems or maxItems if known, but not typically inferred.
      };
    } else {
      // Empty array - we can't infer the type of items.
      // Returning an array type without 'items' is valid JSON Schema,
      // meaning an array of any type is allowed.
      return {
        type: "array",
        // items: {} // Could explicitly allow any type using an empty schema
      };
    }
  }

  // Handle objects
  if (dataType === "object") {
    const properties = {};

    for (const key in data) {
      // Ensure we only process own properties, not inherited ones
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Recursively generate schema for each property value
        properties[key] = jsonSchemaGenerator(data[key]);
        // If you needed to mark all properties found as required:
        // required.push(key);
      }
    }

    const schema = {
      type: "object",
      properties: properties,
      // Additional properties are allowed by default. If you wanted to disallow unknown properties:
      // additionalProperties: false,
    };

    return schema;
  }

  // Handle other unexpected types (functions, symbols, etc.)
  // Return a generic or unknown schema type
  console.warn(
    `jsonSchemaGenerator encountered unexpected data type: ${dataType}`
  );
  return {}; // Return an empty schema or { type: 'unknown' } if preferred
}

export const TableWidgetComponent = ({ data, onWidgetInit, widgetConfig }) => {
  TableWidgetComponent.propTypes = {
    data: PropTypes.object,
    onWidgetInit: PropTypes.func,
    widgetConfig: PropTypes.object,
  };

  // The data structure seems to be an array containing another array.
  // We assume the actual rows are in data[0]
  const firstData =
    data && Array.isArray(data) && data.length > 0 && Array.isArray(data[0])
      ? data[0].map((item, index) => ({ ...item, _g_uuid: `row_${index}` }))
      : null;

  const widgetRef = useRef(null);

  const dataSchema = useMemo(() => {
    // Generate schema from the first row of the actual data array
    if (firstData && firstData.length > 0) {
      return jsonSchemaGenerator(firstData[0]);
    }
    return {};
  }, [firstData]);

  // Adapt column definitions for @mui/x-data-grid
  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return {
          field: key, // Use 'field' for mui-x-data-grid
          headerName: key,
          flex: 1,
          minWidth: 150,
          renderCell: (params) => {
            return (
              <div className="text-sm whitespace-pre-wrap py-2">
                {/* Safely access value and handle null/undefined */}
                {params.value !== null && params.value !== undefined
                  ? params.value.toString()
                  : "-"}
              </div>
            );
          },
        };
      });
    }
    return []; // Return empty array if no schema or properties to avoid grid rendering issues
  }, [dataSchema]);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Update totalPages calculation based on firstData length
  const rowCount = firstData?.length || 0;
  const totalPages = Math.ceil(rowCount / paginationModel.pageSize);

  const CustomFooter = () => {
    // This component will be rendered *outside* the DataGrid's internal scroll area now
    return (
      <div className="cancelSelectorName flex items-center gap-2 p-2 border-t border-gray-200">
        <button
          className="p-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          disabled={paginationModel.page === 0}
        >
          <BiChevronLeft className="text-lg" />
        </button>
        <span className="text-xs text-gray-600">
          Page {paginationModel.page + 1} of {totalPages}
        </span>
        <button
          className="p-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          // Disable next button if on the last page (or no data)
          disabled={paginationModel.page >= totalPages - 1 || totalPages === 0}
        >
          <BiChevronRight className="text-lg" />
        </button>
        <select
          className="p-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          value={paginationModel.pageSize}
          onChange={(e) =>
            setPaginationModel({
              page: 0,
              pageSize: Number(e.target.value),
            })
          }
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-600">{rowCount} total rows</span>
      </div>
    );
  };

  useEffect(() => {
    if (widgetRef.current) {
      onWidgetInit?.(widgetRef);
    }
  }, [onWidgetInit]);

  // Check if data is still loading or empty before rendering
  const isLoading = !data; // Example: Assume data being null/undefined means loading
  const hasData = firstData && firstData.length > 0 && columns.length > 0;
  const {
    widgetTailwindCss = "",
    containerTailwindCss = "",
    titleEnabled,
    titleTailwindCss = "",
    title,
  } = widgetConfig;

  return (
    // Added flex and flex-col to make this a flex container stacking children vertically
    <div
      className={`rounded bg-white w-full h-full flex flex-col ${containerTailwindCss}`}
      ref={widgetRef}
    >
      {titleEnabled && (
        // Title section - takes its natural height
        <div className="px-3 py-2 min-h-[100px] flex items-center border-b border-gray-200">
          <h2 className={`truncate line-clamp-2 ${titleTailwindCss}`}>
            {title || "Untitled Query"}
          </h2>
        </div>
      )}

      {/*
        This container holds either the DataGrid or the "No data" message.
        It uses flex-1 to take up all available space between the title and footer.
        The DataGrid inside it will then scroll internally because its height is constrained.
      */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center p-3">
            <div className="text-[#646cff] text-sm">Loading...</div>
          </div>
        ) : !hasData ? ( // Conditionally render "No data" message
          <div className="h-full w-full flex items-center justify-center p-3">
            <div className="bg-transparent text-[#646cff] px-4 py-2 rounded z-0 text-sm">
              No data available for this query or column schema could not be
              generated.
            </div>
          </div>
        ) : (
          // DataGrid component - takes up the height of its flex-1 parent
          <DataGrid
            rows={firstData}
            getRowId={(row) => row._g_uuid} // Important for performance and selection
            columns={columns}
            // Manage pagination state outside the DataGrid for the custom footer
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            // ADD THIS PROP TO HIDE THE ENTIRE BUILT-IN FOOTER AREA
            hideFooter={true}
            // hideFooterPagination // This is redundant if hideFooter is true, but doesn't hurt
            slots={{
              // Keep the noRowsOverlay slot if you want a custom message when grid is filtered to empty
              noRowsOverlay: () => (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md">
                    No results found
                  </div>
                </div>
              ),
              // footer: CustomFooter, // REMOVED: Custom footer is now outside
            }}
            defaultColumnOptions={{
              sortable: true,
              resizable: true, // Assuming you want resizable columns
            }}
            className={widgetTailwindCss}
            sx={{
              border: "none", // Remove default border
              "& .MuiDataGrid-main": {
                // Target the main grid area to potentially adjust layout if needed
                // min-height: 0; // Sometimes needed in flex containers
              },
              "& .MuiDataGrid-virtualScroller": {
                // This is the scrollable area for rows.
                // Ensure it takes full height minus header height.
                // mui-x-data-grid usually handles this internally with height: 100%
              },
              "& .MuiDataGrid-columnHeaders": {
                // These styles should already make headers look non-scrolling with the rows
                bgcolor: "transparent",
                // borderBottom: "1px solid #e5e7eb", // Keep border if needed
              },
              "& .MuiDataGrid-cell": {
                py: 1,
                fontSize: "0.875rem",
                // Ensure cell content doesn't overflow its bounds before wrapping
                overflow: "hidden",
                textOverflow: "ellipsis", // Add ellipsis for truncated text if not wrapping
                // wordBreak: 'break-word', // Consider if you need word breaking
              },
              // Set height to 100% to fill the flex-1 parent container
              height: "100%",
              width: "100%", // Ensure it takes full width
            }}
          />
        )}
      </div>

      {/* Custom Footer section - sits at the bottom, takes its natural height */}
      {/* Only render the footer if there is data to show */}
      {hasData && <CustomFooter />}
    </div>
  );
};
