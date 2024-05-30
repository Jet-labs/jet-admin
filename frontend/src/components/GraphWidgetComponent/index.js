import { Grid, useTheme } from "@mui/material";
import React from "react";

import { LineGraphComponent } from "../LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { BarGraphComponent } from "../BarGraphComponent";
import { PieGraphComponent } from "../PieChartComponent";
import { DoughnutGraphComponent } from "../DoughnutChartComponent";
import { PolarAreaGraphComponent } from "../PolarAreaChartComponent";
import { RadarGraphComponent } from "../RadarChartComponent";
import { useQuery } from "@tanstack/react-query";
import { getGraphDataByIDAPI } from "../../api/graphs";

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
  const graphTitle = graphData?.title;
  const legendPosition = graphData?.graph_options.legend_position;
  const titleDisplayEnabled = graphData?.graph_options.title_display_enabled;
  const data = graphData?.dataset;
  console.log({ graphTitle });
  return (
    <Grid
      container
      className="rounded !p-3"
      style={{ background: theme.palette.action.selected }}
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
    </Grid>
  );
};
