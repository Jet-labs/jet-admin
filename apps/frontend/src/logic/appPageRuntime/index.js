/**
 * AppPage Runtime Module — Public API
 *
 * This is the single entry point for all AppPage runtime functionality.
 * Import from here instead of individual files.
 */

// Provider
export { AppPageRuntimeProvider } from "./AppPageRuntimeProvider";

// State hooks
export { useAppPageStateTree } from "./useAppPageStateTree";
export { useAppPageDispatch } from "./useAppPageDispatch";
export { useAppPageVariables } from "./useAppPageVariables";
export { useAppPageQueries } from "./useAppPageQueries";

// Widget hooks
export { useWidgetState } from "./useWidgetState";
export { useWidgetMethodRegistry } from "./useWidgetMethodRegistry";
export { useWidgetEventHandlers } from "./useWidgetEventHandlers";

// Data source manager
export { useAppPageDataSourceManager } from "./useAppPageDataSourceManager";

// Expression engine utilities
export {
  buildAppPageStateTree,
  getChangedPaths,
  getAffectedWidgets,
} from "./appPageExpressionEngine";

// Actions (for advanced use cases)
export { APP_PAGE_ACTIONS, appPageActions } from "./appPageActions";
