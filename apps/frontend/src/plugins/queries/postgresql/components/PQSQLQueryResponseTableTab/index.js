import { Box, useTheme } from "@mui/material";
import { capitalize } from "@rigu/js-toolkit";
import React, { useMemo } from "react";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";

export const PGSQLQueryResponseTableTab = ({ json, dataSchema }) => {
  const theme = useTheme();

  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return { key, name: capitalize(key) };
      });
    }
  }, [dataSchema]);

  return (
    <Box
      sx={{ width: "100%" }}
      className="!flex !flex-col !justify-center !items-stretch"
    >
      {json && Array.isArray(json) && json.length ? (
        <DataGrid
          rows={json.map((item, index) => {
            return { _g_uuid: `_index_${index}`, ...item };
          })}
          columns={columns}
          className="!w-100 rdg-light !rounded"
          style={{ borderColor: theme.palette.divider, borderWidth: 1 }}
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
