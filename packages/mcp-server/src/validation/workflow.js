/**
 * Workflow graph validator — pure, no network.
 * Catches the contracts that the platform only checks at save/execute time
 * (and some it does not check at all): node config, branch/case ids,
 * edge handles, reachability and cycles.
 */
import { getAllowedHandles, getNodeContract, NODE_TYPES } from '../data/nodeContracts.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const ERROR_ENUM = ['continue', 'continue_default', 'fail_workflow', 'skip_item', 'retry_then_fail', 'retry_then_continue'];
const DELAY_TYPES = ['fixed', 'dynamic', 'until'];
const CONDITION_OPS = ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_empty', 'is_not_empty', 'matches_regex', 'expression'];
const SWITCH_OPS = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'expression'];

function err(path, code, message, fix, suggestion) {
  return { path, code, message, fix, suggestion };
}
function warn(path, code, message, fix) {
  return { path, code, message, fix };
}
function isUUID(v) { return typeof v === 'string' && UUID_RE.test(v); }
function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0; }

export function normalizeWorkflowGraph(nodesInput, edgesInput) {
  const nodes = (Array.isArray(nodesInput) ? nodesInput : []).map((n) => ({
    ...n,
    id: n?.id ?? n?.nodeID,
    type: n?.type ?? n?.nodeType,
    data: n?.data ?? n?.nodeConfig ?? {},
  }));
  const edges = (Array.isArray(edgesInput) ? edgesInput : []).map((e) => ({
    ...e,
    id: e?.id ?? e?.edgeID,
    source: e?.source ?? e?.upstreamNodeID,
    target: e?.target ?? e?.downstreamNodeID,
    sourceHandle: e?.sourceHandle ?? null,
    targetHandle: e?.targetHandle ?? null,
  }));
  return { nodes, edges };
}

