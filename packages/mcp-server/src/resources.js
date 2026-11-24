/**
 * resources.js — concise MCP resources + prompts.
 * These are the "map" an LLM needs before it can use the tools reliably.
 */
import { z } from 'zod';
import { getAllNodeContracts } from './data/nodeContracts.js';
import { GENERATED_DATASOURCE_TYPES, GENERATED_WIDGET_TYPES } from './data/catalogs.js';
import { LISTENER_ACTION_TYPES } from './validation/listener.js';

const ARCHITECTURE = `# Jet Admin — MCP Map

All API calls are tenant-scoped: /api/v1/tenants/{tenantID}/...

## Core objects
- Datasource (connection) -> DataQuery (SQL/REST config) -> Widget -> App Page.
- Workflow = DAG of nodes/edges; execution creates an instance + append-only log + contextData.
- Listener = connection + ordered pipeline actions (transform / trigger_workflow / trigger_query / save_to_buffer / push_to_app_page).
- CronJob = schedule + workflowID.
- Folder organizes widgets/workflows/queries/cronJobs/appPages/listeners/datasources.
- IAM: roles -> permissions (tenant:<module>:<action>); API keys are scoped to roles.

## Canonical flows
1. Data: get_tenant_resource_summary -> get_datasource_schema -> test_query_by_data -> create_query -> run_query.
2. UI: create_widget -> create_app_page (V2 layout + dataSources) -> get_app_page (verify).
3. Automation: describe_node_type/validate_workflow -> create_workflow -> execute_workflow (waitSeconds) -> get_workflow_instance.
4. Human-in-loop: dataCollection/approval node -> instance.pendingDataCollectionRequests -> get_data_collection_request -> submit_data_collection_request.
5. Streaming: list_listener_action_types -> validate_listener -> create_listener -> add_listener_action -> activate_listener.
6. Schedule: create_cronJob (disabled while testing) -> get_cronJob.

## Non-negotiable conventions
- IDs are UUIDs. Node/edge ids must be UUIDs; use crypto.randomUUID().
- create vs update: updates replace the documented object (appPageConfig, nodes/edges, query options), so read -> modify -> send complete object.
- Workflow inputParams land at ctx.input.<name>; query inputs use {{inputs.<name>}}.
- Never trust "COMPLETED" alone: a condition can silently take the default branch. Check contextData/output.
- Run validate_workflow / validate_app_page / validate_form_schema / validate_listener before writing.
- All destructive tools are permanent; confirm with the user first.`;

const BINDINGS = `# Binding / expression syntax

## safe-path (backend: queries, workflow nodes, listener inputValues)
- Delimiters {{ }}.
- Paths only: {{ctx.foo}}, {{ctx.rows[0].name}}, {{inputs.id}}, {{ctx["a-b"]}}.
- Roots: ctx, inputs, args, event (context-dependent).
- JS inside {{ }} is NOT evaluated: {{ctx.x > 0 ? "a" : "b"}} resolves to undefined.
- Whole-block type is preserved (object/array/number); mixed text interpolates.
- Blocked segments: __proto__, prototype, constructor.

## js-template (frontend: app pages / widgets)
- state tree: state.queries.<alias>.data, state.workflows.<alias>.data,
  state.listeners.<alias>.data, state.variables.<key>, state.widgets.<id>.value.
- JS is allowed in app-page templates but risky: && and != null can render blank.
- Prefer ternary, ||, optional chaining, arr.length, Math.round/JSON.stringify.
- URL path params: encodeURIComponent(...).

## condition-js (condition/switch branch expressions)
- RAW JavaScript with ctx in scope, NOT mustache: ctx.input.route === "a".
- {{ctx.input.route}} here is wrong.
- Condition runtime shape: branches[{id,name,conditions:[{operator,leftValue,rightValue}],conditionLogic}].
- Switch runtime shape: switchValue + cases[{id,label,operator,matchValue}].
- Edge sourceHandle = branch/case id; fallback = "default".

## Common mistakes
- Workflow inputParams: use ctx.input.<name> (not ctx.<name>).
- join.sourceVariables = bare names ["a","b"] (not templates).
- subWorkflow: use inputMapping (inputValues is silently ignored).
- Listener trigger_workflow/query: use inputValues (not inputMapping).`;

