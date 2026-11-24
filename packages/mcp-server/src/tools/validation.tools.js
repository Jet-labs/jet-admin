/**
 * validation.tools.js — dry-run validators. No writes.
 * These exist because the platform accepts several invalid graphs/configs and
 * only fails later at runtime (or silently takes a default branch).
 */
import { createApiClient } from '../client.js';
import { trimId } from '../utils.js';
import { validateWorkflowGraph, normalizeWorkflowGraph } from '../validation/workflow.js';
import { validateAppPageConfig } from '../validation/appPage.js';
import { validateFormSchema } from '../validation/form.js';
import { validateExpression } from '../validation/expression.js';
import { validateListener, LISTENER_ACTION_TYPES, LISTENER_CAPABLE_TYPES } from '../validation/listener.js';

function nextStep(result) {
  if (result.valid) return 'Validation passed. You can now create/update the resource.';
  return 'Fix the listed errors, then re-run this validator. Do not create/update until valid=true.';
}

export const validationTools = [
  {
    name: 'validate_workflow',
    description:
      'Validate a workflow DAG BEFORE create_workflow/update_workflow. No writes.\n\n' +
      'Checks: UUID ids, duplicate ids, valid node types, required node config, condition/switch/fanout ids, ' +
      'edge endpoints, per-node output handles (condition branch ids, switch case ids, loop loop/completed, ' +
      'join output, dataQuery success/error), start/end presence, reachability, and cycles (only loop cycles allowed).\n\n' +
      'Returns: { valid, errors:[{path,code,message,fix,suggestion}], warnings, summary }.\n' +
      'Pass either {nodes,edges} or {workflowID} to validate a stored workflow.\n\n' +
      'Example: { "nodes": [{ "id": "<uuid>", "type": "start", "data": {} }, ...], "edges": [...] }\n\n' +
      'Related: describe_node_type, create_workflow, update_workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        nodes: { type: 'array', items: { type: 'object' }, description: 'Workflow nodes [{id,type,data}].' },
        edges: { type: 'array', items: { type: 'object' }, description: 'Workflow edges [{id,source,target,sourceHandle}].' },
        workflowID: { type: 'string', description: 'Optional: validate a stored workflow instead of inline nodes/edges.' },
      },
    },
    handler: async ({ nodes, edges, workflowID }, context) => {
      const hasInline = nodes !== undefined || edges !== undefined;
      if (workflowID && !hasInline) {
        const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
        const res = await workflowAPI.getById(trimId(workflowID, 'workflowID'));
        const raw = res?.workflow ?? res;
        const { nodes: n, edges: e } = normalizeWorkflowGraph(raw?.tblWorkflowNodes || raw?.nodes, raw?.tblWorkflowEdge || raw?.edges);
        const result = validateWorkflowGraph({ nodes: n, edges: e });
        return { source: 'stored', workflowID, ...result, next: nextStep(result) };
      }
      const result = validateWorkflowGraph({ nodes, edges });
      return {
        source: 'inline',
        ...(workflowID ? { note: 'workflowID was ignored because inline nodes/edges were provided.' } : {}),
        ...result,
        next: nextStep(result),
      };
    },
  },
  {
    name: 'validate_app_page',
    description:
      'Validate an App Page V2 config BEFORE create_app_page/update_app_page. No writes.\n\n' +
      'Checks: layoutVersion=2, root must be a column node, legal node types, widgetKey exists in widgets[], ' +
      'unique node ids, widget span 1-12, row span sum=12 (warning), data source aliases/types/IDs, triggerMode, ' +
      'variable types/defaults, and layout tree depth.\n\n' +
      'Returns: { valid, errors:[{path,code,message,fix,suggestion}], warnings, summary }.\n' +
      'Pass either {appPageConfig} or {appPageID} to validate a stored page.\n\n' +
      'Related: get_app_page_schema, create_app_page, update_app_page.',
    inputSchema: {
      type: 'object',
      properties: {
        appPageConfig: { type: 'object', description: 'The full page config to validate.' },
        appPageID: { type: 'string', description: 'Optional: validate a stored page instead.' },
      },
    },
    handler: async ({ appPageConfig, appPageID }, context) => {
      if (appPageID) {
        const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
        const res = await appPageAPI.getById(trimId(appPageID, 'appPageID'));
        const page = res?.appPage ?? res;
        const result = validateAppPageConfig(page?.appPageConfig ?? {});
        return { source: 'stored', appPageID, ...result, next: nextStep(result) };
      }
      const result = validateAppPageConfig(appPageConfig);
      return { source: 'inline', ...result, next: nextStep(result) };
    },
  },
  {
    name: 'validate_form_schema',
    description:
      'Validate a JSON Schema + optional JSON Forms UISchema for a dataCollection node or form widget. No writes.\n\n' +
      'Checks: type=object, properties, required entries exist, property types/enums, array items, object properties, ' +
      'UISchema Control scopes reference real properties. The backend validates submitted data with Ajv later, so ' +
      'this catches authoring errors before a run suspends.\n\n' +
      'Returns: { valid, errors, warnings, summary }.\n\n' +
      'Example: { "schema": { "type":"object", "properties": { "name": {"type":"string"} }, "required":["name"] } }\n\n' +
      'Related: describe_node_type (dataCollection), validate_workflow, submit_data_collection_request.',
    inputSchema: {
      type: 'object',
      properties: {
        schema: { type: 'object', description: 'JSON Schema (type object).' },
        uischema: { type: 'object', description: 'Optional JSON Forms UISchema.' },
      },
      required: ['schema'],
    },
    handler: async ({ schema, uischema }) => {
      const result = validateFormSchema({ schema, uischema });
      return { ...result, next: nextStep(result) };
    },
  },
  {
    name: 'validate_expression',
    description:
      'Validate a binding/template expression before using it. No writes.\n\n' +
      'Modes:\n' +
      '  safe-path (default): backend query/workflow/listener templates. ONLY paths like {{ctx.input.route}}, {{inputs.id}}, {{ctx.rows[0].name}}; JS is rejected.\n' +
      '  js-template: app-page/widget expressions over state/event; JS allowed but blocked globals and risky operators are flagged.\n' +
      '  condition-js: condition/switch branch expressions. These are RAW JS with ctx in scope (e.g. ctx.input.route === "a"), NEVER {{...}}.\n\n' +
      'Returns: { valid, errors, warnings, summary }.\n\n' +
      'Related: get_workflow_schema, describe_node_type, get_widget_schemas.',
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string', description: 'Expression or template to validate.' },
        mode: { type: 'string', enum: ['safe-path', 'js-template', 'condition-js'], description: 'Evaluation mode (default safe-path).' },
        allowedRoots: { type: 'array', items: { type: 'string' }, description: 'Optional allowed roots (defaults per mode).' },
      },
      required: ['template'],
    },
    handler: async ({ template, mode, allowedRoots }) => {
      const result = validateExpression({ template, mode, allowedRoots });
      return { ...result, next: nextStep(result) };
    },
  },
  {
    name: 'validate_listener',
    description:
      'Validate a listener config and pipeline actions before create_listener/add_listener_action. No writes.\n\n' +
      'Checks: listener-capable type, datasource UUID, webhook pathSuffix vs path, and every action: transform script, ' +
      'trigger_workflow inputValues, trigger_query inputValues, save_to_buffer retention, push_to_app_page channel.\n' +
      'Normalizes legacy {type,config} to {actionType,actionConfig}.\n\n' +
      'Returns: { valid, errors, warnings, normalizedActions, summary }.\n' +
      'Pass either inline config or {listenerID} to validate a stored listener.\n\n' +
      'Related: list_listener_action_types, get_listener_schemas, add_listener_action.',
    inputSchema: {
      type: 'object',
      properties: {
        listenerType: { type: 'string', description: 'One of the listener-capable datasource types.' },
        datasourceID: { type: 'string', description: 'Datasource UUID of matching type.' },
        listenerConfig: { type: 'object', description: 'Connection config (e.g. {pathSuffix:"/hook"}).' },
        actions: { type: 'array', items: { type: 'object' }, description: 'Pipeline actions [{actionType,actionConfig}].' },
        listenerID: { type: 'string', description: 'Optional: validate a stored listener instead.' },
      },
    },
    handler: async ({ listenerType, datasourceID, listenerConfig, actions, listenerID }, context) => {
      if (listenerID) {
        const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
        const res = await listenerAPI.getById(trimId(listenerID, 'listenerID'));
        const l = res?.listener ?? res;
        const result = validateListener({
          listenerType: l?.listenerType,
          datasourceID: l?.datasourceID,
          listenerConfig: l?.listenerConfig,
          actions: l?.tblListenerActions || l?.actions,
        });
        return { source: 'stored', listenerID, ...result, next: nextStep(result) };
      }
      const result = validateListener({ listenerType, datasourceID, listenerConfig, actions });
      return { source: 'inline', ...result, next: nextStep(result) };
    },
  },
  {
    name: 'list_listener_action_types',
    description:
      'List listener pipeline action types and their config keys.\n\n' +
      'Returns: { totalCount, types:[{actionType, configKeys, requiredKeys, example}] }.\n' +
      'Use before add_listener_action/update_listener_action, then run validate_listener.\n\n' +
      'Related: validate_listener, add_listener_action, get_listener.',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => ({
      totalCount: LISTENER_ACTION_TYPES.length,
      listenerCapableTypes: LISTENER_CAPABLE_TYPES,
      types: [
        { actionType: 'transform', configKeys: ['script'], requiredKeys: ['script'], example: { script: 'return event;' } },
        { actionType: 'trigger_workflow', configKeys: ['workflowID', 'inputValues'], requiredKeys: ['workflowID'], example: { workflowID: '<uuid>', inputValues: { orderID: '{{event.orderID}}' } } },
        { actionType: 'trigger_query', configKeys: ['dataQueryID', 'inputValues'], requiredKeys: ['dataQueryID'], example: { dataQueryID: '<uuid>', inputValues: { id: '{{event.id}}' } } },
        { actionType: 'save_to_buffer', configKeys: ['bufferName', 'retentionPolicy', 'maxEvents', 'maxAgeHours'], requiredKeys: ['bufferName'], example: { bufferName: 'recent_events', retentionPolicy: 'count', maxEvents: 100 } },
        { actionType: 'push_to_app_page', configKeys: ['appPageID', 'channelName', 'maxArrayLength'], requiredKeys: ['appPageID'], example: { appPageID: '<uuid>', channelName: 'live_events' } },
      ],
    }),
  },
];