export function validateWorkflowGraph({ nodes: nodesInput, edges: edgesInput } = {}) {
  const errors = [];
  const warnings = [];
  const { nodes, edges } = normalizeWorkflowGraph(nodesInput, edgesInput);

  if (!Array.isArray(nodesInput)) errors.push(err('nodes', 'NODES_REQUIRED', 'nodes must be an array of node objects.', 'Provide [{id,type,data}] with UUID ids.', 'get_workflow_schema'));
  if (!Array.isArray(edgesInput)) errors.push(err('edges', 'EDGES_REQUIRED', 'edges must be an array of edge objects.', 'Provide [{id,source,target,sourceHandle}] with UUID ids.', 'get_workflow_schema'));
  if (nodes.length === 0) errors.push(err('nodes', 'NO_NODES', 'Workflow has no nodes.', 'Add a start node, at least one step, and an end node.', 'describe_node_type'));
  if (nodes.length > 1 && edges.length === 0) errors.push(err('edges', 'NO_EDGES', 'Workflow has multiple nodes but no edges.', 'Connect nodes with {id,source,target,sourceHandle}.', 'describe_node_type'));

  // Node identity / type / required config
  const nodeByID = new Map();
  nodes.forEach((n, i) => {
    const path = `nodes[${i}]`;
    if (!isObject(n)) { errors.push(err(path, 'NODE_NOT_OBJECT', 'Node must be an object.', 'Use {id,type,data}.', 'get_workflow_schema')); return; }
    if (!isUUID(n.id)) errors.push(err(`${path}.id`, 'NODE_ID_INVALID', `Node id ${JSON.stringify(n.id)} is not a UUID.`, 'Use a UUID (crypto.randomUUID()).', 'create_workflow'));
    else if (nodeByID.has(n.id)) errors.push(err(`${path}.id`, 'NODE_ID_DUPLICATE', `Duplicate node id ${n.id}.`, 'Give every node a unique UUID.', 'create_workflow'));
    else nodeByID.set(n.id, n);

    if (!NODE_TYPES.includes(n.type)) {
      errors.push(err(`${path}.type`, 'NODE_TYPE_INVALID', `Unknown node type ${JSON.stringify(n.type)}.`, `Use one of: ${NODE_TYPES.join(', ')}.`, 'list_workflow_node_types'));
      return;
    }
    const contract = getNodeContract(n.type);
    if (!isObject(n.data)) errors.push(err(`${path}.data`, 'NODE_DATA_INVALID', 'Node data must be an object.', 'Put type-specific config under data.', 'describe_node_type'));
    for (const key of contract.required) {
      const v = n.data?.[key];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        errors.push(err(`${path}.data.${key}`, 'NODE_REQUIRED_FIELD', `${n.type} requires data.${key}.`, `Add ${key}.`, 'describe_node_type'));
      }
    }

    const d = n.data || {};
    if (d.errorHandling && !ERROR_ENUM.includes(d.errorHandling)) {
      errors.push(err(`${path}.data.errorHandling`, 'ERROR_HANDLING_INVALID', `errorHandling ${JSON.stringify(d.errorHandling)} is invalid.`, `Use one of: ${ERROR_ENUM.join(', ')}.`, 'describe_node_type'));
    }
    if (d.outputVariable !== undefined && !IDENT_RE.test(String(d.outputVariable))) {
      errors.push(err(`${path}.data.outputVariable`, 'OUTPUT_VAR_INVALID', 'outputVariable must be a valid JavaScript identifier.', 'Use letters, digits, underscores; start with a letter or underscore.', 'describe_node_type'));
    }

    if (n.type === 'dataQuery' && d.dataQueryID && !isUUID(d.dataQueryID)) {
      errors.push(err(`${path}.data.dataQueryID`, 'QUERY_ID_INVALID', 'dataQueryID must be a saved query UUID.', 'Find it with list_queries/create_query.', 'list_queries'));
    }
    if (n.type === 'dataQuery') {
      if (d.inputValues !== undefined && !isObject(d.inputValues)) errors.push(err(`${path}.data.inputValues`, 'INPUT_VALUES_INVALID', 'inputValues must be an object.', 'Use { key: value } with {{ctx.*}} templates.', 'describe_node_type'));
      if (d.timeoutSeconds !== undefined && !(Number.isInteger(d.timeoutSeconds) && d.timeoutSeconds >= 1 && d.timeoutSeconds <= 3600)) errors.push(err(`${path}.data.timeoutSeconds`, 'TIMEOUT_INVALID', 'timeoutSeconds must be 1-3600.', 'Use 300.', 'describe_node_type'));
    }
    if (n.type === 'javascript') {
      if (!isNonEmptyString(d.code)) errors.push(err(`${path}.data.code`, 'CODE_REQUIRED', 'javascript node requires non-empty code.', 'Provide code that returns a value.', 'describe_node_type'));
      if (d.timeoutSeconds !== undefined && !(Number.isInteger(d.timeoutSeconds) && d.timeoutSeconds >= 1 && d.timeoutSeconds <= 3600)) errors.push(err(`${path}.data.timeoutSeconds`, 'TIMEOUT_INVALID', 'timeoutSeconds must be 1-3600.', 'Use 30.', 'describe_node_type'));
    }

    if (n.type === 'condition') validateConditionNode(n, path, errors, warnings);
    if (n.type === 'switch') validateSwitchNode(n, path, errors, warnings);
    if (n.type === 'loop') {
      if (!isNonEmptyString(d.sourceVariable)) errors.push(err(`${path}.data.sourceVariable`, 'LOOP_SOURCE_REQUIRED', 'loop requires sourceVariable resolving to an array.', 'Use {{ctx.items}}.', 'describe_node_type'));
      for (const k of ['itemVariable', 'indexVariable']) {
        if (d[k] !== undefined && !IDENT_RE.test(String(d[k]))) errors.push(err(`${path}.data.${k}`, 'IDENTIFIER_INVALID', `${k} must be a valid JavaScript identifier.`, 'Use item / index.', 'describe_node_type'));
      }
      if (d.maxIterations !== undefined && !(Number.isInteger(d.maxIterations) && d.maxIterations >= 1 && d.maxIterations <= 100000)) errors.push(err(`${path}.data.maxIterations`, 'MAX_ITERATIONS_INVALID', 'maxIterations must be 1-100000.', 'Use 1000.', 'describe_node_type'));
    }
    if (n.type === 'delay') {
      const delayType = d.delayType || 'fixed';
      if (!DELAY_TYPES.includes(delayType)) errors.push(err(`${path}.data.delayType`, 'DELAY_TYPE_INVALID', `delayType must be ${DELAY_TYPES.join('/')}.`, 'Use fixed.', 'describe_node_type'));
      if (delayType === 'dynamic' && !isNonEmptyString(d.delayVariable)) errors.push(err(`${path}.data.delayVariable`, 'DELAY_VARIABLE_REQUIRED', 'dynamic delay requires delayVariable.', 'Use {{ctx.delayMs}}.', 'describe_node_type'));
      if (delayType === 'until' && !isNonEmptyString(d.untilTime)) errors.push(err(`${path}.data.untilTime`, 'UNTIL_TIME_REQUIRED', 'until delay requires untilTime.', 'Use an ISO timestamp or template.', 'describe_node_type'));
    }
    if (n.type === 'dataCollection') {
      if (!isObject(d.formSchema) || d.formSchema.type !== 'object' || !isObject(d.formSchema.properties)) {
        errors.push(err(`${path}.data.formSchema`, 'FORM_SCHEMA_INVALID', 'dataCollection requires formSchema of type object with properties.', 'Use {"type":"object","properties":{...},"required":[...]}.', 'validate_form_schema'));
      }
      if (d.formUischema !== undefined && !isObject(d.formUischema)) errors.push(err(`${path}.data.formUischema`, 'FORM_UISCHEMA_INVALID', 'formUischema must be an object.', 'Use {type:"VerticalLayout",elements:[...]}.', 'validate_form_schema'));
      if (d.expiryMinutes !== undefined && !(Number.isInteger(d.expiryMinutes) && d.expiryMinutes >= 0 && d.expiryMinutes <= 10080)) errors.push(err(`${path}.data.expiryMinutes`, 'EXPIRY_INVALID', 'expiryMinutes must be 0-10080.', 'Use 60.', 'describe_node_type'));
    }
    if (n.type === 'approval') {
      if (d.expiryMinutes !== undefined && !(Number.isInteger(d.expiryMinutes) && d.expiryMinutes >= 0 && d.expiryMinutes <= 10080)) errors.push(err(`${path}.data.expiryMinutes`, 'EXPIRY_INVALID', 'expiryMinutes must be 0-10080.', 'Use 60.', 'describe_node_type'));
      if (d.onTimeout !== undefined && !['expired', 'fail'].includes(d.onTimeout)) errors.push(err(`${path}.data.onTimeout`, 'ON_TIMEOUT_INVALID', 'onTimeout must be expired or fail.', 'Use expired.', 'describe_node_type'));
    }
    if (n.type === 'fanout' && Array.isArray(d.branches)) {
      const ids = [];
      d.branches.forEach((b, bi) => {
        if (!isNonEmptyString(b?.id)) errors.push(err(`${path}.data.branches[${bi}].id`, 'BRANCH_ID_REQUIRED', 'Every fan-out branch needs an id.', 'Use branch_a, branch_b.', 'describe_node_type'));
        else if (ids.includes(b.id)) errors.push(err(`${path}.data.branches[${bi}].id`, 'BRANCH_ID_DUPLICATE', `Duplicate fan-out branch id ${b.id}.`, 'Use unique branch ids.', 'describe_node_type'));
        else ids.push(b.id);
      });
    }
    if (n.type === 'join') {
      if (!Array.isArray(d.sourceVariables) || d.sourceVariables.length === 0) {
        errors.push(err(`${path}.data.sourceVariables`, 'JOIN_SOURCES_REQUIRED', 'join requires a non-empty sourceVariables array.', 'Use bare names: ["aResult","bResult"].', 'describe_node_type'));
      } else {
        d.sourceVariables.forEach((v, vi) => {
          if (typeof v !== 'string' || !IDENT_RE.test(v)) {
            errors.push(err(`${path}.data.sourceVariables[${vi}]`, 'JOIN_SOURCE_INVALID', `sourceVariables[${vi}] must be a bare context name, not a template.`, 'Use "aResult", not "{{ctx.aResult}}".', 'describe_node_type'));
          }
        });
      }
      if (d.joinMode !== undefined && !['all', 'any'].includes(d.joinMode)) errors.push(err(`${path}.data.joinMode`, 'JOIN_MODE_INVALID', 'joinMode must be all or any.', 'Use all.', 'describe_node_type'));
    }
    if (n.type === 'subWorkflow') {
      if (d.childWorkflowID && !isUUID(d.childWorkflowID)) errors.push(err(`${path}.data.childWorkflowID`, 'CHILD_WORKFLOW_ID_INVALID', 'childWorkflowID must be a workflow UUID.', 'Find it with list_workflows.', 'list_workflows'));
      if (d.inputMapping !== undefined && !isObject(d.inputMapping)) errors.push(err(`${path}.data.inputMapping`, 'INPUT_MAPPING_INVALID', 'inputMapping must be an object.', 'Use { childInput: "{{ctx.parentValue}}" }.', 'describe_node_type'));
      if (d.inputValues !== undefined) warnings.push(warn(`${path}.data.inputValues`, 'SUBCRITICAL_INPUTVALUES_IGNORED', 'subWorkflow.inputValues is silently ignored; use inputMapping.', 'Rename to inputMapping.'));
      if (d.maxDepth !== undefined && !(Number.isInteger(d.maxDepth) && d.maxDepth >= 1 && d.maxDepth <= 10)) errors.push(err(`${path}.data.maxDepth`, 'MAX_DEPTH_INVALID', 'maxDepth must be 1-10.', 'Use 5.', 'describe_node_type'));
    }
    if (n.type === 'end') {
      if (d.status !== undefined && !['success', 'failure', 'cancelled'].includes(d.status)) errors.push(err(`${path}.data.status`, 'END_STATUS_INVALID', 'end.status must be success, failure, or cancelled.', 'Use success.', 'describe_node_type'));
      if (d.outputParameters !== undefined && !Array.isArray(d.outputParameters)) errors.push(err(`${path}.data.outputParameters`, 'OUTPUT_PARAMS_INVALID', 'outputParameters must be an array.', 'Use [{name, sourceVariable}].', 'describe_node_type'));
      else (d.outputParameters || []).forEach((p, pi) => {
        if (!isObject(p) || !isNonEmptyString(p.name)) errors.push(err(`${path}.data.outputParameters[${pi}].name`, 'OUTPUT_PARAM_NAME_REQUIRED', 'Output parameter needs a name.', 'Use {name:"result", sourceVariable:"{{ctx.x}}"}.', 'describe_node_type'));
      });
    }
  });

  // Edge references / handles
  const edgeIDs = new Set();
  const outgoing = new Map();
  edges.forEach((e, i) => {
    const path = `edges[${i}]`;
    if (!isObject(e)) { errors.push(err(path, 'EDGE_NOT_OBJECT', 'Edge must be an object.', 'Use {id,source,target,sourceHandle}.', 'get_workflow_schema')); return; }
    if (e.id !== undefined && !isUUID(e.id)) errors.push(err(`${path}.id`, 'EDGE_ID_INVALID', `Edge id ${JSON.stringify(e.id)} is not a UUID.`, 'Use a UUID (crypto.randomUUID()).', 'create_workflow'));
    else if (e.id && edgeIDs.has(e.id)) errors.push(err(`${path}.id`, 'EDGE_ID_DUPLICATE', `Duplicate edge id ${e.id}.`, 'Give every edge a unique UUID.', 'create_workflow'));
    else if (e.id) edgeIDs.add(e.id);

    const src = nodeByID.get(e.source);
    const tgt = nodeByID.get(e.target);
    if (!src) errors.push(err(`${path}.source`, 'EDGE_SOURCE_MISSING', `Edge source ${JSON.stringify(e.source)} does not exist.`, 'Reference an existing node id.', 'get_workflow'));
    if (!tgt) errors.push(err(`${path}.target`, 'EDGE_TARGET_MISSING', `Edge target ${JSON.stringify(e.target)} does not exist.`, 'Reference an existing node id.', 'get_workflow'));
    if (e.source && e.source === e.target) errors.push(err(path, 'EDGE_SELF_LOOP', 'Self-loop edges are not allowed.', 'Connect to a different node.', 'get_workflow'));
    if (!src) return;

    if (src.type === 'end') errors.push(err(path, 'EDGE_FROM_END', 'End nodes cannot have outgoing edges.', 'Remove this edge.', 'describe_node_type'));
    const { allowed, dynamic, fallback } = getAllowedHandles(src.type, src.data);
    if (allowed) {
      if (!e.sourceHandle) {
        warnings.push(warn(`${path}.sourceHandle`, 'EDGE_HANDLE_MISSING', `${src.type} edge has no sourceHandle; runtime defaults may vary.`, `Use one of: ${allowed.join(', ')}.`));
      } else if (!allowed.includes(e.sourceHandle)) {
        errors.push(err(`${path}.sourceHandle`, 'EDGE_HANDLE_INVALID', `Invalid ${src.type} output handle ${JSON.stringify(e.sourceHandle)}.`, `Use one of: ${allowed.join(', ')}${dynamic?.length ? ` (dynamic ids: ${dynamic.join(', ')})` : ''}${fallback ? `; fallback "${fallback}"` : ''}.`, 'describe_node_type'));
      }
    }
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source).push(e);
  });

  // Reachability / dangling
  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');
  if (startNodes.length === 0) errors.push(err('nodes', 'START_REQUIRED', 'Workflow needs a start node.', 'Add {type:"start"}.', 'describe_node_type'));
  if (startNodes.length > 1) warnings.push(warn('nodes', 'MULTIPLE_STARTS', 'More than one start node; only one entry point is expected.', 'Keep one start node.'));
  if (endNodes.length === 0) errors.push(err('nodes', 'END_REQUIRED', 'Workflow needs at least one end node.', 'Add {type:"end"}.', 'describe_node_type'));

  for (const n of nodes) {
    if (!n.id) continue;
    const outs = outgoing.get(n.id) || [];
    if (n.type !== 'end' && outs.length === 0) warnings.push(warn(`nodes.${n.id}`, 'NODE_NO_OUTGOING', `${n.type} node has no outgoing edge.`, 'Connect it to the next node.'));
    if (n.type === 'start' && edges.some((e) => e.target === n.id)) errors.push(err('nodes', 'START_HAS_INCOMING', 'Start node cannot have incoming edges.', 'Remove the edge into start.'));
    if (n.type === 'fanout') {
      const ids = (n.data?.branches || []).map((b) => b?.id).filter(Boolean);
      for (const id of ids) if (!outs.some((e) => e.sourceHandle === id)) warnings.push(warn(`nodes.${n.id}.branches`, 'FANOUT_BRANCH_NO_EDGE', `Fan-out branch "${id}" has no outgoing edge.`, `Add an edge with sourceHandle "${id}".`));
    }
    if (n.type === 'condition') {
      for (const b of n.data?.branches || []) if (b?.id && !outs.some((e) => e.sourceHandle === b.id)) warnings.push(warn(`nodes.${n.id}.branches`, 'CONDITION_BRANCH_NO_EDGE', `Condition branch "${b.id}" has no outgoing edge.`, `Add an edge with sourceHandle "${b.id}".`));
    }
    if (n.type === 'switch') {
      for (const c of n.data?.cases || []) if (c?.id && !outs.some((e) => e.sourceHandle === c.id)) warnings.push(warn(`nodes.${n.id}.cases`, 'SWITCH_CASE_NO_EDGE', `Switch case "${c.id}" has no outgoing edge.`, `Add an edge with sourceHandle "${c.id}".`));
    }
    if (n.type === 'join') {
      if (!outs.some((e) => e.sourceHandle === 'output')) errors.push(err(`nodes.${n.id}.handles`, 'JOIN_OUTPUT_HANDLE', 'Join outgoing edge must use sourceHandle "output".', 'Change sourceHandle to "output".', 'describe_node_type'));
    }
  }

  // Reachability from start
  if (startNodes.length === 1 && startNodes[0].id) {
    const seen = new Set();
    const stack = [startNodes[0].id];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      for (const e of outgoing.get(id) || []) if (e.target) stack.push(e.target);
    }
    for (const n of nodes) if (n.id && !seen.has(n.id)) warnings.push(warn(`nodes.${n.id}`, 'NODE_UNREACHABLE', `${n.type} node is not reachable from start.`, 'Connect it to the main path.'));
  }

  // Cycles: allow only cycles that contain a loop node.
  const cycles = findCycles(nodes, edges);
  for (const cycle of cycles) {
    const hasLoop = cycle.some((id) => nodeByID.get(id)?.type === 'loop');
    if (!hasLoop) {
      errors.push(err('edges', 'GRAPH_CYCLE', `Workflow contains a cycle without a loop node: ${cycle.join(' -> ')}.`, 'Remove the back-edge or insert a loop node.', 'describe_node_type'));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: [...new Set(nodes.map((n) => n.type).filter(Boolean))],
      startNodeID: startNodes[0]?.id || null,
      endNodeIDs: endNodes.map((n) => n.id).filter(Boolean),
      cycleCount: cycles.length,
    },
  };
}

