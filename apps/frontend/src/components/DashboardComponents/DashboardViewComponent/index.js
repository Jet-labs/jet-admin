import { Grid, useTheme } from "@mui/material";
import React from "react";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";
import GridLayout from "react-grid-layout";
export const DashboardViewComponent = ({ widgets, layout }) => {
  const theme = useTheme();

  return (
    <div className="w-full h-full p-2">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
      >
        {widgets.map((widget, index) => {
          const widget_type = String(widget).split("_")[0];
          const widget_id = parseInt(String(widget).split("_")[1]);
          return (
            <div className="!p-1 !h-fit !bg-black" key={widget}>
              <div className="!flex-row justify-center !items-center !w-full">
                {widget_type === "graph" && (
                  <GraphWidgetComponent id={widget_id} />
                )}
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};
