import { Grid, useTheme } from "@mui/material";
import React from "react";

import { LineGraphComponent } from "../LineGraphComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { BarGraphComponent } from "../BarGraphComponent";

export const GraphBuilderPreview = ({
  graphType,
  legendPosition,
  legendDisplay,
  graphTitle,
  data,
}) => {
  const theme = useTheme();
  console.log({ graphType });
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
            legendDisplay={legendDisplay}
            graphTitle={graphTitle}
            data={data}
          />
        )}
        {graphType === LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value && (
          <BarGraphComponent
            legendPosition={legendPosition}
            legendDisplay={legendDisplay}
            graphTitle={graphTitle}
            data={data}
          />
        )}
      </Grid>
    </div>
  );
};
