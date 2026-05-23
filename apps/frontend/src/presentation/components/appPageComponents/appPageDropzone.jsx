/**
 * AppPageDropzone
 *
 * Editor-mode canvas for building app pages.
 * Wraps the drag-and-drop grid layout in an AppPageRuntimeProvider
 * so that widget previews render with live data binding.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const AppPageDropzone = ({
  tenantID,
  pageID,
  pageConfig = {},
  widgets,
  setWidgets,
  layouts,
  setLayouts,
}) => {
  AppPageDropzone.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pageConfig: PropTypes.object,
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
    const _widgets = [...widgets, widget];
    setWidgets(_widgets);

    const _layouts = cloneDeep(layouts);

    // Remove placeholder elements from all breakpoints
    Object.keys(_layouts).forEach((breakpoint) => {
      const index = _layouts[breakpoint].findIndex(
        (item) => item.i === CONSTANTS.STRINGS.APP_PAGE_DROPPING_ELEMENT_TAG
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
            y: Infinity,
            w: 10,
            h: 10,
          });
        }
      }
    });

    setLayouts(_layouts);
  };

  const scaleLayouts = useCallback((currentLayouts, scaleFactor) => {
    const _layouts = cloneDeep(currentLayouts);
    Object.keys(_layouts).forEach((bp) => {
      _layouts[bp] = _layouts[bp].map((item) => ({
        ...item,
        w: Math.round(item.w * scaleFactor),
        x: Math.round(item.x * scaleFactor),
      }));
    });
    return _layouts;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;

        if (previousWidth.current && previousWidth.current !== newWidth) {
          const scaleFactor = newWidth / previousWidth.current;
          const newLayouts = scaleLayouts(layouts, scaleFactor);
          setLayouts(newLayouts);
        }

        previousWidth.current = newWidth;
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [layouts, scaleLayouts, setLayouts]);

  return (
    <AppPageRuntimeProvider
      pageID={pageID}
      tenantID={tenantID}
      pageConfig={pageConfig}
    >
      <AppPageDataSourceBootstrapper />
      <div
        ref={containerRef}
        className="h-full min-h-full w-full overflow-y-auto bg-muted/30 p-2"
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
          margin={[6, 6]}
          isDroppable
          cols={{ lg: 24, md: 18, sm: 12, xs: 8, xxs: 4 }}
          rowHeight={16}
          allowOverlap={false}
        >
          {widgets.map((widgetKey, index) => (
            <div key={widgetKey}>
              <AppPageWidgetSlot
                tenantID={tenantID}
                widgetKey={widgetKey}
                index={index}
                handleDelete={_handleDelete}
                editable={true}
              />
            </div>
          ))}
        </ResponsiveReactGridLayout>
      </div>
    </AppPageRuntimeProvider>
  );
};
