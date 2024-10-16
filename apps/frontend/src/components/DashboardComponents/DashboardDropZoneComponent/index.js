import { useTheme } from "@mui/material";
import React, { useState } from "react";

import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import { RenderWidget } from "../RenderWidget";
import { cloneDeep } from "lodash";
import { LOCAL_CONSTANTS } from "../../../constants";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DashboardDropZoneComponent = ({
  widgets,
  setWidgets,
  layouts,
  setLayouts,
}) => {
  const theme = useTheme();

  const _handleDelete = (index) => {
    const _widgets = [...widgets];
    _widgets.splice(index, 1);
    setWidgets(_widgets);
  };
  const onLayoutChange = (layout, layouts) => {
    setLayouts({ ...layouts });
  };

  const onDrop = (layout, layoutItem, _ev) => {
    const widget = _ev.dataTransfer.getData("widget");
    const widget_type = String(widget).split("_")[0];
    const widget_id = parseInt(String(widget).split("_")[1]);
    const _widgets = [...widgets, widget];
    setWidgets(_widgets);
    const _layouts = cloneDeep(layouts);
    let element = null;
    let breakpoint = null;
    Object.keys(layouts).forEach((_breakpoint, index) => {
      const _index = _layouts[_breakpoint].findIndex(
        (item) => item.i === LOCAL_CONSTANTS.STRINGS.DROPPING_ELEMENT_TAG
      );
      if (_index !== -1) {
        breakpoint = _breakpoint;
        element = { ..._layouts[_breakpoint][_index] };
        _layouts[_breakpoint].splice(_index, 1);
        _layouts[_breakpoint].push({ ...element, i: widget });
      }
    });

    Object.keys(layouts).forEach((_breakpoint, index) => {
      if (breakpoint != _breakpoint) {
        _layouts[_breakpoint].push({ ...element, i: widget });
      }
    });

    setLayouts(_layouts);
  };

  return (
    <div
      className="w-full h-full p-2 min-h-full overflow-y-auto"
      style={{ background: theme.palette.background.paper }}
    >
      <ResponsiveReactGridLayout
        // {...props}
        style={{ background: "transparent", minHeight: "100%" }}
        layouts={layouts}
        measureBeforeMount={false}
        breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
        // compactType={compactType}
        // preventCollision={!compactType}
        onLayoutChange={onLayoutChange}
        resizeHandles={["ne", "se", "nw", "sw"]}
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
