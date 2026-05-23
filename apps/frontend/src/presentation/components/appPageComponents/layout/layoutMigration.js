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

  // If already migrated, return
  if (appPageConfig.layoutVersion === 2) {
    return appPageConfig;
  }

  const migratedConfig = cloneDeep(appPageConfig);
  migratedConfig.layoutVersion = 2;

  // Preserve old layouts as legacy backup
  if (appPageConfig.layouts) {
    migratedConfig._legacyLayouts = appPageConfig.layouts;
  }

  // Get primary layout (lg breakpoint, defaulting to others if lg is empty)
  const legacyLayouts = appPageConfig.layouts || {};
  const primaryLayoutItems = legacyLayouts.lg || legacyLayouts.md || legacyLayouts.sm || [];

  if (primaryLayoutItems.length === 0) {
    // Return default empty layout tree
    migratedConfig.layout = createColumnNode([createRowNode([])]);
    delete migratedConfig.layouts;
    return migratedConfig;
  }

  // Sort items by top coordinate (y) first, then left coordinate (x)
  const sortedItems = [...primaryLayoutItems].sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  // Group items into rows based on vertical overlap
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
      // Check for vertical overlap: max(y1, y2) < min(y1+h1, y2+h2)
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

  // Map visual rows to layout nodes
  const childrenRowNodes = visualRows.map((vRow) => {
    // Sort items horizontally within the row to be extra safe
    const sortedRowItems = vRow.sort((a, b) => a.x - b.x);

    const widgetNodes = sortedRowItems.map((item) => {
      // Scale legacy width (from 24 col grid or similar) to 12 col grid
      // Let's assume standard width 24. Math.round(item.w / 2) scales 24 -> 12 perfectly.
      const rawSpan = Math.round((item.w || 8) / 2);
      const span = Math.max(1, Math.min(12, rawSpan));

      return createWidgetNode(item.i, span, "fill");
    });

    return createRowNode(widgetNodes);
  });

  migratedConfig.layout = createColumnNode(childrenRowNodes);

  // Clean up legacy layouts key
  delete migratedConfig.layouts;

  return migratedConfig;
};
