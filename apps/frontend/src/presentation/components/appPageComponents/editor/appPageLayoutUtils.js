import { cloneDeep } from "lodash";
import { createRowNode, createWidgetNode } from "../layout/engine/layoutDefaults.js";

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

/**
 * Instance counter for widget keys. Ensures unique keys without
 * relying on Date.now() (which caused stale entries and inconsistent parsing).
 */
let _widgetInstanceCounter = 0;

/**
 * Creates a unique widget instance key.
 * Format: widget_<widgetID>_<instanceIndex>
 * The instance index ensures uniqueness when the same widget is placed multiple times.
 *
 * @param {string|number} widgetID - The widget ID
 * @param {Array<string>} [existingKeys=[]] - Widget keys already present in the
 *   page config. The module counter resets on every page load, so without this
 *   the generated key could collide with one saved in a previous session.
 */
export const createWidgetInstanceKey = (widgetID, existingKeys = []) => {
  const prefix = `widget_${widgetID}_`;

  let maxExistingIndex = 0;
  for (const key of existingKeys) {
    if (typeof key === "string" && key.startsWith(prefix)) {
      const suffix = Number(key.slice(prefix.length));
      if (Number.isFinite(suffix) && suffix > maxExistingIndex) {
        maxExistingIndex = suffix;
      }
    }
  }

  _widgetInstanceCounter = Math.max(_widgetInstanceCounter, maxExistingIndex) + 1;
  return `${prefix}${_widgetInstanceCounter}`;
};

/**
 * Parses a widget key to extract the widget ID.
 * Handles formats: widget_<id>, widget_<id>_<instance>, widget_<id>_<timestamp>
 * @param {string} widgetKey - The widget key string
 * @returns {string} The extracted widget ID
 */
export const parseWidgetKey = (widgetKey) => {
  if (!widgetKey) return "";
  const parts = String(widgetKey).split("_");
  // Format is widget_<id>[_<suffix>], so the ID is always parts[1]
  return parts[1] || "";
};

export const appendWidgetToAppPageConfig = (
  appPageConfig = {},
  widgetID,
  preferredBreakpoint = "lg"
) => {
  const existingWidgets = appPageConfig.widgets || [];
  const widgetKey = createWidgetInstanceKey(widgetID, existingWidgets);

  if (appPageConfig.layoutVersion === 2) {
    const nextWidgets = [...existingWidgets, widgetKey];
    const nextLayout = cloneDeep(appPageConfig.layout);

    if (!nextLayout || nextLayout.children.length === 0) {
      const newLayout = nextLayout || { id: "root", type: "column", children: [] };
      const newRow = createRowNode();
      newRow.children.push(createWidgetNode(widgetKey, 12, "fill"));
      newLayout.children.push(newRow);

      return {
        widgetKey,
        widgets: nextWidgets,
        layout: newLayout,
        layoutVersion: 2,
      };
    }

    const lastRow = nextLayout.children[nextLayout.children.length - 1];
    if (lastRow && lastRow.type === "row") {
      const currentSpanSum = lastRow.children.reduce((sum, child) => sum + (child.span || 0), 0);
      if (currentSpanSum + 6 <= 12) {
        lastRow.children.push(createWidgetNode(widgetKey, 6, "fill"));
      } else {
        const newRow = createRowNode();
        newRow.children.push(createWidgetNode(widgetKey, 12, "fill"));
        nextLayout.children.push(newRow);
      }
    } else {
      const newRow = createRowNode();
      newRow.children.push(createWidgetNode(widgetKey, 12, "fill"));
      nextLayout.children.push(newRow);
    }

    return {
      widgetKey,
      widgets: nextWidgets,
      layout: nextLayout,
      layoutVersion: 2,
    };
  }

  const nextWidgets = [...existingWidgets, widgetKey];
  const nextLayouts = cloneDeep(appPageConfig.layouts || {});

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
