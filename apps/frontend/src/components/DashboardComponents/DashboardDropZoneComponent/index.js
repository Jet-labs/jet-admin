import { useTheme } from "@mui/material";
import React, { useState } from "react";

import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import { RenderWidget } from "../RenderWidget";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DashboardDropZoneComponent = ({
  widgets,
  setWidgets,
  layouts,
  setLayouts,
}) => {
  const theme = useTheme();

  const [isDraggableInDropZone, setIsDraggableInDropZone] = useState(false);
  const _enableDropping = (e) => {
    e.preventDefault();
  };
  const _handleDragOverStart = () => setIsDraggableInDropZone(true);
  const _handleDragOverEnd = () => setIsDraggableInDropZone(false);

  const _handleDelete = (index) => {
    console.log({ index });
    const _widgets = [...widgets];
    _widgets.splice(index, 1);
    setWidgets(_widgets);
  };
  const onLayoutChange = (layout, layouts) => {
    setLayouts({ ...layouts });
    console.log({ layouts });
  };

  const onDrop = (layout, layoutItem, _ev) => {
    const widget = _ev.dataTransfer.getData("widget");
    const widget_type = String(widget).split("_")[0];
    const widget_id = parseInt(String(widget).split("_")[1]);
    console.log(`Data retrieved: ${widget_id}`);
    console.log({ layout, layoutItem, widget_id, layouts });
    const _widgets = [...widgets, widget];
    setWidgets(_widgets);
    const _layouts = layouts;

    Object.keys(layouts).forEach((breakpoint, index) => {
      console.log({ br: breakpoint, b: _layouts[breakpoint] });
      _layouts[breakpoint].push?.({ ...layoutItem, i: widget });
    });
    console.log({ _layouts });
    setLayouts({ ..._layouts });
  };
  const compactType = "verticle";
  return (
    <div
      className="w-full h-full p-2 min-h-full overflow-y-scroll"
      style={{ background: theme.palette.background.paper }}
    >
      <ResponsiveReactGridLayout
        // {...props}
        style={{ background: "transparent", minHeight: 300 }}
        layouts={layouts}
        measureBeforeMount={false}
        compactType={compactType}
        preventCollision={!compactType}
        onLayoutChange={onLayoutChange}
        // onBreakpointChange={onBreakpointChange}
        onDrop={onDrop}
        isDroppable
        cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 }}
        rowHeight={300}
      >
        {widgets.map((widget, index) => {
          return (
            <div key={widget} className="">
              <RenderWidget
                widget={widget}
                index={index}
                handleDelete={_handleDelete}
              />
            </div>
          );
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
};