function validateConditionNode(n, path, errors, warnings) {
  const d = n.data || {};
  if (!Array.isArray(d.branches) || d.branches.length === 0) {
    errors.push(err(`${path}.data.branches`, 'CONDITION_BRANCHES_REQUIRED', 'condition requires at least one branch.', 'Add [{id,name,conditions:[...]}].', 'describe_node_type'));
    return;
  }
  const seen = new Set();
  d.branches.forEach((b, bi) => {
    if (!isNonEmptyString(b?.id)) errors.push(err(`${path}.data.branches[${bi}].id`, 'BRANCH_ID_REQUIRED', 'Condition branch needs an id.', 'Use branch_a.', 'describe_node_type'));
    else if (seen.has(b.id)) errors.push(err(`${path}.data.branches[${bi}].id`, 'BRANCH_ID_DUPLICATE', `Duplicate condition branch id ${b.id}.`, 'Use unique ids.', 'describe_node_type'));
    else seen.add(b.id);
    const hasConditions = Array.isArray(b?.conditions) && b.conditions.length > 0;
    const hasLegacy = b?.conditionType || b?.leftOperand !== undefined || b?.expression;
    if (!hasConditions && !hasLegacy) errors.push(err(`${path}.data.branches[${bi}]`, 'BRANCH_RULE_REQUIRED', 'Branch needs conditions[] or a legacy condition expression.', 'Use conditions:[{operator,leftValue,rightValue}] or expression.', 'describe_node_type'));
    if (hasConditions) {
      b.conditions.forEach((c, ci) => {
        if (!c || !CONDITION_OPS.includes(c.operator)) errors.push(err(`${path}.data.branches[${bi}].conditions[${ci}].operator`, 'CONDITION_OPERATOR_INVALID', `Unknown operator ${JSON.stringify(c?.operator)}.`, `Use one of: ${CONDITION_OPS.join(', ')}.`, 'describe_node_type'));
      });
      if (b.conditionLogic !== undefined && !['AND', 'OR'].includes(String(b.conditionLogic).toUpperCase())) errors.push(err(`${path}.data.branches[${bi}].conditionLogic`, 'CONDITION_LOGIC_INVALID', 'conditionLogic must be AND or OR.', 'Use AND.', 'describe_node_type'));
    }
  });
  if (d.evaluationMode !== undefined && !['first_match', 'all_matches'].includes(d.evaluationMode)) warnings.push(warn(`${path}.data.evaluationMode`, 'EVALUATION_MODE_IGNORED', 'Runtime currently implements first-match; all_matches is not honored.', 'Use first_match.'));
}

