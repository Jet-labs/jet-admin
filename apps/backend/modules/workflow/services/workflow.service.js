/**
 * WorkflowService
 * Business logic for Workflow management.
 */
const Logger = require("../../../utils/logger");
const workflowEngine = require("../engine/scheduler");
const stateRepository = require("../engine/state.repository");
const jsHandler = require("../engine/nodeHandlers/javascript.handler");
const dataQueryHandler = require("../engine/nodeHandlers/dataQuery.handler");
const conditionHandler = require("../engine/nodeHandlers/condition.handler");
// const { prisma } = require("../../../config/prisma.config"); // TODO: Enable when DB schema exists

// Register Handlers
workflowEngine.registerHandler("javascript", jsHandler);
workflowEngine.registerHandler("dataQuery", dataQueryHandler);
workflowEngine.registerHandler("condition", conditionHandler);

class WorkflowService {
  /**
   * Execute a workflow manually.
   * @param {string} workflowId 
   * @param {object} triggerParams 
   */
  async executeWorkflow(workflowId, triggerParams) {
    Logger.log("info", { message: "WorkflowService:executeWorkflow", params: { workflowId } });

    // 1. Fetch Workflow Definition
    // TODO: Replace with DB call
    // const workflow = await prisma.tblWorkflows.findUnique({ where: { id: workflowId }, include: { nodes: true, edges: true } });
    
    // MOCK DATA for "wf-test-01"
    let workflow;
    if (workflowId === "wf-test-01") {
      workflow = {
        id: "wf-test-01",
        nodes: [
          { id: "n1", type: "javascript", code: "return 'Hello ' + ctx.name" },
          { id: "n2", type: "javascript", code: "return ctx.results.n1 + ' World'" }
        ],
        edges: [
          { source: "n1", target: "n2" }
        ]
      };
    } else {
      throw new Error("Workflow not found (Mock only supports wf-test-01)");
    }

    // 2. Start Execution
    const { runId } = await workflowEngine.startWorkflow(workflow, triggerParams);
    return { runId };
  }

  /**
   * Get run status
   */
  async getRunStatus(runId) {
    return await stateRepository.getRun(runId);
  }
}

module.exports = new WorkflowService();
