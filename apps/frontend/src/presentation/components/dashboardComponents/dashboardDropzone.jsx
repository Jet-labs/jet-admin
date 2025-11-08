import React, { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CONSTANTS } from "../../../constants";
import { DashboardRenderWidget } from "./dashboardRenderWidget";
import PropTypes from "prop-types";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DashboardDropzone = ({
  tenantID,
  widgets,
  setWidgets,
  layouts,
  setLayouts,
}) => {
  DashboardDropzone.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgets: PropTypes.array.isRequired,
    setWidgets: PropTypes.func.isRequired,
    layouts: PropTypes.object.isRequired,
    setLayouts: PropTypes.func.isRequired,
  };
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const defaultWidgetSize = { w: 4, h: 6 };
  const containerRef = useRef(null);
  const previousWidth = useRef(0);

  const _handleDelete = (index) => {
    const widgetToDelete = widgets[index];
    const _widgets = [...widgets];
    _widgets.splice(index, 1);
    setWidgets(_widgets);
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
    console.log("widget", widget);
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
      ...defaultWidgetSize,
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
  const scaleLayouts = (layouts, scaleFactor) => {
    const _layouts = cloneDeep(layouts);
    console.log("layouts:before", layouts);
    Object.keys(_layouts).forEach((bp) => {
      _layouts[bp] = _layouts[bp].map((item) => ({
        ...item,
        w: Math.round(item.w * scaleFactor),
        x: Math.round(item.x * scaleFactor),
      }));
    });
    console.log("layouts:after", _layouts);
    return _layouts;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;

        if (previousWidth.current && previousWidth.current !== newWidth) {
          const scaleFactor = newWidth / previousWidth.current;

          // Scale the layout proportionally
          const newLayouts = scaleLayouts(layouts, scaleFactor);
          setLayouts(newLayouts);
        }

        previousWidth.current = newWidth;
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setLayouts, layouts, widgets, containerRef, scaleLayouts]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-full overflow-y-auto bg-slate-100">
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
        margin={[6, 6]}
        isDroppable
        cols={{ lg: 24, md: 18, sm: 12, xs: 8, xxs: 4 }} // More columns = finer control
        rowHeight={16} // Smaller height = finer control vertically
        allowOverlap={false}

      >
        {widgets.map((widget, index) => (
          <div key={widget}>
            <DashboardRenderWidget
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
