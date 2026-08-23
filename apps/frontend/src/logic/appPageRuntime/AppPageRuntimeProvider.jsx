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
import {
  readVariablesFromUrl,
  writeVariablesToUrl,
} from "./appPageUrlSync";

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
  syncVariablesToUrl = false,
  children,
}) => {
  // Signature of the last INIT applied to the reducer. Used to skip
  // redundant re-initialisation when pageConfig's object identity changes
  // without its variables actually changing (Formik creates new objects on
  // every keystroke in the editor).
  const initSignatureRef = useRef(null);
  const computeInitSignature = (variableDefinitions, globals) =>
    JSON.stringify({ variableDefinitions, globals });

  const buildInitOverrides = (variableDefinitions) => {
    if (!syncVariablesToUrl) return {};
    return readVariablesFromUrl(variableDefinitions);
  };

  // Initialise the state SYNCHRONOUSLY via the lazy initializer so that
  // variables exist (with their default values) before ANY child effect
  // runs. Child effects flush before parent effects, so data-source
  // auto-fetch used to resolve its inputs against an empty variables object
  // and silently skip — queries/workflows never fired on load.
  // With syncVariablesToUrl, URL params override defaults at seed time so a
  // shared link loads with the exact filters encoded in it.
  const [state, dispatch] = useReducer(appPageReducer, undefined, () => {
    const variableDefinitions = pageConfig.variables || [];
    const globals = { tenantID, pageID };
    initSignatureRef.current = computeInitSignature(
      variableDefinitions,
      globals
    );
    return appPageReducer(
      createAppPageInitialState(),
      appPageActions.init(
        variableDefinitions,
        globals,
        buildInitOverrides(variableDefinitions)
      )
    );
  });

  // Track previous state tree for change detection
  const prevStateTreeRef = useRef(null);

  // Re-initialise only when the variable definitions or identity actually
  // change (not on every pageConfig object churn).
  useEffect(() => {
    const variableDefinitions = pageConfig.variables || [];
    const globals = { tenantID, pageID };
    const signature = computeInitSignature(variableDefinitions, globals);
    if (initSignatureRef.current === signature) return;
    initSignatureRef.current = signature;
    dispatch(
      appPageActions.init(
        variableDefinitions,
        globals,
        buildInitOverrides(variableDefinitions)
      )
    );
  }, [pageID, tenantID, pageConfig, syncVariablesToUrl]);

  // Mirror runtime variable values into the URL (delta vs defaults only)
  // so any view can be copied/shared as a link.
  const variables = state.variables;
  const variableDefinitions = pageConfig.variables;
  useEffect(() => {
    if (!syncVariablesToUrl) return;
    writeVariablesToUrl(variableDefinitions || [], variables || {});
  }, [syncVariablesToUrl, variableDefinitions, variables]);

  // Build the state tree from reducer state (memoized).
  // Keyed on the individual slices (not `state`) because the reducer keeps
  // untouched slices referentially equal — this prevents an unrelated
  // dispatch (e.g. a widget syncing local state) from producing a brand-new
  // tree object, which used to cascade fresh prop identities into every
  // widget and trigger render loops.
  const stateTree = useMemo(
    () => buildAppPageStateTree(state, pageConfig.dataSources || []),
    [
      state.queryResults,
      state.workflowResults,
      state.widgetStates,
      state.widgetMethods,
      state.variables,
      state.listenerResults,
      state.globals,
      pageConfig.dataSources,
    ]
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
  syncVariablesToUrl: PropTypes.bool,
  children: PropTypes.node,
};
