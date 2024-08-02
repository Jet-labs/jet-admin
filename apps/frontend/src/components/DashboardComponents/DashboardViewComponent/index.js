import { Grid, useTheme } from "@mui/material";
import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { RenderWidget } from "../RenderWidget";
const ResponsiveReactGridLayout = WidthProvider(Responsive);
export const DashboardViewComponent = ({ widgets, layouts }) => {
  const theme = useTheme();
  const compactType = "verticle";
  return (
    <div
      className="w-full h-full p-2 overflow-y-scroll pb-10"
      style={{ background: theme.palette.background.paper }}
    >
      <ResponsiveReactGridLayout
        style={{ background: "transparent", minHeight: 300 }}
        layouts={layouts}
        // measureBeforeMount={false}
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
        compactType={compactType}
        preventCollision={!compactType}
        isDraggable={false}
        isResizable={false}
        resizeHandles={[]}
      >
        {widgets.map((widget, index) => {
          return (
            <div key={widget} className="">
              <RenderWidget responsive={false} widget={widget} index={index} />
            </div>
          );
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
};
