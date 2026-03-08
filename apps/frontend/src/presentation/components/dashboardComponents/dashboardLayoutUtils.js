import { cloneDeep } from "lodash";

export const GRID_BREAKPOINTS = {
  lg: 1000,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

export const GRID_BREAKPOINT_ORDER = Object.keys(GRID_BREAKPOINTS);

export const GRID_COLS = { lg: 24, md: 18, sm: 12, xs: 8, xxs: 4 };
const MIN_WIDGET_W = 4;
const MIN_WIDGET_H = 6;

export const getDefaultWidgetSize = (breakpoint) => {
  const cols = GRID_COLS[breakpoint] || GRID_COLS.lg;

  return {
    w: Math.max(MIN_WIDGET_W, Math.min(cols, cols >= 18 ? 8 : cols >= 12 ? 6 : 4)),
    h: 10,
  };
};

export const clampWidgetLayoutItem = (item, breakpoint) => {
  const cols = GRID_COLS[breakpoint] || GRID_COLS.lg;
  const width = Math.max(MIN_WIDGET_W, Math.min(item.w, cols));

  return {
    ...item,
    w: width,
    h: Math.max(MIN_WIDGET_H, item.h),
    x: Math.max(0, Math.min(item.x, cols - width)),
    y: Math.max(0, item.y),
  };
};

export const createWidgetInstanceKey = (widgetID) => {
  return `widget_${widgetID}_${Date.now()}`;
};

export const appendWidgetToDashboardConfig = (
  dashboardConfig = {},
  widgetID,
  preferredBreakpoint = "lg"
) => {
  const widgetKey = createWidgetInstanceKey(widgetID);
  const nextWidgets = [...(dashboardConfig.widgets || []), widgetKey];
  const nextLayouts = cloneDeep(dashboardConfig.layouts || {});

  GRID_BREAKPOINT_ORDER.forEach((breakpoint) => {
    if (!nextLayouts[breakpoint]) {
      nextLayouts[breakpoint] = [];
    }

    nextLayouts[breakpoint].push(
      clampWidgetLayoutItem(
        {
          i: widgetKey,
          x: 0,
          y: breakpoint === preferredBreakpoint ? 0 : Infinity,
          ...getDefaultWidgetSize(breakpoint),
        },
        breakpoint
      )
    );
  });

  return {
    widgetKey,
    widgets: nextWidgets,
    layouts: nextLayouts,
  };
};