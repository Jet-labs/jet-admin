import { useTheme } from "@mui/material";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getGraphByIDAPI, getGraphDataByIDAPI } from "../../../api/graphs";
import { GRAPH_PLUGINS_MAP } from "../../GraphComponents/GraphTypes";


export const GraphWidgetComponent = ({ id, width, height }) => {
  const theme = useTheme();

  const {
    isLoading: isLoadingGraph,
    data: graph,
    error: loadGraphError,
    refetch: refetchGraph,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`, id],
    queryFn: () => getGraphByIDAPI({ graphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingGraphData,
    data: graphData,
    error: loadGraphDataError,
    refetch: refetchGraphData,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH_DATA`, id],
    queryFn: () => getGraphDataByIDAPI({ graphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
    refetchInterval: graph?.graph_options?.refetch_interval * 1000,
  });
  const graphType = graphData?.graph_options?.graph_type;
  const graphTitle = graphData?.graph_title;
  const legendPosition = graphData?.graph_options.legend_position;
  const titleDisplayEnabled = graphData?.graph_options.title_display_enabled;
  const data = graphData?.dataset;
  const refetchInterval = graph?.graph_options?.refetch_interval * 1000;

  return (
    <div
      className="rounded !p-4"
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
        refetchInterval,
      })}
    </div>
  );
};
