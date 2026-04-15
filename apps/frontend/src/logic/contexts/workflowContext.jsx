import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWorkflowsAPI } from "../../data/apis/workflow";
import PropTypes from "prop-types";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";


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

  const {
    isLoading: isLoadingDataQueries,
    data: dataQueries,
    error: loadDataQueriesError,
    isFetching: isFetchingDataQueries,
    isRefetching: isRefetechingDataQueries,
    refetch: refetchDataQueries,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID)],
    queryFn: () => getAllDataQueriesAPI({ tenantID }),
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
        dataQueries,
        isLoadingDataQueries,
        isFetchingDataQueries,
        loadDataQueriesError,
        isRefetechingDataQueries,
      }}
    >
      <WorkflowActionsContext.Provider value={{ refetchWorkflows, refetchDataQueries }}>
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
