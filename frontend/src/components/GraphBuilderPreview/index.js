import { Grid, useTheme } from "@mui/material";
import React from "react";

import { LineGraphComponent } from "../graphs/LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { BarGraphComponent } from "../graphs/BarGraphComponent";
import { PieGraphComponent } from "../graphs/PieChartComponent";
import { DoughnutGraphComponent } from "../graphs/DoughnutChartComponent";
import { PolarAreaGraphComponent } from "../graphs/PolarAreaChartComponent";
import { RadarGraphComponent } from "../graphs/RadarChartComponent";

export const GraphBuilderPreview = ({
  graphType,
  legendPosition,
  titleDisplayEnabled,
  graphTitle,
  data,
}) => {
  const theme = useTheme();
  return (
    <div className="!pt-10  !sticky !top-0 !z-50">
      <Grid
        container
        rowSpacing={2}
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
    </div>
  );
};
