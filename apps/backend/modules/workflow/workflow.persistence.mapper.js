function mapWorkflowNodeForPersistence(node, workflowID) {
  return {
    nodeID: node.id,
    workflowID,
    nodeType: node.type,
    nodeConfig: {
      ...node.data,
      position: node.position,
      width: node.width,
      height: node.height,
      measured: node.measured,
    },
  };
}

function mapWorkflowEdgeForPersistence(edge, workflowID) {
  return {
    workflowID,
    upstreamNodeID: edge.source,
    downstreamNodeID: edge.target,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
    edgeType: edge.type || 'smoothstep',
    edgeConfig: {
      label: edge.label,
      style: edge.style,
      animated: edge.animated,
      data: edge.data,
    },
  };
}

function buildWorkflowGraphPersistencePayload({ workflowID, nodes = [], edges = [] }) {
  return {
    nodeCreateManyData: nodes.map((node) => mapWorkflowNodeForPersistence(node, workflowID)),
    edgeCreateManyData: edges.map((edge) => mapWorkflowEdgeForPersistence(edge, workflowID)),
  };
}

module.exports = {
  mapWorkflowNodeForPersistence,
  mapWorkflowEdgeForPersistence,
  buildWorkflowGraphPersistencePayload,
};