function workflowNodesDoc() {
  const rows = getAllNodeContracts().map((c) => {
    const handles = Array.isArray(c.handles)
      ? c.handles.join(', ')
      : `${c.handles.dynamic} ids${c.handles.fallback ? ` + ${c.handles.fallback}` : ''}`;
    return `### ${c.nodeType} (${c.label})
- required: ${c.required.length ? c.required.join(', ') : 'none'}
- handles: ${handles}
- output: ${c.output || '(see schema)'}
- ${c.semantics || ''}
${c.pitfalls.length ? c.pitfalls.map((p) => `- PITFALL: ${p}`).join('\n') : ''}`;
  }).join('\n\n');
  return `# Workflow node contracts\n\n13 implemented types. Use describe_node_type for the full JSON schema/defaults.\n\n${rows}`;
}

const FORMS = `# Forms & JSON Schema

## Form widget (UI form, not JSON Schema)
widgetType "form": { fields:[{ key, label, type, required, options?, defaultValue? }], submitLabel?, layout?, columns?, size?, showReset? }
- field.type accepts text, number, email, password, textarea, select, multi-select, checkbox, radio, date, button (backend accepts button though some schemas omit it).
- Draft state: state.widgets.<id>.values; submit events run widget event actions.

## dataCollection node (human-in-the-loop, JSON Schema)
- config: collectionType:"form", title, description, formSchema, formUischema?, outputVariable, expiryMinutes.
- formSchema: JSON Schema object; backend validates submissions with Ajv + ajv-formats (strict:false, allErrors:true).
- formUischema: JSON Forms { type:"VerticalLayout", elements:[{type:"Control",scope:"#/properties/<key>"}] }.
- The platform /workflows/schemas omits dataCollection; use describe_node_type("dataCollection").
- Submission: GET the pending request, then submit_data_collection_request({collectionRequestID, formData:{...}}).
  formData is wrapped as submittedData by the MCP; required fields must match formSchema.

## approval node
- Fixed form: { decision: "approve"|"reject", comment?: string }.
- requireComment, expiryMinutes, onTimeout "expired"|"fail". approvers is display-only.`;

const LISTENERS = `# Listener pipeline

Action order: orderIndex, then actionID. Transform errors abort the pipeline; dispatch errors continue.
unknown actionType values are accepted by the API but silently ignored at runtime — validate first.

${LISTENER_ACTION_TYPES.map((t) => `- ${t}`).join('\n')}

- transform: actionConfig.script runs in an isolated VM with event in scope; return event to keep, null/undefined to drop.
- trigger_workflow: { workflowID, inputValues:{ key:"{{event.field}}" } }.
- trigger_query: { dataQueryID, inputValues }.
- save_to_buffer: { bufferName, retentionPolicy:"count"|"time"|"both", maxEvents, maxAgeHours }.
- push_to_app_page: { appPageID, channelName, maxArrayLength }.
- Webhook config: prefer pathSuffix ("/my-hook"); path is documented as an alias but has produced endpointPath:null.
- create_listener requires a datasourceID of a listener-capable type. Creation does not activate it.
- No action label field; prove updates via actionConfig.`;

const PERMISSIONS = `# Permissions

- Permission keys: tenant:<module>:<action> (e.g. tenant:workflow:read, tenant:workflow:execute).
- Modules: ai, apikey, appPage, application, audit, bundle, cronjob, dataquery, datasource, folder, listener, marketplace, permission, role, tenant, user, widget, widgetLibrary, workflow.
- Seeded roles: TenantManager, TenantViewer, RoleManager, RoleViewer, UserManager, UserViewer, QueryCreator, QueryEditor, QueryRunner, WorkflowManager, WidgetManager, DatasourceManager, AppPageManager, ListenerManager, CronJobManager, FolderManager, ApiKeyManager, AuditViewer, AIManager, ADMIN.
- Cross-resource requirements are common: moving entities needs folder.update + <entity>.update; workflow test/execute may need dataquery.execute/workflow.execute.
- 401 = bad/absent API key; 403 = Casbin permission denied — fix the role, not by retrying.
- list_permissions returns duplicate rows; the MCP dedupes by key and supports search.`;

