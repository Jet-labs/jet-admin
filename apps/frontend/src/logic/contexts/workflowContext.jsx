import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWorkflowsAPI } from "../../data/apis/workflow";
import PropTypes from "prop-types";

const WorkflowStateContext = React.createContext(undefined);
const WorkflowActionsContext = React.createContext(undefined);

const WorkflowContextProvider = ({ children }) => {
  WorkflowContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingWorkflows,
    data: workflows,
    error: loadWorkflowsError,
    isFetching: isFetchingWorkflows,
    isRefetching: isRefetechingWorkflows,
    refetch: refetchWorkflows,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID)],
    queryFn: () => getAllWorkflowsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <WorkflowStateContext.Provider
      value={{
        workflows,
        isLoadingWorkflows,
        isFetchingWorkflows,
        loadWorkflowsError,
        isRefetechingWorkflows,
      }}
    >
      <WorkflowActionsContext.Provider value={{ refetchWorkflows }}>
        {children}
      </WorkflowActionsContext.Provider>
    </WorkflowStateContext.Provider>
  );
};

const useWorkflowState = () => {
  const context = React.useContext(WorkflowStateContext);
  if (context === undefined) {
    throw new Error("useWorkflowState error");
  }

  return context;
};

const useWorkflowActions = () => {
  const context = React.useContext(WorkflowActionsContext);
  if (context === undefined) {
    throw new Error("useWorkflowActions error");
  }

  return context;
};

export {
  WorkflowActionsContext,
  WorkflowContextProvider,
  WorkflowStateContext,
  useWorkflowActions,
  useWorkflowState,
};
