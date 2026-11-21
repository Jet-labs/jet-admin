// Dependency-free contract: usable by Temporal's deterministic sandbox,
// activities, and node handlers without importing VM/native dependencies.
const OUTPUT_DEFAULTS = Object.freeze({
  javascript: 'jsResult', dataQuery: 'queryResult', subWorkflow: 'subResult',
  dataCollection: 'collectedData', approval: 'approval', loop: 'loopResults', join: 'joined',
});

function normalizeNodeData(type, data = {}) {
  return {
    ...data,
    ...(OUTPUT_DEFAULTS[type] ? { outputVariable: data.outputVariable || OUTPUT_DEFAULTS[type] } : {}),
    errorHandling: data.errorHandling || 'fail_workflow',
  };
}

function buildContextDelta({ nodeID, nodeType, output, outputVariable, status }) {
  const values = {};
  const object = output && typeof output === 'object' ? output : {};
  if (object.__contextPatch && typeof object.__contextPatch === 'object') Object.assign(values, object.__contextPatch);
  const deleteKeys = Array.isArray(object.__deleteKeys) ? object.__deleteKeys.filter(key => typeof key === 'string') : [];
  for (const key of deleteKeys) delete values[key];
  if (outputVariable) {
    if (object[outputVariable] !== undefined) values[outputVariable] = object[outputVariable];
    else {
      const domain = Object.fromEntries(Object.entries(object).filter(([key]) => !key.startsWith('__') && key !== 'success' && key !== 'error'));
      const keys = Object.keys(domain);
      values[outputVariable] = keys.length === 1 ? domain[keys[0]] : keys.length ? domain : output;
    }
  }
  if (nodeType === 'end' && Object.prototype.hasOwnProperty.call(object, 'workflowOutput')) values.output = object.workflowOutput;
  values[`__node_${nodeID}`] = { output: output ?? null, status: status ?? null, outputVariable: outputVariable ?? null };
  return { values, deleteKeys };
}

function applyContextDelta(context, delta) {
  for (const key of delta.deleteKeys) delete context[key];
  Object.assign(context, delta.values);
  return context;
}

// Temporal wraps application failures in transport failures. Persist the useful
// application message and allowlisted child linkage, never the wrapper stack.
function describeWorkflowFailure(error) {
  const messages = [];
  const details = {};
  const seen = new Set();
  let current = error;
  while (current && !seen.has(current) && seen.size < 10) {
    seen.add(current);
    const message = typeof current === 'string' ? current : current.message;
    if (message && !/^(Activity task failed|Workflow execution failed|Workflow failed)$/i.test(message) && !messages.includes(message)) {
      messages.push(message);
    }
    for (const item of [current, ...(Array.isArray(current.details) ? current.details : [])]) {
      if (typeof item?.childInstanceID === 'string') details.childInstanceID = item.childInstanceID;
      if (typeof item?.childStatus === 'string') details.childStatus = item.childStatus;
    }
    current = current.cause;
  }
  return { message: messages.join(': ') || error?.message || String(error), ...details };
}

function validateExecutableGraph(nodes, edges) {
  if (!Array.isArray(nodes) || !nodes.length || !Array.isArray(edges)) throw new Error('Workflow requires nodes and edges arrays');
  const types = new Set(['start', 'end', 'javascript', 'dataQuery', 'subWorkflow', 'dataCollection', 'approval', 'loop', 'join', 'condition', 'switch', 'fanout', 'delay']);
  const byID = new Map();
  for (const node of nodes) {
    if (!node || typeof node.id !== 'string' || !node.id.trim()) throw new Error('Every workflow node needs a non-empty string ID');
    if (byID.has(node.id)) throw new Error(`Duplicate workflow node ID: ${node.id}`);
    if (!types.has(node.type)) throw new Error(`Unsupported workflow node type: ${node.type}`);
    byID.set(node.id, node);
  }
  const starts = nodes.filter(node => node.type === 'start');
  if (starts.length !== 1) throw new Error('An executable workflow must have exactly one start node');
  const outgoing = new Map(nodes.map(node => [node.id, []]));
  const staticHandles = {
    start: ['output'], end: [], javascript: ['success', 'error', 'output'], dataQuery: ['success', 'error', 'output'],
    subWorkflow: ['success', 'error', 'output'], delay: ['output', 'error'], join: ['output', 'error'],
    loop: ['loop', 'completed', 'done', 'output', 'error'], approval: ['approved', 'rejected', 'expired', 'output', 'error', 'default'],
    dataCollection: ['output', 'error', 'default'], condition: ['true', 'false', 'default', 'output', 'error'],
    switch: ['default', 'output', 'error'], fanout: ['output', 'error'],
  };
  for (const edge of edges) {
    const source = byID.get(edge?.source);
    if (!source || !byID.has(edge?.target)) throw new Error('Workflow edge references a missing endpoint');
    const data = source.data || {};
    if ((data.branches !== undefined && !Array.isArray(data.branches)) || (data.cases !== undefined && !Array.isArray(data.cases))) throw new Error(`Invalid branch configuration on node ${source.id}`);
    const handles = new Set([...staticHandles[source.type], ...(data.branches || []).map(branch => branch.id), ...(data.cases || []).map(item => item.id), data.skipHandle, data.timeoutHandle, data.defaultBranch]);
    if (data.errorHandling === 'continue_default') handles.add('default');
    const handle = edge.sourceHandle || 'output';
    if (source.type === 'end' || !handles.has(handle)) throw new Error(`Invalid ${source.type} output handle '${handle}' on node ${source.id}`);
    outgoing.get(source.id).push(edge);
  }
  const reachable = new Set();
  const pending = [starts[0].id];
  while (pending.length) {
    const id = pending.pop();
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const edge of outgoing.get(id)) pending.push(edge.target);
  }
  const orphan = nodes.find(node => !reachable.has(node.id));
  if (orphan) throw new Error(`Unreachable workflow node: ${orphan.id}`);
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error('Graph cycle must use an explicit loop boundary');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const edge of outgoing.get(id)) if (byID.get(edge.target).type !== 'loop') visit(edge.target);
    visiting.delete(id); visited.add(id);
  }
  for (const node of nodes) visit(node.id);
}

module.exports = { OUTPUT_DEFAULTS, normalizeNodeData, buildContextDelta, applyContextDelta, validateExecutableGraph, describeWorkflowFailure };