function registerResource(server, name, uri, title, description, text) {
  server.registerResource(
    name,
    uri,
    { title, description, mimeType: 'text/markdown' },
    async (requested) => ({
      contents: [{ uri: requested.href, mimeType: 'text/markdown', text }],
    })
  );
}

export function registerResources(server) {
  registerResource(server, 'architecture', 'jetadmin://docs/architecture', 'Jet Admin architecture map', 'Module map, canonical flows, conventions and pitfalls.', ARCHITECTURE);
  registerResource(server, 'bindings', 'jetadmin://docs/bindings', 'Binding and expression syntax', 'safe-path vs js-template vs condition-js, roots, examples and mistakes.', BINDINGS);
  registerResource(server, 'workflow-nodes', 'jetadmin://docs/workflow-nodes', 'Workflow node contracts', 'Required config, handles, output and pitfalls for all 13 node types.', workflowNodesDoc());
  registerResource(server, 'forms', 'jetadmin://docs/forms', 'Forms and JSON Schema', 'Form widget fields, dataCollection JSON Schema, approval and submission.', FORMS);
  registerResource(server, 'listeners', 'jetadmin://docs/listeners', 'Listener pipeline actions', 'Action types, config keys, ordering and webhook paths.', LISTENERS);
  registerResource(server, 'permissions', 'jetadmin://docs/permissions', 'Permissions and roles', 'Permission key format, seeded roles, cross-resource rules and 401/403.', PERMISSIONS);

  server.registerPrompt(
    'build_workflow',
    {
      title: 'Build and verify a workflow',
      description: 'Plan, validate, create, execute and inspect a Jet Admin workflow.',
      argsSchema: { goal: z.string().describe('What the workflow should do.') },
    },
    async ({ goal }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Build this workflow: ${goal}\n\n` +
            `Use only MCP tools. Sequence:\n` +
            `1. describe_node_type for each node you plan to use; list_workflows to reuse queries/workflows.\n` +
            `2. create any required data query first (create_query -> run_query).\n` +
            `3. validate_workflow with complete nodes/edges; fix every error.\n` +
            `4. create_workflow; then execute_workflow with inputValues and waitSeconds:20.\n` +
            `5. get_workflow_instance; verify status AND contextData/output. A COMPLETED run can still take a wrong branch.\n` +
            `Report the workflowID, instanceID, status, and the relevant context values.`,
        },
      }],
    })
  );

  server.registerPrompt(
    'debug_workflow_run',
    {
      title: 'Debug a failed workflow run',
      description: 'Inspect a run, identify the failing node, fix the workflow and re-run.',
      argsSchema: { instanceID: z.string().describe('Workflow instance UUID.') },
    },
    async ({ instanceID }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Debug workflow instance ${instanceID} using only MCP tools.\n` +
            `1. get_workflow_instance (compact) -> status, errors, failedNode, logs.\n` +
            `2. get_workflow for the workflowID -> map nodeID to title/type.\n` +
            `3. Explain the exact failing node and message. Do not guess.\n` +
            `4. Fix only the faulty config, then validate_workflow and update_workflow.\n` +
            `5. execute_workflow with waitSeconds and verify the new run is COMPLETED with the expected contextData.`,
        },
      }],
    })
  );
}

export const CATALOG_COUNTS = {
  datasourceTypes: GENERATED_DATASOURCE_TYPES.length,
  widgetTypes: GENERATED_WIDGET_TYPES.length,
  workflowNodes: getAllNodeContracts().length,
};
