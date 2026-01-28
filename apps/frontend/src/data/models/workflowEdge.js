/**
 * WorkflowEdge Model
 * 
 * Represents an edge (connection) in a workflow.
 * Handles both backend format (tblWorkflowEdge) and React Flow format.
 */
export class WorkflowEdge {
  constructor(data) {
    // Handle both formats:
    // Backend: { edgeID, upstreamNodeID, downstreamNodeID, sourceHandle, targetHandle, edgeType, edgeConfig }
    // React Flow: { id, source, target, sourceHandle, targetHandle, type, label, style, animated, data }
    
    this.id = data.id || data.edgeID;
    this.source = data.source || data.upstreamNodeID;
    this.target = data.target || data.downstreamNodeID;
    this.sourceHandle = data.sourceHandle || null;
    this.targetHandle = data.targetHandle || null;
    this.type = data.type || data.edgeType || 'smoothstep';
    
    // Edge config properties
    const config = data.edgeConfig || {};
    this.label = data.label || config.label;
    this.style = data.style || config.style;
    this.animated = data.animated ?? config.animated;
    this.data = data.data || config.data || {};
  }

  /**
   * Get the edge in React Flow format
   */
  toReactFlow() {
    return {
      id: this.id,
      source: this.source,
      target: this.target,
      sourceHandle: this.sourceHandle,
      targetHandle: this.targetHandle,
      type: this.type,
      label: this.label,
      style: this.style,
      animated: this.animated,
      data: this.data,
    };
  }

  /**
   * Get the edge in backend format
   */
  toBackend(workflowID) {
    return {
      workflowID,
      upstreamNodeID: this.source,
      downstreamNodeID: this.target,
      sourceHandle: this.sourceHandle,
      targetHandle: this.targetHandle,
      edgeType: this.type,
      edgeConfig: {
        label: this.label,
        style: this.style,
        animated: this.animated,
        data: this.data,
      },
    };
  }

  /**
   * Convert array of raw edge data to WorkflowEdge instances
   */
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map(item => new WorkflowEdge(item));
    }
    return [];
  }
}
