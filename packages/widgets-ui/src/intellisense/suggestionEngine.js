import { getWidgetMethods, getEventArgs } from "@jet-admin/widget-types";

/**
 * Describes the structure of the runtime state tree that {{ }} expressions
 * resolve against. Used to auto-generate intellisense suggestions.
 *
 * Shape mirrors buildAppPageStateTree() in appPageExpressionEngine.js.
 * __WILDCARD__ keys indicate branches that vary by alias/key at runtime.
 *
 * The runtime tree is wrapped under a "state" namespace:
 *   {{ state.queries.users.data }}
 *   {{ state.variables.selectedUserID }}
 */
const STATE_TREE_SHAPE = {
  queries: {
    __WILDCARD__: {
      data: { type: "any", detail: "Query result data" },
      isLoading: { type: "boolean", detail: "Loading state" },
      error: { type: "string|null", detail: "Error message if failed" },
      lastUpdated: { type: "string", detail: "ISO timestamp of last result" },
    },
  },
  workflows: {
    __WILDCARD__: {
      data: { type: "any", detail: "Workflow result data" },
      isLoading: { type: "boolean", detail: "Loading state" },
      error: { type: "string|null", detail: "Error message if failed" },
      instanceID: { type: "string", detail: "Workflow instance ID" },
      lastUpdated: { type: "string", detail: "ISO timestamp of last result" },
    },
  },
};

const COMMON_PAGINATION_VARIABLES = ["skip", "limit", "page", "pageSize"];

const COMMON_GLOBALS = [
  { key: "state.globals.tenantID", detail: "Current tenant ID" },
  { key: "state.globals.pageID", detail: "Current page ID" },
];

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Walk a shape branch and collect all leaf keys (non-wildcard, non-object).
 */
function collectLeaves(shape, prefix) {
  const leaves = [];
  if (shape === "__WILDCARD__") return leaves;
  if (typeof shape !== "object" || shape === null) {
    leaves.push({ path: prefix, ...(typeof shape === "object" ? shape : {}) });
    return leaves;
  }
  for (const [key, value] of Object.entries(shape)) {
    if (key === "__WILDCARD__") continue;
    const childPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !value.type) {
      leaves.push(...collectLeaves(value, childPrefix));
    } else if (typeof value === "object" && value !== null && value.type) {
      leaves.push({
        path: childPrefix,
        type: value.type,
        detail: value.detail || "",
      });
    }
  }
  return leaves;
}

/**
 * Expand a wildcard branch with concrete alias/key values.
 */
