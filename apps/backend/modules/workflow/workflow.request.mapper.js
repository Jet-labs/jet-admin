function normalizeWorkflowGraphPayload(body = {}, options = {}) {
  const { defaultEmptyGraph = false } = options;
  const nodes = body.nodes ?? body.workflowNodes;
  const edges = body.edges ?? body.workflowEdges;

  return {
    title: body.title ?? body.workflowTitle,
    nodes: defaultEmptyGraph ? nodes ?? [] : nodes,
    edges: defaultEmptyGraph ? edges ?? [] : edges,
    workflowOptions: body.workflowOptions,
  };
}

function normalizeWorkflowInputParams(body = {}) {
  return body.inputParams ?? body.args ?? {};
}

module.exports = {
  normalizeWorkflowGraphPayload,
  normalizeWorkflowInputParams,
};