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
export { useAppPageWorkflows } from "./useAppPageWorkflows";

// Widget hooks
export { useWidgetState } from "./useWidgetState";
export { useWidgetMethodRegistry } from "./useWidgetMethodRegistry";
export { useWidgetEventHandlers } from "./useWidgetEventHandlers";

// Data source manager
export { useAppPageDataSourceManager } from "./useAppPageDataSourceManager";

// Workflow streaming utility
export { executeWorkflowWithStreaming } from "./executeWorkflowWithStreaming";

// Expression engine utilities
export {
  buildAppPageStateTree,
  getChangedPaths,
  getAffectedWidgets,
} from "./appPageExpressionEngine";

// Actions (for advanced use cases)
export { APP_PAGE_ACTIONS, appPageActions } from "./appPageActions";
