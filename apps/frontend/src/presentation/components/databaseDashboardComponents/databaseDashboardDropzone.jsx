import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CONSTANTS } from "../../../constants";
import { DatabaseDashboardRenderWidget } from "./databaseDashboardRenderWidget";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DatabaseDashboardDropzone = ({
  tenantID,
  widgets,
  setWidgets,
  layouts,
  setLayouts,
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const _handleDelete = (index) => {
    const widgetToDelete = widgets[index];
    const _widgets = [...widgets];
    _widgets.splice(index, 1);
    setWidgets(_widgets);

    // Remove widget from all layouts
    const _layouts = cloneDeep(layouts);
    Object.keys(_layouts).forEach((breakpoint) => {
      _layouts[breakpoint] = _layouts[breakpoint].filter(
        (item) => item.i !== widgetToDelete
      );
    });
    setLayouts(_layouts);
  };

  const onLayoutChange = (layout, layouts) => {
    setLayouts({ ...layouts });
  };

  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  const onDrop = (currentLayout, layoutItem, _ev) => {
    const widget = _ev.dataTransfer.getData("widget");
    const _widgets = [...widgets, widget];
    setWidgets(_widgets);

    const _layouts = cloneDeep(layouts);

    // Remove placeholder elements from all breakpoints
    Object.keys(_layouts).forEach((breakpoint) => {
      const index = _layouts[breakpoint].findIndex(
        (item) => item.i === CONSTANTS.STRINGS.DASHBOARD_DROPPING_ELEMENT_TAG
      );
      if (index !== -1) {
        _layouts[breakpoint].splice(index, 1);
      }
    });

    // Add new widget to current breakpoint
    const newItem = {
      i: widget,
      x: layoutItem.x,
      y: layoutItem.y,
      w: 10, // Default width if not provided
      h: 10, // Default height if not provided
    };

    if (!_layouts[currentBreakpoint]) {
      _layouts[currentBreakpoint] = [];
    }
    _layouts[currentBreakpoint].push(newItem);

    // Add to other breakpoints with auto-positioning
    Object.keys(_layouts).forEach((breakpoint) => {
      if (breakpoint !== currentBreakpoint) {
        const exists = _layouts[breakpoint].some((item) => item.i === widget);
        if (!exists) {
          _layouts[breakpoint].push({
            i: widget,
            x: 0,
            y: Infinity, // Auto-place at next available position
            w: 10, // Adjust default based on breakpoint if needed
            h: 10,
          });
        }
      }
    });

    setLayouts(_layouts);
  };

  return (
    <div
      className="w-full h-full min-h-full overflow-y-auto bg-slate-100 bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] 
bg-[size:10px_10px]"
    >
      <ResponsiveReactGridLayout
        style={{ minHeight: "100%" }}
        draggableCancel=".cancelSelectorName"
        layouts={layouts}
        measureBeforeMount={false}
        breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
        onBreakpointChange={onBreakpointChange}
        onLayoutChange={onLayoutChange}
        resizeHandles={["ne", "se", "nw", "sw"]}
        onDrop={onDrop}
        margin={[8, 8]}
        isDroppable
        cols={{ lg: 40, md: 30, sm: 20, xs: 20, xxs: 10 }}
        rowHeight={16}
        allowOverlap={true}
      >
        {widgets.map((widget, index) => (
          <div key={widget}>
            <DatabaseDashboardRenderWidget
              tenantID={tenantID}
              widget={widget}
              index={index}
              handleDelete={_handleDelete}
            />
          </div>
        ))}
      </ResponsiveReactGridLayout>
    </div>
  );
};
