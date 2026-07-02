import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWorkflowsAPI } from "../../data/apis/workflow";

export const useWorkflows = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingWorkflows,
    data: workflowsData,
    error: loadWorkflowsError,
    isFetching: isFetchingWorkflows,
    isRefetching: isRefetchingWorkflows,
    refetch: refetchWorkflows,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllWorkflowsAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : workflowsData?.workflows || [];

  return {
    workflows,
    isLoadingWorkflows,
    isFetchingWorkflows,
    loadWorkflowsError,
    isRefetchingWorkflows,
    refetchWorkflows,
  };
};

export const useInfiniteWorkflows = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingWorkflows,
    error: loadWorkflowsError,
    refetch: refetchWorkflows,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllWorkflowsAPI({
        tenantID,
        search: searchQuery,
        page: pageParam,
        pageSize: 50,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: Boolean(tenantID) && enabled,
    refetchOnWindowFocus: false,
  });

  const workflows = data?.pages?.flatMap((page) => page.workflows || []) || [];

  return {
    workflows,
    isLoadingWorkflows,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadWorkflowsError,
    refetchWorkflows,
  };
};
