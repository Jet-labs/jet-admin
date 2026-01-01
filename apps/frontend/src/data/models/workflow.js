export class Workflow {
  constructor({
    workflowID,
    title,
    tenantID,
    creatorID,
    isDisabled,
    disabledAt,
    createdAt,
    updatedAt,
    nodes,
    edges,
    tblWorkflowNodes,
    tblWorkflowEdge,
    workflowOptions,
  }) {
    this.workflowID = workflowID;
    this.title = title;
    this.tenantID = tenantID;
    this.creatorID = creatorID;
    this.isDisabled = isDisabled;
    this.disabledAt = disabledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.workflowOptions = workflowOptions || {};

    // Transform tblWorkflowNodes to React Flow node format if present
    if (tblWorkflowNodes && Array.isArray(tblWorkflowNodes)) {
      this.nodes = tblWorkflowNodes.map((node) => {
        const { position, width, height, measured, ...restData } = node.nodeConfig || {};
        return {
          id: node.nodeID,
          type: node.nodeType,
          data: restData,
          position: position || { x: 0, y: 0 },
          width: width,
          height: height,
          measured: measured,
        };
      });
    } else {
      this.nodes = nodes || [];
    }

    // Transform tblWorkflowEdge to React Flow edge format if present
    if (tblWorkflowEdge && Array.isArray(tblWorkflowEdge)) {
      this.edges = tblWorkflowEdge.map((edge) => {
        const config = edge.edgeConfig || {};
        return {
          id: edge.edgeID,
          source: edge.upstreamNodeID,
          target: edge.downstreamNodeID,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          type: edge.edgeType || 'smoothstep',
          label: config.label,
          style: config.style,
          animated: config.animated,
          data: config.data,
        };
      });
    } else {
      this.edges = edges || [];
    }
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Workflow(item));
    }
    return [];
  }
}