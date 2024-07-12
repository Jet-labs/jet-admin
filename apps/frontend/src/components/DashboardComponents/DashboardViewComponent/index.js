import { Grid, useTheme } from "@mui/material";
import React from "react";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";

export const DashboardViewComponent = ({ graphIDData }) => {
  const theme = useTheme();
  console.log("here", graphIDData);
  return (
    <div className="w-full h-full p-2">
      <Grid
        className="w-full h-full"
        container
        gridTemplateColumns={"auto auto auto"}
      >
        {graphIDData && graphIDData.length > 0 ? (
          graphIDData.map((graph, index) => {
            return (
              <Grid item xs={6} className="!p-1 !h-fit">
                <GraphWidgetComponent id={graph.graphID} />
              </Grid>
            );
          })
        ) : (
          <div className="!w-full !h-full flex flex-col justify-center items-center">
            <span>No graphs added to this dashboard</span>
          </div>
        )}
      </Grid>
    </div>
  );
};
