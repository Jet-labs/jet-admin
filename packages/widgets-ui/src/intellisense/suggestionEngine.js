/**
 * suggestionEngine.js  (widgets-ui)
 *
 * Thin schema-aware adapter over the core suggestion engine in
 * @jet-admin/template-engine.
 *
 * Responsibility: translate page-level schema metadata (dataSources,
 * variableDefinitions, widgetType, eventType) into suggestion items that
 * can be passed to TemplateAutocompleteInput.
 *
 * All runtime JS / object / member completion logic now lives in
 * @jet-admin/template-engine's `getJsSuggestions` / `getObjectSuggestions`.
 * This file only knows about the app-domain concepts (queries, variables,
 * events, widget methods) that the template engine doesn't.
 */

import { getWidgetMethods, getEventArgs } from "@jet-admin/widget-types";
import { getJsSuggestions, getObjectSuggestions } from "@jet-admin/template-engine";

// Re-export the core APIs so existing import sites don't break
export { getJsSuggestions, getObjectSuggestions };
// Also re-export the catalogs in case any consumer needs them
export { JS_BUILTINS, JS_ARRAY_METHODS, JS_STRING_METHODS, inferValueType, resolvePathInTree, getMemberSuggestions } from "@jet-admin/template-engine";

// ─── Schema constants ────────────────────────────────────────────────────────

const COMMON_GLOBALS = [
  { key: "state.globals.tenantID", detail: "Current tenant ID" },
  { key: "state.globals.pageID",   detail: "Current page ID"   },
];

// ─── Public APIs ─────────────────────────────────────────────────────────────

/**
 * Build the full suggestion list for a template expression input.
 *
 * Combines:
 *  - Schema-based state paths (queries, workflows, variables, event args)
 *  - Live state-tree paths and JS built-ins (delegated to template-engine)
 *
 * @param {object} options
 * @param {Array}  [options.dataSources]        - Page data sources [{ alias, type }]
 * @param {Array}  [options.variableDefinitions] - Page variable definitions [{ key }]
 * @param {string} [options.widgetType]          - For event.* arg suggestions
 * @param {string} [options.eventType]           - For event.* arg suggestions
 * @param {object} [options.stateTree]           - Live state tree wrapped as { state: … }
 * @param {string} [options.filter]              - Text currently typed inside {{ }}
 * @returns {Array<Suggestion>}
 */
export function getExpressionSuggestions({
  dataSources = [],
  variableDefinitions = [],
  widgetType,
  eventType,
  stateTree = null,
  filter = "",
} = {}) {
  // ── Schema-based state suggestions ───────────────────────────────────────
  const schemaSuggestions = [];

  // queries
  for (const ds of dataSources) {
    if (ds.type === "workflow" || !ds.alias) continue;
    const base = `state.queries.${ds.alias}`;
    schemaSuggestions.push(
      { value: `{{${base}.data}}`,        label: `{{${base}.data}}`,        detail: "Query result data",    type: "array",   category: "state" },
      { value: `{{${base}.isLoading}}`,   label: `{{${base}.isLoading}}`,   detail: "Loading state",        type: "boolean", category: "state" },
      { value: `{{${base}.error}}`,       label: `{{${base}.error}}`,       detail: "Error message",        type: "string",  category: "state" },
      { value: `{{${base}.lastUpdated}}`, label: `{{${base}.lastUpdated}}`, detail: "ISO timestamp",        type: "string",  category: "state" },
    );
  }

  // workflows
  for (const ds of dataSources) {
    if (ds.type !== "workflow" || !ds.alias) continue;
    const base = `state.workflows.${ds.alias}`;
    schemaSuggestions.push(
      { value: `{{${base}.data}}`,        label: `{{${base}.data}}`,        detail: "Workflow result",      type: "any",     category: "state" },
      { value: `{{${base}.isLoading}}`,   label: `{{${base}.isLoading}}`,   detail: "Loading state",        type: "boolean", category: "state" },
      { value: `{{${base}.error}}`,       label: `{{${base}.error}}`,       detail: "Error message",        type: "string",  category: "state" },
    );
  }

  // variables
  for (const def of variableDefinitions) {
    if (!def.key) continue;
    schemaSuggestions.push({
      value: `{{state.variables.${def.key}}}`,
      label: `{{state.variables.${def.key}}}`,
      detail: "page variable",
      type: "variable",
      category: "state",
    });
  }

  // event args
  const eventArgs = getEventArgs(widgetType, eventType);
  for (const arg of eventArgs) {
    const fullPath = `state.${arg.key}`;
    schemaSuggestions.push({
      value: `{{${fullPath}}}`,
      label: `{{${fullPath}}}`,
      detail: arg.description,
      type: "event",
      category: "state",
    });
  }

  // globals
  for (const g of COMMON_GLOBALS) {
    schemaSuggestions.push({
      value: `{{${g.key}}}`,
      label: `{{${g.key}}}`,
      detail: g.detail,
      type: "global",
      category: "state",
    });
  }

  // ── Delegate to template-engine for live tree + JS built-ins ─────────────
  return getJsSuggestions({
    filter,
    stateTree,
    baseSuggestions: schemaSuggestions,
    includeBuiltins: true,
  });
}

// ─── Specialised suggestion helpers (unchanged API surface) ──────────────────

/**
 * @deprecated Use getObjectSuggestions from @jet-admin/template-engine directly.
 * Kept for backwards compat. Will be removed in a future cleanup.
 */
export function getSuggestionsFromStateTree(stateTree, prefix = "state", depth = 0, maxDepth = 4) {
  return getObjectSuggestions(stateTree, prefix, depth, maxDepth);
}

/**
 * Alias suggestions for the EXECUTE_QUERY alias field.
 */
export function getAliasSuggestions(dataSources = []) {
  return dataSources
    .filter((ds) => ds.alias)
    .map((ds) => ({
      label: ds.alias,
      value: ds.alias,
      detail: ds.type || "data source",
    }));
}

/**
 * Variable key suggestions for the SET_VARIABLE key field.
 */
export function getVariableKeySuggestions(variableDefinitions = []) {
  const suggestions = [];
  const seen = new Set();
  for (const def of variableDefinitions) {
    if (def.key && !seen.has(def.key)) {
      seen.add(def.key);
      suggestions.push({
        label: `state.variables.${def.key}`,
        value: `state.variables.${def.key}`,
        detail: "page variable",
      });
    }
  }
  return suggestions;
}

/**
 * Widget ID suggestions for CALL_WIDGET_METHOD targetWidgetID field.
 */
export function getWidgetIDSuggestions(widgets = [], pageConfig) {
  if (!widgets || !Array.isArray(widgets)) return [];

  const placedWidgetIDs = (pageConfig?.widgets || [])
    .map((k) => {
      const parts = String(k).split("_");
      return parts.length > 1 ? parts[1] : parts[0];
    })
    .filter(Boolean);

  const filtered =
    placedWidgetIDs.length > 0
      ? widgets.filter((w) => placedWidgetIDs.includes(w.widgetID))
      : widgets;

  return filtered.map((w) => ({
    label: w.widgetTitle || w.widgetID,
    value: w.widgetID,
    detail: w.widgetType,
  }));
}

/**
 * Method suggestions for CALL_WIDGET_METHOD methodName field.
 */
export function getMethodSuggestionsForTarget(targetWidgetID, widgets = []) {
  const widget = widgets?.find((w) => w.widgetID === targetWidgetID);
  if (!widget) return [];
  const methods = getWidgetMethods(widget.widgetType);
  return methods.map((m) => ({
    label: m.name,
    value: m.name,
    detail: m.description,
  }));
}
