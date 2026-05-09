import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWorkflowsAPI } from "../../data/apis/workflow";

export const useWorkflows = (tenantID) => {
  const {
    isLoading: isLoadingWorkflows,
    data: workflows,
    error: loadWorkflowsError,
    isFetching: isFetchingWorkflows,
    isRefetching: isRefetchingWorkflows,
    refetch: refetchWorkflows,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID)],
    queryFn: () => getAllWorkflowsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    workflows,
    isLoadingWorkflows,
    isFetchingWorkflows,
    loadWorkflowsError,
    isRefetchingWorkflows,
    refetchWorkflows,
  };
};
