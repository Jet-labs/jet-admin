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
    queryFn: () => getGraphByIDAPI({ pmGraphID: id }),
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
    queryFn: () => getGraphDataByIDAPI({ pmGraphID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
    refetchInterval: graph?.pm_graph_options?.refetch_interval * 1000,
  });
  const graphType = graphData?.pm_graph_options?.graph_type;
  const pmGraphTitle = graphData?.pm_graph_title;
  const legendPosition = graphData?.pm_graph_options.legend_position;
  const titleDisplayEnabled = graphData?.pm_graph_options.title_display_enabled;
  const data = graphData?.dataset;
  const refetchInterval = graph?.pm_graph_options?.refetch_interval * 1000;

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
        pmGraphTitle,
        data,
        refetchInterval,
      })}
    </div>
  );
};
