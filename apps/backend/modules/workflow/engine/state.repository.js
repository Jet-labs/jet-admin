/**
 * WorkflowStateRepository (In-Memory Implementation)
 * 
 * Stores the runtime state of workflows. 
 * In a production environment, this should be replaced with a Redis implementation.
 */
class WorkflowStateRepository {
  constructor() {
    this.runStates = new Map();
  }

  /**
   * Initialize a new run state
   * @param {string} runId 
   * @param {object} initialState 
   */
  async saveRun(runId, initialState) {
    // Clone to prevent reference issues in memory
    this.runStates.set(runId, JSON.parse(JSON.stringify(initialState)));
    return this.runStates.get(runId);
  }

  /**
   * Retrieve the full state of a run
   * @param {string} runId 
   */
  async getRun(runId) {
    const state = this.runStates.get(runId);
    if (!state) return null;
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Update the status and output of a specific node
   * @param {string} runId 
   * @param {string} nodeId 
   * @param {object} updates { status, output, error, startTime, endTime }
   */
  async updateNodeState(runId, nodeId, updates) {
    const state = this.runStates.get(runId);
    if (!state) throw new Error(`Run ID ${runId} not found`);

    if (!state.nodes[nodeId]) {
      state.nodes[nodeId] = {};
    }

    // Merge updates
    state.nodes[nodeId] = {
      ...state.nodes[nodeId],
      ...updates
    };

    // Update main status if needed (simple check)
    // In a real DB, we might want atomic updates here
    this.runStates.set(runId, state);
    return state.nodes[nodeId];
  }

  /**
   * Update internal queue or global status
   */
  async updateRunStatus(runId, status) {
    const state = this.runStates.get(runId);
    if (!state) throw new Error(`Run ID ${runId} not found`);
    
    state.status = status;
    this.runStates.set(runId, state);
  }
}

// Singleton instance for the application
module.exports = new WorkflowStateRepository();
