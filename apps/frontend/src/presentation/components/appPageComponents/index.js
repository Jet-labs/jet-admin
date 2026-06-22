// appPageComponents — top-level barrel export
// Re-exports the public API from the organized subdirectories.

// ─── Forms ───────────────────────────────────────────────────────────────────
export { AppPageAdditionForm } from "./forms/appPageAdditionForm";
export { AppPageUpdationForm } from "./forms/appPageUpdationForm";
export { AppPageCloneForm } from "./forms/appPageCloneForm";
export { AppPageDeletionForm } from "./forms/appPageDeletionForm";
export { AppPagePrintForm } from "./forms/appPagePrintForm";

// ─── Editor ──────────────────────────────────────────────────────────────────
export { AppPageEditor } from "./editor/appPageEditor";
export { AppPageDropzone } from "./editor/appPageDropzone";
export { AppPageWidgetList } from "./editor/appPageWidgetList";
export { AppPageWidgetSlot } from "./editor/appPageWidgetSlot";
export { WidgetIdeModal } from "./editor/widgetIdeModal";
export { AppPageVariablesEditor } from "./editor/appPageVariablesEditor";
export { AppPageDataSourcesEditor } from "./editor/appPageDataSourcesEditor";
export { AppPageDataSourceBootstrapper } from "./editor/appPageDataSourceBootstrapper";
export { AppPageConsole } from "./editor/appPageConsole";
export {
  appendWidgetToAppPageConfig,
  createWidgetInstanceKey,
  parseWidgetKey,
} from "./editor/appPageLayoutUtils";

// ─── Viewer ──────────────────────────────────────────────────────────────────
export { AppPageViewer } from "./viewer/appPageViewer";

// ─── Layout Subsystem ────────────────────────────────────────────────────────
export {
  migrateV1ToV2,
  LayoutRenderer,
  CraftLayoutEditorCanvas,
  treeToCraft,
  craftToTree,
  CanvasColumn,
  CanvasRow,
  CanvasContainer,
  CanvasStack,
  CanvasZStack,
  CanvasWidgetSlot,
} from "./layout/index.js";
