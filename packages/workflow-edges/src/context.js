import { createContext, useContext } from 'react';

export const WorkflowEdgeContext = createContext({
  deleteEdge: () => {},
  updateEdge: () => {},
});

export const useWorkflowEdge = () => useContext(WorkflowEdgeContext);
