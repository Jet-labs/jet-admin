/**
 * WorkflowNode Model
 * 
 * Represents a node in a workflow.
 * Handles both backend format (tblWorkflowNodes) and React Flow format.
 */
export class WorkflowNode {
  constructor(data) {
    // Handle both formats:
    // Backend: { nodeID, nodeType, nodeConfig }
    // React Flow: { id, type, data, position }
    
    this.id = data.id || data.nodeID;
    this.type = data.type || data.nodeType;
    
    // nodeConfig in backend includes everything, data in React Flow is just the config
    const config = data.data || data.nodeConfig || {};
    
    // Extract position from config if it was nested there
    this.position = data.position || config.position || { x: 0, y: 0 };
    this.width = data.width || config.width;
    this.height = data.height || config.height;
    this.measured = data.measured || config.measured;
    
    // Store the actual node configuration (without position/dimensions)
    const { position, width, height, measured, ...restConfig } = config;
    this.data = restConfig;
    
    // Convenience accessors for common properties
    this.title = this.data.title || this.type;
    this.outputVariable = this.data.outputVariable || null;
  }

  /**
   * Check if this node produces output
   */
  get hasOutput() {
    return !!this.outputVariable && this.type !== 'start' && this.type !== 'end';
  }

  /**
   * Get the context path for this node's output
   */
  get contextPath() {
    return this.outputVariable ? `ctx.${this.outputVariable}` : null;
  }

  /**
   * Check if this is a start node
   */
  get isStart() {
    return this.type === 'start';
  }

  /**
   * Check if this is an end node
   */
  get isEnd() {
    return this.type === 'end';
  }

  /**
   * Get the node in React Flow format
   */
  toReactFlow() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      position: this.position,
      width: this.width,
      height: this.height,
      measured: this.measured,
    };
  }

  /**
   * Get the node in backend format
   */
  toBackend(workflowID) {
    return {
      nodeID: this.id,
      workflowID,
      nodeType: this.type,
      nodeConfig: {
        ...this.data,
        position: this.position,
        width: this.width,
        height: this.height,
        measured: this.measured,
      },
    };
  }

  /**
   * Convert array of raw node data to WorkflowNode instances
   */
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map(item => new WorkflowNode(item));
    }
    return [];
  }
}
