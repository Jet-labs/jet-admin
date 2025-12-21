/**
 * Test Execution Script
 * Runs a manual workflow to verify the Scheduler Logic.
 * 
 * Scenario:
 * Node A (Fast) --\
 *                  --> Node C (Depends on A & B)
 * Node B (Slow) --/
 */
const workflowEngine = require("./engine/scheduler");
const testHandler = require("./engine/nodeHandlers/test.handler");
const jsHandler = require("./engine/nodeHandlers/javascript.handler");
const stateRepository = require("./engine/state.repository");

// 1. Register Handlers
workflowEngine.registerHandler("test-node", testHandler);
workflowEngine.registerHandler("javascript", jsHandler);

// 2. Define Workflow
const mockWorkflow = {
  id: "wf-test-js-01",
  nodes: [
    { 
      id: "node_A", 
      type: "test-node", 
      name: "Node A (Source)", 
      duration: 100 
    },
    { 
      id: "node_JS", 
      type: "javascript", 
      code: "return 'Processed: ' + ctx.results.node_A.message;" 
    }
  ],
  edges: [
    { source: "node_A", target: "node_JS" }
  ]
};

async function runTest() {
  console.log(">>> Starting Workflow JS Test");
  
  try {
    const { runId } = await workflowEngine.startWorkflow(mockWorkflow, { userID: 1, tenantID: 1 });
    console.log(`>>> Workflow Started. RunID: ${runId}`);

    const interval = setInterval(async () => {
      const state = await stateRepository.getRun(runId);
      
      if (state.status === "COMPLETED" || state.status === "FAILED") {
        clearInterval(interval);
        console.log(">>> Final Result:", JSON.stringify(state.results, null, 2));
        console.log(">>> Status:", state.status);
        process.exit(0);
      }
    }, 500);

  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  }
}

runTest();
