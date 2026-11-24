/**
 * App Page V2 config validator — pure, no network.
 * Catches the structure that the backend accepts but the runtime then fails on.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const WIDGET_KEY_RE = /^widget_([0-9a-f-]{36})_.+$/i;
const NODE_TYPES = ['column', 'row', 'widget', 'container', 'stack', 'z-stack'];

function err(path, code, message, fix, suggestion) { return { path, code, message, fix, suggestion }; }
function warn(path, code, message, fix) { return { path, code, message, fix }; }
function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

export function validateAppPageConfig(config) {
  const errors = [];
  const warnings = [];
  if (!isObject(config)) {
    return { valid: false, errors: [err('appPageConfig', 'CONFIG_REQUIRED', 'appPageConfig must be an object.', 'Use {layoutVersion:2, layout:{...}, widgets:[], dataSources:[], variables:[], layouts:{}}.', 'get_app_page_schema')], warnings, summary: null };
  }

  const layoutVersion = config.layoutVersion;
  if (layoutVersion === undefined) warnings.push(warn('layoutVersion', 'LAYOUT_VERSION_MISSING', 'layoutVersion is missing; V1 may be auto-migrated.', 'Set layoutVersion: 2.'));
  else if (layoutVersion !== 2) errors.push(err('layoutVersion', 'LAYOUT_VERSION_INVALID', 'layoutVersion must be 2 for new pages.', 'Set layoutVersion: 2; use layout (not layouts) for V2.', 'get_app_page_schema'));
  if (config.layouts && isObject(config.layouts) && Object.keys(config.layouts).length > 0) warnings.push(warn('layouts', 'LEGACY_LAYOUTS_PRESENT', 'V2 pages must keep layouts empty; use layout.', 'Move content into layout and set layouts:{}.'));
  if (config._legacyLayouts !== undefined) warnings.push(warn('_legacyLayouts', 'LEGACY_FIELD_PRESENT', '_legacyLayouts is internal; do not set it.', 'Remove the field.'));

  const widgets = config.widgets;
  if (!Array.isArray(widgets)) errors.push(err('widgets', 'WIDGETS_REQUIRED', 'widgets must be an array of instance keys.', 'Use ["widget_<widgetID>_1"].', 'get_app_page_schema'));
  else {
    const seen = new Set();
    widgets.forEach((k, i) => {
      if (typeof k !== 'string' || !WIDGET_KEY_RE.test(k)) errors.push(err(`widgets[${i}]`, 'WIDGET_KEY_INVALID', `Invalid widget instance key ${JSON.stringify(k)}.`, 'Format: widget_<widgetID>_<uniqueSuffix> (widgetID must be a UUID).', 'get_app_page_schema'));
      else if (seen.has(k)) errors.push(err(`widgets[${i}]`, 'WIDGET_KEY_DUPLICATE', `Duplicate widget instance key ${k}.`, 'Use a unique suffix per placement.', 'get_app_page_schema'));
      else seen.add(k);
    });
  }

  const dataSources = config.dataSources;
  if (dataSources !== undefined) {
    if (!Array.isArray(dataSources)) errors.push(err('dataSources', 'DATASOURCES_INVALID', 'dataSources must be an array.', 'Use [{alias,type,queryID|workflowID|listenerID,triggerMode,refreshOn}].', 'get_app_page_schema'));
    else {
      const aliases = new Set();
      dataSources.forEach((ds, i) => {
        const p = `dataSources[${i}]`;
        if (!isObject(ds)) { errors.push(err(p, 'DATASOURCE_NOT_OBJECT', 'Data source must be an object.', 'Use {alias,type,...}.', 'get_app_page_schema')); return; }
        if (typeof ds.alias !== 'string' || !KEY_RE.test(ds.alias)) errors.push(err(`${p}.alias`, 'ALIAS_INVALID', 'alias must be alphanumeric/underscore and start with a letter.', 'Use users_list.', 'get_app_page_schema'));
        else if (aliases.has(ds.alias)) errors.push(err(`${p}.alias`, 'ALIAS_DUPLICATE', `Duplicate data source alias ${ds.alias}.`, 'Use a unique alias.', 'get_app_page_schema'));
        else aliases.add(ds.alias);
        if (!['query', 'workflow', 'listener'].includes(ds.type)) errors.push(err(`${p}.type`, 'DATASOURCE_TYPE_INVALID', 'Data source type must be query, workflow, or listener.', 'Use query.', 'get_app_page_schema'));
        if (ds.type === 'query' && !UUID_RE.test(String(ds.queryID || ''))) errors.push(err(`${p}.queryID`, 'QUERY_ID_INVALID', 'query data source requires a query UUID.', 'Find it with list_queries.', 'list_queries'));
        if (ds.type === 'workflow' && !UUID_RE.test(String(ds.workflowID || ''))) errors.push(err(`${p}.workflowID`, 'WORKFLOW_ID_INVALID', 'workflow data source requires a workflow UUID.', 'Find it with list_workflows.', 'list_workflows'));
        if (ds.type === 'listener' && !UUID_RE.test(String(ds.listenerID || ''))) errors.push(err(`${p}.listenerID`, 'LISTENER_ID_INVALID', 'listener data source requires a listener UUID.', 'Find it with list_listeners.', 'list_listeners'));
        if (ds.triggerMode !== undefined && !['auto', 'reactive', 'manual'].includes(ds.triggerMode)) errors.push(err(`${p}.triggerMode`, 'TRIGGER_MODE_INVALID', 'triggerMode must be auto, reactive, or manual.', 'Use auto for on-load sources.', 'get_app_page_schema'));
        if (ds.refreshOn !== undefined && !Array.isArray(ds.refreshOn)) errors.push(err(`${p}.refreshOn`, 'REFRESH_ON_INVALID', 'refreshOn must be an array of variable keys.', 'Use [].', 'get_app_page_schema'));
      });
    }
  }

  const variables = config.variables;
  if (variables !== undefined) {
    if (!Array.isArray(variables)) errors.push(err('variables', 'VARIABLES_INVALID', 'variables must be an array.', 'Use [{key,type,defaultValue}].', 'get_app_page_schema'));
    else {
      const keys = new Set();
      variables.forEach((v, i) => {
        const p = `variables[${i}]`;
        if (!isObject(v)) { errors.push(err(p, 'VARIABLE_NOT_OBJECT', 'Variable must be an object.', 'Use {key,type,defaultValue}.', 'get_app_page_schema')); return; }
        if (typeof v.key !== 'string' || !KEY_RE.test(v.key)) errors.push(err(`${p}.key`, 'VARIABLE_KEY_INVALID', 'Variable key must be alphanumeric/underscore.', 'Use statusFilter.', 'get_app_page_schema'));
        else if (keys.has(v.key)) errors.push(err(`${p}.key`, 'VARIABLE_KEY_DUPLICATE', `Duplicate variable key ${v.key}.`, 'Use a unique key.', 'get_app_page_schema'));
        else keys.add(v.key);
        if (!['string', 'number', 'boolean', 'object', 'array'].includes(v.type)) errors.push(err(`${p}.type`, 'VARIABLE_TYPE_INVALID', 'Variable type must be string, number, boolean, object, or array.', 'Use string.', 'get_app_page_schema'));
        if (v.type && v.defaultValue !== undefined) {
          const ok = (v.type === 'string' && typeof v.defaultValue === 'string') ||
            (v.type === 'number' && typeof v.defaultValue === 'number') ||
            (v.type === 'boolean' && typeof v.defaultValue === 'boolean') ||
            (v.type === 'object' && isObject(v.defaultValue)) ||
            (v.type === 'array' && Array.isArray(v.defaultValue));
          if (!ok) errors.push(err(`${p}.defaultValue`, 'VARIABLE_DEFAULT_MISMATCH', `defaultValue does not match type ${v.type}.`, 'Use "" / 0 / false / {} / [].', 'get_app_page_schema'));
        }
      });
    }
  }

  const layout = config.layout;
  if (!isObject(layout)) errors.push(err('layout', 'LAYOUT_REQUIRED', 'layout must be a V2 tree object.', 'Use {id:"ROOT",type:"column",children:[]}.', 'get_app_page_schema'));
  else {
    if (layout.type !== 'column') errors.push(err('layout.type', 'LAYOUT_ROOT_NOT_COLUMN', 'The V2 layout root must be a column node.', 'Change layout.type to "column"; the root is always column.', 'get_app_page_schema'));
    const nodeIDs = new Set();
    const placed = new Set();
    walkLayout(layout, 'layout', 0, { errors, warnings, nodeIDs, placed, widgets: Array.isArray(widgets) ? widgets : [] });
    if (Array.isArray(widgets)) {
      for (const k of widgets) if (!placed.has(k)) warnings.push(warn(`widgets`, 'WIDGET_NOT_PLACED', `Widget instance ${k} is in widgets[] but no layout node references it.`, 'Add a widget node with widgetKey or remove it from widgets[].'));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      layoutVersion: layoutVersion ?? null,
      widgetCount: Array.isArray(widgets) ? widgets.length : 0,
      dataSourceCount: Array.isArray(dataSources) ? dataSources.length : 0,
      variableCount: Array.isArray(variables) ? variables.length : 0,
      rootType: layout?.type ?? null,
    },
  };
}

function walkLayout(node, path, depth, ctx) {
  if (depth > 12) { ctx.errors.push(err(path, 'LAYOUT_TOO_DEEP', 'Layout nesting exceeds 12 levels.', 'Flatten the layout.', 'get_app_page_schema')); return; }
  if (!isObject(node)) { ctx.errors.push(err(path, 'LAYOUT_NODE_NOT_OBJECT', 'Layout node must be an object.', 'Use {id,type,...}.', 'get_app_page_schema')); return; }
  if (typeof node.id !== 'string' || !node.id) ctx.errors.push(err(`${path}.id`, 'LAYOUT_NODE_ID_REQUIRED', 'Layout node needs an id.', 'Use row_1 / slot_1.', 'get_app_page_schema'));
  else if (ctx.nodeIDs.has(node.id)) ctx.errors.push(err(`${path}.id`, 'LAYOUT_NODE_ID_DUPLICATE', `Duplicate layout node id ${node.id}.`, 'Use a unique id.', 'get_app_page_schema'));
  else ctx.nodeIDs.add(node.id);
  if (!NODE_TYPES.includes(node.type)) { ctx.errors.push(err(`${path}.type`, 'LAYOUT_NODE_TYPE_INVALID', `Layout node type must be one of: ${NODE_TYPES.join(', ')}.`, 'Use row/widget/column.', 'get_app_page_schema')); return; }
  if (node.condition !== undefined && typeof node.condition !== 'string') ctx.errors.push(err(`${path}.condition`, 'CONDITION_NOT_STRING', 'condition must be a string expression.', 'Use "{{ state.variables.x === \'y\' }}".', 'validate_expression'));

  if (node.type === 'widget') {
    if (typeof node.widgetKey !== 'string' || !node.widgetKey) ctx.errors.push(err(`${path}.widgetKey`, 'WIDGET_KEY_REQUIRED', 'widget node requires widgetKey.', 'Use a key from widgets[].', 'get_app_page_schema'));
    else {
      ctx.placed.add(node.widgetKey);
      if (ctx.widgets.length && !ctx.widgets.includes(node.widgetKey)) ctx.errors.push(err(`${path}.widgetKey`, 'WIDGET_KEY_NOT_REGISTERED', `${node.widgetKey} is not in page widgets[].`, 'Add it to widgets[].', 'get_app_page_schema'));
    }
    if (!(Number.isInteger(node.span) && node.span >= 1 && node.span <= 12)) ctx.errors.push(err(`${path}.span`, 'SPAN_INVALID', 'widget span must be an integer 1-12.', 'Use 12 or 6.', 'get_app_page_schema'));
    if (node.sizing !== undefined && !['auto', 'fill', 'fixed'].includes(node.sizing)) ctx.errors.push(err(`${path}.sizing`, 'SIZING_INVALID', 'sizing must be auto, fill, or fixed.', 'Use fill.', 'get_app_page_schema'));
    if (node.children !== undefined) ctx.errors.push(err(`${path}.children`, 'WIDGET_HAS_CHILDREN', 'widget nodes cannot have children.', 'Wrap it in a row/container.', 'get_app_page_schema'));
    return;
  }

  if (!Array.isArray(node.children)) { ctx.errors.push(err(`${path}.children`, 'CHILDREN_REQUIRED', `${node.type} node requires children[].`, 'Add children or remove the container.', 'get_app_page_schema')); return; }
  if (node.type === 'row') {
    let total = 0;
    for (const c of node.children) if (Number.isInteger(c?.span)) total += c.span;
    if (node.children.length && total !== 12) ctx.warnings.push(warn(`${path}.children`, 'ROW_SPANS_NOT_12', `Row child spans sum to ${total}, expected 12.`, 'Adjust spans so they total 12.'));
  }
  if (node.type === 'stack' && node.direction !== undefined && !['horizontal', 'vertical'].includes(node.direction)) ctx.errors.push(err(`${path}.direction`, 'STACK_DIRECTION_INVALID', 'stack direction must be horizontal or vertical.', 'Use horizontal.', 'get_app_page_schema'));
  if (node.type === 'z-stack' && node.layerOpacities !== undefined && (!Array.isArray(node.layerOpacities) || node.layerOpacities.length !== node.children.length)) ctx.errors.push(err(`${path}.layerOpacities`, 'LAYER_OPACITIES_INVALID', 'layerOpacities must be an array matching children length.', 'Provide one opacity per child.', 'get_app_page_schema'));
  node.children.forEach((c, i) => walkLayout(c, `${path}.children[${i}]`, depth + 1, ctx));
}
