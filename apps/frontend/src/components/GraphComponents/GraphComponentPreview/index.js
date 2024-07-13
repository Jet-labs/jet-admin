import { Grid, useTheme } from "@mui/material";
import React from "react";
import { GRAPH_PLUGINS_MAP } from "../../../plugins/graphs";

export const GraphComponentPreview = ({
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
        style={{
          background: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          borderWidth: 1,
        }}
      >
        {GRAPH_PLUGINS_MAP[graphType].component({
          legendPosition,
          titleDisplayEnabled,
          graphTitle,
          data,
        })}
      </Grid>
    </div>
  );
};
