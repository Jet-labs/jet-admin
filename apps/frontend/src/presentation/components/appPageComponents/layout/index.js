// Layout subsystem barrel export
// Legacy editor exports (LayoutEditorCanvas, LayoutNodeToolbar, LayoutDropIndicator) removed.

// ─── Engine (pure logic) ─────────────────────────────────────────────────────
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
  balanceCraftRow,
} from "./engine/layoutEngine.js";

export { migrateV1ToV2 } from "./engine/layoutMigration.js";

export {
  generateNodeId,
  createColumnNode,
  createRowNode,
  createWidgetNode,
  createContainerNode,
  createZStackNode,
  createDefaultLayout,
} from "./engine/layoutDefaults.js";

export { treeToCraft, craftToTree } from "./engine/craftAdapter.js";

// ─── Runtime Renderer ────────────────────────────────────────────────────────
export {
  default as LayoutRenderer,
  LayoutRow,
  LayoutWidgetSlot,
  LayoutContainer,
  LayoutStack,
} from "./renderer/LayoutRenderer.jsx";

// ─── Craft.js Editor ─────────────────────────────────────────────────────────
export { default as CraftLayoutEditorCanvas } from "./editor/CraftLayoutEditorCanvas.jsx";
export { default as CraftSettingsPanel } from "./editor/CraftSettingsPanel.jsx";
export { default as LayoutResizeHandle } from "./editor/LayoutResizeHandle.jsx";
export { default as WidgetResizeHandles } from "./editor/WidgetResizeHandles.jsx";

// ─── Craft.js Components ─────────────────────────────────────────────────────
export { CanvasColumn } from "./components/CanvasColumn.jsx";
export { CanvasRow } from "./components/CanvasRow.jsx";
export { CanvasContainer } from "./components/CanvasContainer.jsx";
export { CanvasStack } from "./components/CanvasStack.jsx";
export { CanvasZStack } from "./components/CanvasZStack.jsx";
export { CanvasWidgetSlot } from "./components/CanvasWidgetSlot.jsx";
