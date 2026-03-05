/**
 * WorkflowEngine (Scheduler)
 * 
 * Orchestrates the execution of a workflow using Kahn's Algorithm for parallel scheduling.
 */
const stateRepository = require("./state.repository");
const { v4: uuidv4 } = require("uuid");
const Logger = require("../../../utils/logger");
const { resolveStringWithContext } = require("../workers/workerSDK");

class WorkflowEngine {
  constructor() {
    this.handlers = {}; // Strategy pattern for node handlers
    this.activeIntervals = new Map(); // Keep track of polling loops
  }

  /**
   * Register a handler for a specific node type
   * @param {string} type 
   * @param {object} handlerInstance 
   */
  registerHandler(type, handlerInstance) {
    this.handlers[type] = handlerInstance;
  }

  /**
   * Start a new workflow execution
   * @param {object} workflow { id, nodes, edges }
   * @param {object} triggerParams Initial context/variables
   */
  async startWorkflow(workflow, triggerParams = {}) {
    const runId = uuidv4();
    Logger.log("info", { message: "WorkflowEngine:startWorkflow", params: { runId, workflowId: workflow.id } });

    // 1. Initialize State
    const initialState = {
      runId,
      workflowId: workflow.id,
      status: "RUNNING",
      nodes: {}, // { nodeId: { status, output, error } }
      queue: [], // Nodes ready to run
      inDegrees: {}, // Dependency counts
      adjacencyList: {}, // Map<NodeID, List<ChildNodeID>>
      results: {}, // Global context for data passing
      context: triggerParams // Initial trigger data
    };

    // 2. Build Graph & Calculate In-Degrees
    workflow.nodes.forEach(node => {
      initialState.inDegrees[node.id] = 0;
      initialState.adjacencyList[node.id] = [];
      initialState.nodes[node.id] = { status: "PENDING", config: node };
    });

    workflow.edges.forEach(edge => {
      if (initialState.adjacencyList[edge.source]) {
        initialState.adjacencyList[edge.source].push(edge.target);
        initialState.inDegrees[edge.target] = (initialState.inDegrees[edge.target] || 0) + 1;
      }
    });

    // 3. Find initial nodes (In-Degree 0)
    Object.keys(initialState.inDegrees).forEach(nodeId => {
      if (initialState.inDegrees[nodeId] === 0) {
        initialState.queue.push(nodeId);
      }
    });

    // 4. Save State
    await stateRepository.saveRun(runId, initialState);

    // 5. Kickoff Loop (Detached)
    this.processQueue(runId).catch(err => {
      Logger.log("error", { message: "WorkflowEngine:processQueue:fatal", params: { runId, error: err.message } });
    });

    return { runId };
  }

  /**
   * Main Event Loop (Async)
   * Checks queue, executes nodes, resolves dependencies.
   */
  async processQueue(runId) {
    const state = await stateRepository.getRun(runId);
    if (!state || state.status !== "RUNNING") return;

    // If queue is empty but active nodes exist, we wait (it's parallel execution)
    // If queue is empty AND no nodes are running -> Workflow Complete.
    
    // Check for "Ready" nodes needed to run
    while (state.queue.length > 0) {
      const nodeId = state.queue.shift();
      
      // Update state to remove from queue immediately so we don't pick it up again
      await stateRepository.updateNodeState(runId, nodeId, { status: "RUNNING", startTime: Date.now() });
      
      // Run Async
      this.runNode(runId, nodeId).then(() => {
        // After node completes, re-evaluate queue
        this.processQueue(runId); 
      });
    }

    // Update state queues (since we shifted locally)
    await stateRepository.saveRun(runId, state);

    // Check completion condition
    const allNodes = Object.values(state.nodes);
    const isRunning = allNodes.some(n => n.status === "RUNNING");
    const isFailed = allNodes.some(n => n.status === "FAILED");
    const isPending = allNodes.some(n => n.status === "PENDING"); // Pending means waiting for dep

    if (!isRunning && state.queue.length === 0) {
      if (isFailed) {
        await stateRepository.updateRunStatus(runId, "FAILED");
        Logger.log("info", { message: "WorkflowEngine:Complete", params: { runId, status: "FAILED" } });
      } else if (!isPending) {
        await stateRepository.updateRunStatus(runId, "COMPLETED");
        Logger.log("info", { message: "WorkflowEngine:Complete", params: { runId, status: "COMPLETED" } });
        this.emit(runId, "WORKFLOW_COMPLETE", { runId, status: "COMPLETED" });
      } else {
        // Deadlock or waiting?
        // In a DAG, if !isRunning and queue is empty, but Pending exists, it implies a cycle or logic error.
        // But for this simplified version assuming DAG, !Running + EmptyQueue + Pending should not happen if graph is valid.
      }
    }
  }

  /**
   * Recursively interpolate node configuration values using context
   */
  interpolateConfig(config, context) {
    if (typeof config === "string") {
      return resolveStringWithContext(context, config);
    }
    if (Array.isArray(config)) {
      return config.map(item => this.interpolateConfig(item, context));
    }
    if (config !== null && typeof config === "object") {
      const result = {};
      for (const [key, value] of Object.entries(config)) {
        result[key] = this.interpolateConfig(value, context);
      }
      return result;
    }
    return config;
  }

  /**
   * Execute a single node logic
   */
  async runNode(runId, nodeId) {
    try {
      const state = await stateRepository.getRun(runId);
      const nodeData = state.nodes[nodeId];
      const nodeType = nodeData.config.type;
      
      Logger.log("info", { message: "WorkflowEngine:runNode:start", params: { runId, nodeId, type: nodeType } });
      this.emit(runId, "NODE_START", { nodeId, type: nodeType });

      const handler = this.handlers[nodeType];
      if (!handler) {
        throw new Error(`No handler registered for node type: ${nodeType}`);
      }

      // Resolve Inputs using robust interpolator
      const executionContext = {
        ...state.context,
        results: state.results
      };

      const interpolatedConfig = this.interpolateConfig(nodeData.config, executionContext);

      // Execute Handler
      const output = await handler.execute(interpolatedConfig, executionContext);

      // Update State (Success)
      state.results[nodeId] = output;
      await stateRepository.updateNodeState(runId, nodeId, { 
        status: "COMPLETED", 
        output, 
        endTime: Date.now() 
      });
      this.emit(runId, "NODE_COMPLETE", { nodeId, result: output }); // Emit Complete

      // Dependency Resolution (Unlock Children)
      const children = state.adjacencyList[nodeId] || [];
      for (const childId of children) {
        state.inDegrees[childId] -= 1;
        if (state.inDegrees[childId] === 0) {
          state.queue.push(childId);
        }
      }

      await stateRepository.saveRun(runId, state);

      Logger.log("info", { message: "WorkflowEngine:runNode:success", params: { runId, nodeId } });

    } catch (error) {
      Logger.log("error", { message: "WorkflowEngine:runNode:failure", params: { runId, nodeId, error: error.message } });
      await stateRepository.updateNodeState(runId, nodeId, { 
        status: "FAILED", 
        error: error.message, 
        endTime: Date.now() 
      });
      this.emit(runId, "WORKFLOW_ERROR", { message: error.message, nodeId });
      // Do not unlock children. workflow typically fails here or continues separate branch.
    }
  }

  emit(runId, event, data) {
    if (this.io) {
      this.io.to(runId).emit(event, data);
    }
  }
}

const engine = new WorkflowEngine();
const { socketIO } = require("../../../config/socket.io");
engine.io = socketIO;

module.exports = engine;
