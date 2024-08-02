import { Box, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getGraphDataByIDAPI } from "../../../api/graphs";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";
import { runQueryAPI, runQueryByIDAPI } from "../../../api/queries";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";
import jsonSchemaGenerator from "to-json-schema";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../contexts/themeContext";
import { capitalize } from "@rigu/js-toolkit";
export const QueryWidgetComponent = ({ id, width, height }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  const {
    isPending: isRunningQuery,
    isLoading: isRunningQuerySuccess,
    isError: isRunningQueryError,
    error: runQueryError,
    data: queryData,
    refetch: refetchQueryData,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_QUERIES_RESULT`, id],
    queryFn: () => {
      return runQueryByIDAPI({
        pm_query_id: id,
      });
    },
    retry: false,
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  const dataSchema = queryData
    ? jsonSchemaGenerator(Array.isArray(queryData) ? queryData[0] : queryData)
    : {};
  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return { key, name: capitalize(key) };
      });
    }
  }, [dataSchema]);

  return (
    <div
      className="rounded"
      style={{
        background: theme.palette.background.default,
        width: width,
        height: height,
      }}
    >
      <Box
        sx={{ width: "100%" }}
        className="!flex !flex-col !h-full !w-full !justify-center !items-stretch"
      >
        {queryData && Array.isArray(queryData) && queryData.length ? (
          <DataGrid
            rows={queryData.map((item, index) => {
              return { _g_uuid: `_index_${index}`, ...item };
            })}
            columns={columns}
            className={`!w-100 !rounded ${
              themeType === "dark" ? "" : "rdg-light "
            }`}
            // style={{ borderColor: theme.palette.divider, borderWidth: 1 }}
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
    </div>
  );
};
