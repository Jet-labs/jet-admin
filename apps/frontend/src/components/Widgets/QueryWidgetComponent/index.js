import { Box, Divider, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getGraphDataByIDAPI } from "../../../api/graphs";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";
import {
  getQueryByIDAPI,
  runQueryAPI,
  runQueryByIDAPI,
} from "../../../api/queries";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";
import jsonSchemaGenerator from "to-json-schema";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../contexts/themeContext";
import { capitalize } from "@rigu/js-toolkit";
import { SimpleTableComponent } from "../SimpleTableComponent";
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
  const {
    isPending: isFetchingQuery,
    isLoading: isFetchingQuerySuccess,
    isError: isFetchingQueryError,
    error: fetchQueryError,
    data: query,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_QUERIES`, id],
    queryFn: () => {
      return getQueryByIDAPI({
        pmQueryID: id,
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
      <div
        style={{ height: 30 }}
        className="flex flex-row justify-start items-center w-full px-1"
      >
        <span className="!text-sm !font-semibold">{query?.pm_query_title}</span>
      </div>
      <Divider />

      <SimpleTableComponent
        data={queryData}
        border={false}
        height={height - 31}
      />
    </div>
  );
};
