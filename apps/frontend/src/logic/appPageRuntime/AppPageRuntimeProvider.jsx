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
import { getQueryCoordinator } from './queryCoordinator';
import {
  readVariablesFromUrl,
  writeVariablesToUrl,
} from "./appPageUrlSync";
import { snapshotPageState } from "./appPageStateCache";

const matchesVariableType = (value, type) => {
  const actual =
    value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  return (Array.isArray(type) ? type : [type]).includes(actual);
};

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

const AppPageRuntimeSession = ({
  pageID,
  tenantID,
  pageConfig = {},
  syncVariablesToUrl = false,
  syncPageVariableKeys = null,
  initialPageVariables = null,
  onWriteVariablesToUrl = null,
  isSyncPageVariableValueAllowed = null,
  retainState = false,
  stateCache = null,
  cacheKey = null,
  runtimeServices = null,
  expressionContext = null,
  setApplicationVariable = null,
  resetApplicationState = null,
  emitApplicationEvent = null,
  navigateToRoute = null,
  children,
}) => {
  // Signature of the last INIT applied to the reducer. Used to skip
  // redundant re-initialisation when pageConfig's object identity changes
  // without its variables actually changing (Formik creates new objects on
  // every keystroke in the editor).
  const initSignatureRef = useRef(null);
  const initialPageVariablesSignatureRef = useRef(null);
  const computeInitSignature = (variableDefinitions, globals) =>
    JSON.stringify({ variableDefinitions, globals });

  const buildInitOverrides = (variableDefinitions) => {
    const overrides = syncVariablesToUrl
      ? readVariablesFromUrl(variableDefinitions)
      : {};
    const allowed = new Set(
      Array.isArray(syncPageVariableKeys) ? syncPageVariableKeys : []
    );
    if (!allowed.size || !initialPageVariables) return overrides;

    for (const def of variableDefinitions) {
      if (!allowed.has(def.key)) continue;
      if (!Object.prototype.hasOwnProperty.call(initialPageVariables, def.key)) {
        continue;
      }
      const value = initialPageVariables[def.key];
      if (matchesVariableType(value, def.type)) {
        overrides[def.key] = value;
      }
    }
    return overrides;
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
    const cached =
      retainState && stateCache && cacheKey ? stateCache.get(cacheKey) : null;
    if (
      cached &&
      cached.globals?.pageID === pageID &&
      cached.globals?.tenantID === tenantID
    ) {
      // Re-apply the current route query after a keep-alive return.
      initialPageVariablesSignatureRef.current = null;
      return cached;
    }
    initialPageVariablesSignatureRef.current = JSON.stringify(
      initialPageVariables ?? null
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
  useEffect(() => () => getQueryCoordinator(dispatch).retireAll(), [dispatch]);

  useEffect(() => {
    if (!retainState || !stateCache || !cacheKey) return;
    stateCache.set(cacheKey, snapshotPageState(state));
  }, [retainState, stateCache, cacheKey, state]);

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

  // Application routes can bind declared query parameters to page variables.
  // Query-only navigation does not remount the page, so apply changed route
  // values without resetting unrelated page state.
  useEffect(() => {
    if (!initialPageVariables) return;
    const signature = JSON.stringify(initialPageVariables);
    if (signature === initialPageVariablesSignatureRef.current) return;
    initialPageVariablesSignatureRef.current = signature;

    const allowed = new Set(
      Array.isArray(syncPageVariableKeys) ? syncPageVariableKeys : []
    );
    if (!allowed.size) return;

    const patch = {};
    for (const def of pageConfig.variables || []) {
      if (!allowed.has(def.key)) continue;
      if (!Object.prototype.hasOwnProperty.call(initialPageVariables, def.key)) {
        continue;
      }
      const value = initialPageVariables[def.key];
      if (!matchesVariableType(value, def.type)) continue;
      if (state.variables[def.key] !== value) patch[def.key] = value;
    }
    if (Object.keys(patch).length) {
      dispatch(appPageActions.setVariables(patch));
    }
  }, [initialPageVariables, syncPageVariableKeys, pageConfig, state.variables]);

  // Mirror runtime variable values into the URL (delta vs defaults only)
  // so any view can be copied/shared as a link.
  const variables = state.variables;
  const variableDefinitions = pageConfig.variables;
  useEffect(() => {
    const keys = Array.isArray(syncPageVariableKeys)
      ? syncPageVariableKeys
      : [];
    if (!syncVariablesToUrl && keys.length === 0) return;
    let writableKeys = keys;
    if (isSyncPageVariableValueAllowed) {
      writableKeys = keys.filter((key) =>
        isSyncPageVariableValueAllowed(key, (variables || {})[key])
      );
    }
    if (!syncVariablesToUrl && writableKeys.length === 0) return;
    if (onWriteVariablesToUrl) {
      onWriteVariablesToUrl(
        variableDefinitions || [],
        variables || {},
        syncVariablesToUrl ? null : writableKeys
      );
      return;
    }
    writeVariablesToUrl(variableDefinitions || [], variables || {}, {
      keys: syncVariablesToUrl ? undefined : writableKeys,
    });
  }, [
    syncVariablesToUrl,
    syncPageVariableKeys,
    onWriteVariablesToUrl,
    isSyncPageVariableValueAllowed,
    variableDefinitions,
    variables,
  ]);

  // Build the state tree from reducer state (memoized).
  // Keyed on the individual slices (not `state`) because the reducer keeps
  // untouched slices referentially equal — this prevents an unrelated
  // dispatch (e.g. a widget syncing local state) from producing a brand-new
  // tree object, which used to cascade fresh prop identities into every
  // widget and trigger render loops.
  const stateTree = useMemo(
    () => {
      const pageTree = buildAppPageStateTree(state, pageConfig.dataSources || []);
      return expressionContext ? { ...pageTree, ...expressionContext, page: { variables: pageTree.variables, queries: pageTree.queries } } : pageTree;
    },
    [
      state.queryResults,
      state.workflowResults,
      state.widgetStates,
      state.widgetMethods,
      state.variables,
      state.listenerResults,
      state.globals,
      pageConfig.dataSources,
      expressionContext,
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
      runtimeServices,
      setApplicationVariable,
      resetApplicationState,
      emitApplicationEvent,
      navigateToRoute,
    }),
    [
      pageID,
      tenantID,
      pageConfig,
      runtimeServices,
      setApplicationVariable,
      resetApplicationState,
      emitApplicationEvent,
      navigateToRoute,
    ]
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

// Identity changes create a new reducer/dispatch and unmount old observers
// synchronously; no render can expose the previous tenant's query results.
export const AppPageRuntimeProvider = (props) => (
  <AppPageRuntimeSession key={JSON.stringify([props.tenantID, props.pageID, props.scopeID, props.runtimeServices?.identity])} {...props} />
);

const runtimePropTypes = {
  pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageConfig: PropTypes.object,
  syncVariablesToUrl: PropTypes.bool,
  syncPageVariableKeys: PropTypes.arrayOf(PropTypes.string),
  initialPageVariables: PropTypes.object,
  onWriteVariablesToUrl: PropTypes.func,
  isSyncPageVariableValueAllowed: PropTypes.func,
  retainState: PropTypes.bool,
  stateCache: PropTypes.shape({
    get: PropTypes.func,
    set: PropTypes.func,
  }),
  cacheKey: PropTypes.string,
  scopeID: PropTypes.string,
  runtimeServices: PropTypes.object,
  expressionContext: PropTypes.object,
  setApplicationVariable: PropTypes.func,
  resetApplicationState: PropTypes.func,
  emitApplicationEvent: PropTypes.func,
  navigateToRoute: PropTypes.func,
  children: PropTypes.node,
};
AppPageRuntimeProvider.propTypes = runtimePropTypes;
AppPageRuntimeSession.propTypes = runtimePropTypes;
