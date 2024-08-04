import { Box, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import jsonSchemaGenerator from "to-json-schema";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../contexts/themeContext";
import { capitalize } from "@rigu/js-toolkit";
export const SimpleTableComponent = ({
  data,
  border = true,
  className,
  height = "100%",
  width = "100%",
}) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();

  const dataSchema = data
    ? jsonSchemaGenerator(Array.isArray(data) ? data[0] : data)
    : {};
  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return { key, name: capitalize(key) };
      });
    }
  }, [dataSchema]);

  return (
    <Box
      sx={{ width, height }}
      className={`!flex !flex-col !justify-start !items-stretch ${className}`}
    >
      {data && Array.isArray(data) && data.length ? (
        <DataGrid
          rows={data.map((item, index) => {
            return { _g_uuid: `_index_${index}`, ...item };
          })}
          columns={columns}
          className={`!w-100 !rounded ${
            themeType === "dark" ? "" : "rdg-light "
          }`}
          style={{
            borderColor: theme.palette.divider,
            borderWidth: border ? 1 : 0,
          }}
          rowKeyGetter={(row) => row._g_uuid}
          defaultColumnOptions={{
            sortable: false,
            resizable: true,
          }}
        />
      ) : (
        <div
          className="!h-32 flex !flex-col !justify-center !items-center w-100 "
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: theme.palette.divider,
            borderRadius: 4,
          }}
        >
          <span>No data</span>
        </div>
      )}
    </Box>
  );
};
