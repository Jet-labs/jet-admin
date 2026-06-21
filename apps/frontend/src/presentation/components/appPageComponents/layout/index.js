export {
  walkTree,
  findNodeById,
  findParentOf,
  addWidgetToRow,
  removeNode,
  moveNode,
  setNodeSizing,
  setNodeSpan,
  addRow,
  removeEmptyRows,
  wrapInContainer,
  unwrapContainer,
  wrapInZStack,
  addWidgetToZStack,
  setNodeStyle,
  setNodeCondition,
  setNodeRepeat,
} from "./layoutEngine.js";

export { migrateV1ToV2 } from "./layoutMigration.js";

export {
  generateNodeId,
  createColumnNode,
  createRowNode,
  createWidgetNode,
  createContainerNode,
  createZStackNode,
  createDefaultLayout,
} from "./layoutDefaults.js";

export {
  default as LayoutRenderer,
  LayoutRow,
  LayoutWidgetSlot,
  LayoutContainer,
  LayoutStack,
} from "./LayoutRenderer.jsx";

export { default as LayoutNodeToolbar } from "./LayoutNodeToolbar.jsx";
export { default as LayoutResizeHandle } from "./LayoutResizeHandle.jsx";
export { default as LayoutDropIndicator } from "./LayoutDropIndicator.jsx";
export { default as LayoutEditorCanvas } from "./LayoutEditorCanvas.jsx";

// ─── Craft.js-powered editor (Phase 1 — opt-in via VITE_USE_CRAFT_EDITOR=true) ───
export { default as CraftLayoutEditorCanvas } from "./CraftLayoutEditorCanvas.jsx";
export { treeToCraft, craftToTree } from "./craftAdapter.js";
export { CanvasColumn } from "./craftComponents/CanvasColumn.jsx";
export { CanvasRow } from "./craftComponents/CanvasRow.jsx";
export { CanvasContainer } from "./craftComponents/CanvasContainer.jsx";
export { CanvasStack } from "./craftComponents/CanvasStack.jsx";
export { CanvasZStack } from "./craftComponents/CanvasZStack.jsx";
export { CanvasWidgetSlot } from "./craftComponents/CanvasWidgetSlot.jsx";

