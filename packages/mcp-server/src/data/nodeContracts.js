/**
 * nodeContracts.js — curated execution contracts for workflow nodes.
 *
 * Config schemas come from the generated catalog (source: WORKFLOW_NODES_MAP).
 * Handles, output shapes, input scoping and pitfalls come from the runtime
 * handlers in packages/workflow-nodes-logic and the backend validators.
 *
 * Keep this file focused on things a JSON schema cannot express.
 */
import { WORKFLOW_NODE_BY_TYPE } from './catalogs.js';

const ERROR_ENUM = ['fail_workflow', 'continue', 'retry_then_continue', 'retry_then_fail'];

/** Curated schema for nodes the UI package does not export a schema for. */
const DATA_COLLECTION_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Form title shown to the human.' },
    description: { type: 'string', description: 'Optional instructions.' },
    collectionType: { type: 'string', enum: ['form'], default: 'form' },
    fields: { type: 'array', items: { type: 'object' }, description: 'Optional builder field list (UI convenience).' },
    formSchema: { type: 'object', description: 'JSON Schema for the submitted data. Validated with Ajv + ajv-formats (strict:false, allErrors:true).' },
    formUischema: { type: 'object', description: 'Optional JSON Forms UISchema (VerticalLayout/Control scopes).' },
    outputVariable: { type: 'string', pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', default: 'collectedData' },
    expiryMinutes: { type: 'integer', minimum: 0, maximum: 10080, default: 60 },
    errorHandling: { type: 'string', enum: ERROR_ENUM },
    isDisabled: { type: 'boolean' },
  },
  required: ['formSchema'],
};

const CONTRACTS = {
  start: {
    handles: ['output'],
    required: [],
    output: '{ started: true, inputReceived: ctx.input }',
    semantics: 'Exactly one start node is expected. Its outgoing edge normally uses sourceHandle "output" (null also works).',
    pitfalls: ['inputParams declared on the workflow are exposed to nodes as ctx.input.<name>, not ctx.<name>.'],
  },
  end: {
    handles: [],
    required: [],
    output: '{ status, workflowOutput, completedAt }',
    semantics: 'Terminal node. Use status success|failure|cancelled. outputParameters[{ name, sourceVariable }] selects what lands in workflowOutput; sourceVariable supports {{ctx.*}} templates.',
    pitfalls: ['An end node has no outgoing edges.'],
  },
  dataQuery: {
    handles: ['success', 'error'],
    required: ['dataQueryID'],
    output: '{ [outputVariable]: rowsArray, success: true }',
    semantics: 'Runs a saved query. inputValues supports {{ctx.*}} and {{inputs.*}}. Query results are an array of row objects. Default outputVariable is queryResult.',
    pitfalls: [
      'Create the query first; dataQueryID must be a saved query UUID.',
      'inputValues is present in defaultValue but missing from the schema properties in some builds.',
    ],
  },
  javascript: {
    handles: ['success', 'error'],
    required: ['code'],
    output: '{ [outputVariable]: returnedValue, success: true }',
    semantics: 'Code runs in an isolated VM with ctx in scope. Return a value to store it in outputVariable (default scriptResult).',
    pitfalls: ['No require/import/fetch; throw an Error to take the error handle.'],
  },
  condition: {
    handles: { dynamic: 'branches', fallback: 'default' },
    required: ['branches'],
    output: '{ matched: branchId|"default", label, success }',
    semantics:
      'First matching branch wins. Edge sourceHandle MUST equal branch.id; unmatched goes to sourceHandle "default". ' +
      'Runtime branch shape: { id, name, conditionLogic: "AND"|"OR", conditions: [{ operator, leftValue, rightValue }] } ' +
      'or legacy { id, name, conditionType, leftOperand, rightOperand }. ' +
      'Operators: equals, not_equals, contains, not_contains, starts_with, ends_with, greater_than, less_than, greater_or_equal, less_or_equal, is_empty, is_not_empty, matches_regex, expression.',
    pitfalls: [
      'The JSON schema advertises conditionType/leftOperand/rightOperand; the runtime also accepts the conditions[] form above.',
      'Workflow inputParams live at ctx.input.<name>. {{ctx.<name>}} silently resolves to empty and takes the default branch.',
      'A wrongly matched default branch still completes the workflow; inspect output/context, not just status.',
    ],
  },
  switch: {
    handles: { dynamic: 'cases', fallback: 'default' },
    required: ['switchValue', 'cases'],
    output: '{ matched: caseId|"default", label, value, success }',
    semantics: 'Resolves switchValue (usually {{ctx.input.kind}}), then first case whose operator matches. Edge sourceHandle = case.id; fallback "default". cases: [{ id, label, operator, matchValue }]; operator expression evaluates raw JS with ctx.',
    pitfalls: ['cases is only visible in defaultValue in the platform schema.', 'Case ids must be unique.'],
  },
  loop: {
    handles: ['loop', 'completed'],
    required: ['sourceVariable'],
    output: '{ [outputVariable]: bodyOutputs[], totalItems }',
    semantics:
      'sourceVariable is a template resolving to an array (e.g. {{ctx.items}}). The body chain hangs off sourceHandle "loop"; ' +
      'the post-loop path uses "completed". The loop outputVariable collects each body iteration output. itemVariable default item, indexVariable default index.',
    pitfalls: ['If the source is not an array it is wrapped as [value] or treated as empty.', 'maxIterations caps runaway loops (default 1000).'],
  },
  delay: {
    handles: ['output'],
    required: [],
    output: '{ delayedMs }',
    semantics: 'delayType fixed|dynamic|until. Fixed uses delayMs (0-999), delaySeconds (0-59), delayMinutes (0-1440); dynamic uses delayVariable; until uses untilTime. Maximum 24h.',
    pitfalls: ['delayMinutes max 1440.'],
  },
  dataCollection: {
    handles: ['output'],
    required: ['formSchema'],
    output: 'suspends; request.collectionConfig is exposed and submitted data lands in ctx.<outputVariable>',
    schemaOverride: DATA_COLLECTION_SCHEMA,
    semantics:
      'Suspends the run and creates a data-collection request. formSchema is JSON Schema validated by the backend with Ajv (strict:false, allErrors:true); formUischema is optional JSON Forms. ' +
      'Retrieve with get_data_collection_request / instance.pendingDataCollectionRequests; submit with submit_data_collection_request.',
    pitfalls: ['The platform /workflows/schemas omits this node; use this contract.', 'Submitted values must satisfy formSchema required fields.'],
  },
  approval: {
    handles: ['output'],
    required: [],
    output: 'suspends; submitted decision + comment land in ctx.<outputVariable>',
    semantics: 'Fixed form { decision: "approve"|"reject", comment?: string }. Optional requireComment, expiryMinutes, onTimeout expired|fail. Submission uses the same data-collection request API.',
    pitfalls: ['approvers is display-only; authorization is route-level.', 'A rejection still resumes through the output handle unless you branch on decision.'],
  },
  fanout: {
    handles: { dynamic: 'branches' },
    required: ['branches'],
    output: '{ branches: branchIds[], success: true }',
    semantics: 'Fires ALL branches. Edge sourceHandle MUST equal branch.id. Branches execute sequentially in deterministic sorted order. branches: [{ id, name }].',
    pitfalls: ['branches is only visible in defaultValue in the platform schema.', 'Every branch id should have an outgoing edge.'],
  },
  join: {
    handles: ['output'],
    required: ['sourceVariables'],
    output: '{ [outputVariable]: { varName: value, ... } }',
    semantics: 'Waits for upstream variables and merges them. sourceVariables are BARE context names (e.g. ["aResult","bResult"]), not {{ctx.*}} templates. joinMode all|any, requireAll true|false. Outgoing edge sourceHandle MUST be "output".',
    pitfalls: ['Using "success" as the join output handle is rejected at runtime.', 'Templates in sourceVariables produce "missing upstream output(s)" errors.', 'Observed platform flake: a freshly created join barrier can hang with "Activity task timed out: activity StartToClose timeout"; re-saving the identical DAG via update_workflow then re-running has completed it.'],
  },
  subWorkflow: {
    handles: ['success', 'error'],
    required: ['childWorkflowID'],
    output: '{ [outputVariable]: childOutput, childInstanceID?, childStatus? }',
    semantics: 'Starts a child workflow. Use inputMapping to map child input names to templates (e.g. { token: "{{ctx.input.seed}}" }). Child instance is also discoverable via list_workflow_instances (parentInstanceID/parentNodeID).',
    pitfalls: ['inputValues is persisted but silently ignored; use inputMapping.', 'maxDepth guards recursion (default 5).'],
  },
};

