import { Grid, IconButton, useTheme } from "@mui/material";
import React from "react";

import { LineGraphComponent } from "../graphs/LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { BarGraphComponent } from "../graphs/BarGraphComponent";
import { PieGraphComponent } from "../graphs/PieChartComponent";
import { DoughnutGraphComponent } from "../graphs/DoughnutChartComponent";
import { PolarAreaGraphComponent } from "../graphs/PolarAreaChartComponent";
import { RadarGraphComponent } from "../graphs/RadarChartComponent";
import { useQuery } from "@tanstack/react-query";
import { getGraphDataByIDAPI } from "../../api/graphs";
import { Delete } from "@mui/icons-material";

export const GraphWidgetComponent = ({ id }) => {
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
  const graphType = graphData?.graph_options.graph_type;
  const graphTitle = graphData?.graph_title;
  const legendPosition = graphData?.graph_options.legend_position;
  const titleDisplayEnabled = graphData?.graph_options.title_display_enabled;
  const data = graphData?.dataset;

  return (
    <div
      className="rounded !p-3 !w-full"
      style={{
        background: theme.palette.action.selected,
        height: 400,
      }}
    >
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.LINE.value && (
        <LineGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value && (
        <BarGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.PIE.value && (
        <PieGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.DOUGHNUT.value && (
        <DoughnutGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.POLAR_AREA.value && (
        <PolarAreaGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
      {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.RADAR.value && (
        <RadarGraphComponent
          legendPosition={legendPosition}
          titleDisplayEnabled={titleDisplayEnabled}
          graphTitle={graphTitle}
          data={data}
        />
      )}
    </div>
  );
};
