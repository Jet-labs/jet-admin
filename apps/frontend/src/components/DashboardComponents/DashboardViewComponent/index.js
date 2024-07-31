import { Grid, useTheme } from "@mui/material";
import React from "react";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";
import GridLayout from "react-grid-layout";
export const DashboardViewComponent = ({ graphIDData, layout }) => {
  const theme = useTheme();
  console.log("here", graphIDData);
  return (
    <div className="w-full h-full p-2">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
      >
        {graphIDData.map((graph, index) => {
          return (
            <div className="!p-1 !h-fit !bg-black" key={graph}>
              <div className="!flex-row justify-center !items-center !w-full">
                <GraphWidgetComponent id={graph.graphID} />
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};
