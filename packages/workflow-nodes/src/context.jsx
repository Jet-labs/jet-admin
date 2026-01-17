import React, { createContext, useContext } from 'react';
import { NODE_EXECUTION_STATUS } from './constants';

const WorkflowNodesContext = createContext(null);

// Re-export NODE_EXECUTION_STATUS for backwards compatibility

export const WorkflowNodesProvider = ({
  children,
  dataQueries,
  strings = {},
  onRefreshDataQueries,
  workflowNodes = [],
  workflowEdges = [],       // Edges for DAG traversal
  workflowInputArgs = [],   // Declared workflow input parameters [{key, type, ...}]
  nodeExecutionStatus = {},  // Map of nodeId -> status
  tenantID = null,           // Tenant ID for API calls
  onQueryTest = null,        // Callback for testing queries: (dataQueryID, argValues) => Promise<result>
}) => {
  return (
    <WorkflowNodesContext.Provider value={{
      dataQueries,
      strings,
      onRefreshDataQueries,
      workflowNodes,
      workflowEdges,
      workflowInputArgs,
      nodeExecutionStatus,
      tenantID,
      onQueryTest,
    }}>
      {children}
    </WorkflowNodesContext.Provider>
  );
};

export const useWorkflowNodes = () => {
  const context = useContext(WorkflowNodesContext);
  if (!context) {
    throw new Error("useWorkflowNodes must be used within a WorkflowNodesProvider");
  }
  return context;
};

/**
 * Hook to get the execution status for a specific node
 * @param {string} nodeId - The node ID
 * @returns {string} The execution status ('idle', 'running', 'completed', 'failed', 'skipped')
 */
export const useNodeExecutionStatus = (nodeId) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  return nodeExecutionStatus[nodeId] || NODE_EXECUTION_STATUS.IDLE;
};
