import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWidgetsAPI } from "../../data/apis/widget";

export const useWidgets = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingWidgets,
    data,
    error: loadWidgetsError,
    isFetching: isFetchingWidgets,
    isRefetching: isRefetchingWidgets,
    refetch: refetchWidgets,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllWidgetsAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    widgets: Array.isArray(data) ? data : data?.widgets || [],
    isLoadingWidgets,
    isFetchingWidgets,
    loadWidgetsError,
    isRefetchingWidgets,
    refetchWidgets,
  };
};

export const useInfiniteWidgets = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true, folderID } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingWidgets,
    error: loadWidgetsError,
    refetch: refetchWidgets,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), "infinite", searchQuery, folderID ?? null],
    queryFn: ({ pageParam = 1 }) =>
      getAllWidgetsAPI({
        tenantID,
        search: searchQuery,
        page: pageParam,
        pageSize: 50,
        folderID,
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
