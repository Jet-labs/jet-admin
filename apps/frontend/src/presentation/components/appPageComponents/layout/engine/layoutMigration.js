import lodash from "lodash";
const { cloneDeep } = lodash;
import {
  createColumnNode,
  createRowNode,
  createWidgetNode,
} from "./layoutDefaults.js";

/**
 * Migrates a flat v1 react-grid-layout configuration to tree-based v2 layout.
 * Safe to call repeatedly: if layoutVersion is already 2, it returns the config as-is.
 */
export const migrateV1ToV2 = (appPageConfig) => {
  if (!appPageConfig) return appPageConfig;

  if (appPageConfig.layoutVersion === 2) {
    return appPageConfig;
  }

  const migratedConfig = cloneDeep(appPageConfig);
  migratedConfig.layoutVersion = 2;

  if (appPageConfig.layouts) {
    migratedConfig._legacyLayouts = appPageConfig.layouts;
  }

  const legacyLayouts = appPageConfig.layouts || {};
  const primaryLayoutItems = legacyLayouts.lg || legacyLayouts.md || legacyLayouts.sm || [];

  if (primaryLayoutItems.length === 0) {
    migratedConfig.layout = createColumnNode([createRowNode([])]);
    delete migratedConfig.layouts;
    return migratedConfig;
  }

  const sortedItems = [...primaryLayoutItems].sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const visualRows = [];
  let currentRow = [];
  let rowY = 0;
  let rowHeight = 0;

  sortedItems.forEach((item) => {
    if (currentRow.length === 0) {
      currentRow.push(item);
      rowY = item.y;
      rowHeight = item.h;
    } else {
      const overlaps = Math.max(rowY, item.y) < Math.min(rowY + rowHeight, item.y + item.h);
      if (overlaps) {
        currentRow.push(item);
        rowY = Math.min(rowY, item.y);
        rowHeight = Math.max(rowY + rowHeight, item.y + item.h) - rowY;
      } else {
        visualRows.push(currentRow);
        currentRow = [item];
        rowY = item.y;
        rowHeight = item.h;
      }
    }
  });

  if (currentRow.length > 0) {
    visualRows.push(currentRow);
  }

  const childrenRowNodes = visualRows.map((vRow) => {
    const sortedRowItems = vRow.sort((a, b) => a.x - b.x);

    const widgetNodes = sortedRowItems.map((item) => {
      const rawSpan = Math.round((item.w || 8) / 2);
      const span = Math.max(1, Math.min(12, rawSpan));

      return createWidgetNode(item.i, span, "fill");
    });

    return createRowNode(widgetNodes);
  });

  migratedConfig.layout = createColumnNode(childrenRowNodes);

  delete migratedConfig.layouts;

  return migratedConfig;
};
