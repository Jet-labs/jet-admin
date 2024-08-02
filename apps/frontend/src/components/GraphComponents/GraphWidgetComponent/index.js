import { useTheme } from "@mui/material";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getGraphDataByIDAPI } from "../../../api/graphs";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";

export const GraphWidgetComponent = ({ id, width, height }) => {
  const theme = useTheme();

  const {
    isLoading: isLoadingGraphData,
    data: graphData,
    error: loadGraphDataError,
    refetch: refetchGraphData,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`, id],
    queryFn: () => getGraphDataByIDAPI({ graphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });
  const graphType = graphData?.graph_options?.graph_type;
  const graphTitle = graphData?.graph_title;
  const legendPosition = graphData?.graph_options.legend_position;
  const titleDisplayEnabled = graphData?.graph_options.title_display_enabled;
  const data = graphData?.dataset;

  return (
    <div
      className="rounded"
      style={{
        background: theme.palette.background.default,
        // height: 400,
        width: width,
        height: height,
      }}
    >
      {GRAPH_PLUGINS_MAP[graphType]?.component({
        legendPosition,
        titleDisplayEnabled,
        graphTitle,
        data,
      })}
    </div>
  );
};
