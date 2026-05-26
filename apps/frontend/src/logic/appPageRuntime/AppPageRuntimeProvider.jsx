/**
 * AppPage Runtime Provider
 *
 * React context provider that wraps each AppPage instance.
 * Creates a per-page useReducer with session-isolated state.
 * Each user viewing the same page gets their own provider instance.
 *
 * Usage:
 * <AppPageRuntimeProvider pageID={...} tenantID={...} pageConfig={...}>
 *   <AppPageViewer />
 * </AppPageRuntimeProvider>
 */

import React, {
  createContext,
  useReducer,
  useEffect,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { appPageReducer, createAppPageInitialState } from "./appPageReducer";
import { appPageActions } from "./appPageActions";
import { buildAppPageStateTree } from "./appPageExpressionEngine";

// ============================================================
// Contexts
// ============================================================

/** Provides the state tree (read-only) */
export const AppPageStateContext = createContext(null);

/** Provides the dispatch function (write) */
export const AppPageDispatchContext = createContext(null);

/** Provides page-level metadata */
export const AppPageMetaContext = createContext(null);

// ============================================================
// Provider Component
// ============================================================

export const AppPageRuntimeProvider = ({
  pageID,
  tenantID,
  pageConfig = {},
  children,
}) => {
  const [state, dispatch] = useReducer(
    appPageReducer,
    undefined,
    createAppPageInitialState
  );

  // Track previous state tree for change detection
  const prevStateTreeRef = useRef(null);

  // Initialize state on mount or when pageConfig changes
  useEffect(() => {
    const variableDefinitions = pageConfig.variables || [];
    const globals = {
      tenantID,
      pageID,
    };
    dispatch(appPageActions.init(variableDefinitions, globals));
  }, [pageID, tenantID, pageConfig]);

  // Build the state tree from reducer state (memoized)
  const stateTree = useMemo(
    () => buildAppPageStateTree(state, pageConfig.dataSources || []),
    [state, pageConfig.dataSources]
  );

  // Update previous state tree ref after each render
  useEffect(() => {
    prevStateTreeRef.current = stateTree;
  });

  // Page metadata (stable reference)
  const meta = useMemo(
    () => ({
      pageID,
      tenantID,
      pageConfig,
      dataSources: pageConfig.dataSources || [],
      variableDefinitions: pageConfig.variables || [],
    }),
    [pageID, tenantID, pageConfig]
  );

  return (
    <AppPageMetaContext.Provider value={meta}>
      <AppPageDispatchContext.Provider value={dispatch}>
        <AppPageStateContext.Provider value={stateTree}>
          {children}
        </AppPageStateContext.Provider>
      </AppPageDispatchContext.Provider>
    </AppPageMetaContext.Provider>
  );
};

AppPageRuntimeProvider.propTypes = {
  pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageConfig: PropTypes.object,
  children: PropTypes.node,
};