function validateSwitchNode(n, path, errors, warnings) {
  const d = n.data || {};
  if (!isNonEmptyString(d.switchValue)) errors.push(err(`${path}.data.switchValue`, 'SWITCH_VALUE_REQUIRED', 'switch requires switchValue.', 'Use {{ctx.input.kind}}.', 'describe_node_type'));
  if (!Array.isArray(d.cases) || d.cases.length === 0) {
    errors.push(err(`${path}.data.cases`, 'SWITCH_CASES_REQUIRED', 'switch requires at least one case.', 'Add [{id,label,operator,matchValue}].', 'describe_node_type'));
    return;
  }
  const seen = new Set();
  d.cases.forEach((c, ci) => {
    if (!isNonEmptyString(c?.id)) errors.push(err(`${path}.data.cases[${ci}].id`, 'CASE_ID_REQUIRED', 'Switch case needs an id.', 'Use case_one.', 'describe_node_type'));
    else if (seen.has(c.id)) errors.push(err(`${path}.data.cases[${ci}].id`, 'CASE_ID_DUPLICATE', `Duplicate switch case id ${c.id}.`, 'Use unique case ids.', 'describe_node_type'));
    else seen.add(c.id);
    if (!c || !SWITCH_OPS.includes(c.operator || 'equals')) errors.push(err(`${path}.data.cases[${ci}].operator`, 'CASE_OPERATOR_INVALID', `Unknown switch operator ${JSON.stringify(c?.operator)}.`, `Use one of: ${SWITCH_OPS.join(', ')}.`, 'describe_node_type'));
    if (c && (c.operator || 'equals') !== 'expression' && c.matchValue === undefined) warnings.push(warn(`${path}.data.cases[${ci}].matchValue`, 'CASE_MATCH_REQUIRED', 'Non-expression case has no matchValue.', 'Add matchValue.'));
  });
  if (d.cases.length > 0 && !d.cases.every((c) => c?.id)) warnings.push(warn(`${path}.data.cases`, 'CASES_INCOMPLETE', 'Some switch cases have no id and cannot be routed.', 'Give every case an id.'));
}

function findCycles(nodes, edges) {
  const adj = new Map();
  for (const n of nodes) if (n.id) adj.set(n.id, []);
  for (const e of edges) if (e.source && e.target && adj.has(e.source)) adj.get(e.source).push(e.target);
  const color = new Map();
  const stack = [];
  const cycles = [];
  function dfs(id) {
    color.set(id, 1);
    stack.push(id);
    for (const next of adj.get(id) || []) {
      if (!color.has(next)) dfs(next);
      else if (color.get(next) === 1) {
        const idx = stack.indexOf(next);
        if (idx >= 0) cycles.push(stack.slice(idx));
      }
    }
    stack.pop();
    color.set(id, 2);
  }
  for (const id of adj.keys()) if (!color.has(id)) dfs(id);
  return cycles;
}
