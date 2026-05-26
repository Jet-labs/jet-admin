import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWidgetsAPI } from "../../data/apis/widget";

export const useWidgets = (tenantID) => {
  const {
    isLoading: isLoadingWidgets,
    data,
    error: loadWidgetsError,
    isFetching: isFetchingWidgets,
    isRefetching: isRefetchingWidgets,
    refetch: refetchWidgets,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
    queryFn: () => getAllWidgetsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    widgets: data?.widgets || data,
    isLoadingWidgets,
    isFetchingWidgets,
    loadWidgetsError,
    isRefetchingWidgets,
    refetchWidgets,
  };
};

export const useInfiniteWidgets = (tenantID, searchQuery = "") => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingWidgets,
    error: loadWidgetsError,
    refetch: refetchWidgets,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllWidgetsAPI({
        tenantID,
        search: searchQuery,
        page: pageParam,
        pageSize: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: Boolean(tenantID),
    refetchOnWindowFocus: false,
  });

  const widgets = data?.pages?.flatMap((page) => page.widgets || []) || [];

  return {
    widgets,
    isLoadingWidgets,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadWidgetsError,
    refetchWidgets,
  };
};
