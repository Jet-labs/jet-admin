import { Divider, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import { capitalize } from "@rigu/js-toolkit";
import { useQuery } from "@tanstack/react-query";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { getQueryByIDAPI, runQueryByIDAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useThemeValue } from "../../../contexts/themeContext";
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
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERY_RESULT, id],
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
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES, id],
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
