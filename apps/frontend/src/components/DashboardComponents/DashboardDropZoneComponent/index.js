import { Grid, IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";

import { FaTimes } from "react-icons/fa";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useComponentSize } from "../../../hooks/use-component-size";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const RenderWidget = ({ widget, index, handleDelete }) => {
  const theme = useTheme();
  const widget_type = String(widget).split("_")[0];
  const widget_id = parseInt(String(widget).split("_")[1]);
  const [ref, size] = useComponentSize();
  return (
    <div
      className="!p-1 !rounded !h-full !w-full flex-grow relative"
      style={{ background: theme.palette.background.default }}
    >
      {handleDelete && (
        <div className="!flex-row justify-end !items-center !w-full absolute top-1 left-1">
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => {
              handleDelete(index);
            }}
            style={{
              background: theme.palette.background.default,
              borderRadius: 0,
              borderBottomRightRadius: 4,
            }}
          >
            <FaTimes className="!text-sm" />
          </IconButton>
        </div>
      )}
      <div
        className="!flex-row justify-center !items-center !w-full !h-full"
        ref={ref}
      >
        {widget_type === "graph" && (
          <GraphWidgetComponent
            id={widget_id}
            height={size.height}
            width={size.width}
          />
        )}
      </div>
    </div>
  );
};
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

  const _handleDrop = (e) => {
    const id = e.dataTransfer.getData("text");
    console.log({ e });
    if (widgets && id) {
      const _widgets = [...widgets, id];
      setWidgets(_widgets);
    }
    setIsDraggableInDropZone(false);
  };

  const _handleDelete = (index) => {
    const _widgets = [...widgets];
    _widgets.splice(index, 1);
    setWidgets(_widgets);
  };
  const onLayoutChange = (layout, layouts) => {
    setLayouts({ ...layouts });
  };
  const onDrop = (layout, layoutItem, _ev) => {
    alert(
      `Element parameters:\n${JSON.stringify(
        layoutItem,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };
  const compactType = "verticle";
  return (
    <div
      className="w-full h-full p-2 min-h-full overflow-y-scroll"
      style={{ background: theme.palette.background.paper }}
    >
      <ResponsiveReactGridLayout
        // {...props}
        style={{ background: "#f0f0f0" }}
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