function expandWildcard(shape, wildcardValues, root) {
  const results = [];
  const wildcardShape = shape.__WILDCARD__;
  if (!wildcardShape) return results;

  for (const { alias, label } of wildcardValues) {
    const childLeaves = collectLeaves(wildcardShape, "");
    for (const leaf of childLeaves) {
      const fullPath = `state.${root}.${alias}.${leaf.path}`;
      results.push({
        label: `{{${fullPath}}}`,
        value: `{{${fullPath}}}`,
        detail: leaf.detail || `${label} ${leaf.path}`,
      });
    }
  }

  return results;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate template expression suggestions for use in `{{ }}` blocks.
 * Produces paths like `{{ state.queries.users.data }}`.
 *
 * @param {object} options
 * @param {Array} options.dataSources - page-level data source configs [{ alias, type }]
 * @param {Array} options.variableDefinitions - page variable definitions [{ key }]
 * @param {string} [options.widgetType] - current widget type for event.* suggestions
 * @param {string} [options.eventType] - current event type for event.* suggestions
 * @returns {Array<{ label: string, value: string, detail: string }>}
 */
export function getExpressionSuggestions({ dataSources = [], variableDefinitions = [], widgetType, eventType } = {}) {
  const suggestions = [];

  // ── queries ──
  const queryAliases = dataSources
    .filter((ds) => ds.type !== "workflow" && ds.alias)
    .map((ds) => ({ alias: ds.alias, label: ds.alias }));
  suggestions.push(
    ...expandWildcard(STATE_TREE_SHAPE.queries, queryAliases, "queries")
  );

  // ── workflows ──
  const workflowAliases = dataSources
    .filter((ds) => ds.type === "workflow" && ds.alias)
    .map((ds) => ({ alias: ds.alias, label: ds.alias }));
  suggestions.push(
    ...expandWildcard(STATE_TREE_SHAPE.workflows, workflowAliases, "workflows")
  );

  // ── variables ──
  for (const def of variableDefinitions) {
    if (def.key) {
      suggestions.push({
        label: `{{state.variables.${def.key}}}`,
        value: `{{state.variables.${def.key}}}`,
        detail: "page variable",
      });
    }
  }

  // ── event.* ──
  const eventArgs = getEventArgs(widgetType, eventType);
  for (const arg of eventArgs) {
    const fullPath = `state.${arg.key}`;
    suggestions.push({
      label: `{{${fullPath}}}`,
      value: `{{${fullPath}}}`,
      detail: arg.description,
    });
  }

  // ── globals ──
  for (const g of COMMON_GLOBALS) {
    suggestions.push({
      label: `{{${g.key}}}`,
      value: `{{${g.key}}}`,
      detail: g.detail,
    });
  }

  return suggestions;
}

/**
 * Generate alias suggestions for the EXECUTE_QUERY alias field (plain names,
 * no template brackets). These match data source aliases from the page config.
 *
 * @param {Array} dataSources - page-level data source configs [{ alias, type }]
 * @returns {Array<{ label: string, value: string, detail: string }>}
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
 * Generate variable key suggestions for the SET_VARIABLE key field.
 * Uses the `state.variables.` prefix so saved configs are
 * consistent with the namespace convention.
 *
 * @param {Array} variableDefinitions - page variable definitions [{ key }]
 * @returns {Array<{ label: string, value: string, detail: string }>}
 */
export function getVariableKeySuggestions(variableDefinitions = []) {
  const suggestions = [];
  const existing = new Set();

  for (const def of variableDefinitions) {
    if (def.key && !existing.has(def.key)) {
      existing.add(def.key);
      suggestions.push({
        label: `state.variables.${def.key}`,
        value: `state.variables.${def.key}`,
        detail: "page variable",
      });
    }
  }

  for (const common of COMMON_PAGINATION_VARIABLES) {
    if (!existing.has(common)) {
      suggestions.push({
        label: `state.variables.${common}`,
        value: `state.variables.${common}`,
        detail: "pagination",
      });
    }
  }

  return suggestions;
}

/**
 * Generate widget ID suggestions for CALL_WIDGET_METHOD targetWidgetID field.
 * Filters to widgets placed on the current page.
 *
 * @param {Array} widgets - all available widgets [{ widgetID, widgetTitle, widgetType }]
 * @param {object} pageConfig - page config with widgets array
 * @returns {Array<{ label: string, value: string, detail: string }>}
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
 * Generate method suggestions for the CALL_WIDGET_METHOD methodName field,
 * based on the target widget's type.
 *
 * @param {string} targetWidgetID - ID of the target widget
 * @param {Array} widgets - all available widgets [{ widgetID, widgetType }]
 * @returns {Array<{ label: string, value: string, detail: string }>}
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

// ─── Live State Tree Introspection ──────────────────────────────────────────

/**
 * Recursively walk the live state tree to discover variables and their types.
 * @param {object} obj - The state tree to walk
 * @param {string} prefix - The current path prefix (e.g., 'state')
 * @param {number} depth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {Array<{ value: string, path: string, valueType: string, rawValue: any, detail: string }>}
 */
export function getSuggestionsFromStateTree(obj, prefix = "state", depth = 0, maxDepth = 4) {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("__")) continue;
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    let valueType = typeof val;
    let detail = "";

    if (val === null) {
      valueType = "null";
      detail = "null";
    } else if (val === undefined) {
      valueType = "undefined";
      detail = "undefined";
    } else if (Array.isArray(val)) {
      valueType = "array";
      if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
        detail = `Array[${val.length}] (fields: ${Object.keys(val[0]).slice(0, 3).join(', ')})`;
      } else {
        detail = `Array[${val.length}]`;
      }
    } else if (typeof val === "boolean") {
      valueType = "boolean";
      detail = `= ${val}`;
    } else if (typeof val === "number") {
      valueType = "number";
      detail = `= ${val}`;
    } else if (typeof val === "string") {
      valueType = "string";
      detail = `"${val.slice(0, 20)}${val.length > 20 ? '...' : ''}"`;
    } else if (typeof val === "object") {
      valueType = "object";
      const keys = Object.keys(val);
      if (keys.length > 0) {
        detail = `Object { ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''} }`;
      } else {
        detail = "Object {}";
      }
    }

    results.push({
      value: fullPath,
      path: fullPath,
      valueType,
      rawValue: val,
      detail,
    });

    if (val && typeof val === "object" && !Array.isArray(val)) {
      const childSuggestions = getSuggestionsFromStateTree(val, fullPath, depth + 1, maxDepth);
      for (let i = 0; i < childSuggestions.length; i++) {
        results.push(childSuggestions[i]);
      }
    }
  }
  return results;
}
