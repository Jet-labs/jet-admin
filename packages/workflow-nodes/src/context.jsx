import React, { createContext, useContext } from 'react';

const WorkflowNodesContext = createContext(null);

export const WorkflowNodesProvider = ({ children, dataQueries, strings = {} }) => {
  return (
    <WorkflowNodesContext.Provider value={{ dataQueries, strings }}>
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
