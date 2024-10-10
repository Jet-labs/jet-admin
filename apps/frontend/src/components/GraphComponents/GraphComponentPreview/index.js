import { Grid, useTheme } from "@mui/material";
import React from "react";
import { GRAPH_PLUGINS_MAP } from "../GraphTypes";


export const GraphComponentPreview = ({
  graphType,
  legendPosition,
  titleDisplayEnabled,
  pmGraphTitle,
  data,
  refetchInterval,
}) => {
  const theme = useTheme();
  return (
    <div className="!pt-8  !sticky !top-0 !z-50">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{
          background: theme.palette.background.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
        }}
      >
        {GRAPH_PLUGINS_MAP[graphType].component({
          legendPosition,
          titleDisplayEnabled,
          pmGraphTitle,
          data,
        })}
      </Grid>
    </div>
  );
};