export function getNodeContract(type) {
  const generated = WORKFLOW_NODE_BY_TYPE[type];
  const curated = CONTRACTS[type];
  if (!generated && !curated) return null;
  const schema = curated?.schemaOverride || generated?.schema || null;
  return {
    nodeType: type,
    label: generated?.label || type,
    hasSchema: Boolean(schema),
    schema,
    defaults: generated?.defaults || null,
    handles: curated?.handles || ['output'],
    required: curated?.required || [],
    output: curated?.output || null,
    semantics: curated?.semantics || null,
    pitfalls: curated?.pitfalls || [],
  };
}

export function getAllNodeContracts() {
  const types = new Set([...Object.keys(CONTRACTS), ...Object.keys(WORKFLOW_NODE_BY_TYPE)]);
  return [...types].map(getNodeContract).filter(Boolean);
}

/** Returns the static + config-derived handles for a node. */
export function getAllowedHandles(type, data = {}) {
  const c = CONTRACTS[type];
  if (!c) return { allowed: null, dynamic: null, fallback: null };
  if (Array.isArray(c.handles)) return { allowed: c.handles, dynamic: null, fallback: null };
  const dynamicKey = c.handles.dynamic;
  const items = Array.isArray(data?.[dynamicKey]) ? data[dynamicKey] : [];
  const dynamic = items.map((x) => x?.id).filter(Boolean);
  return {
    allowed: [...dynamic, ...(c.handles.fallback ? [c.handles.fallback] : [])],
    dynamic,
    fallback: c.handles.fallback || null,
  };
}

export const NODE_TYPES = Object.keys(CONTRACTS);
export const DATA_COLLECTION_SCHEMA_EXPORT = DATA_COLLECTION_SCHEMA;
