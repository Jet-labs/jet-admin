import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllListenersAPI } from "../../data/apis/listener";

export const useListeners = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingListeners,
    data: listenersData,
    error: loadListenersError,
    isFetching: isFetchingListeners,
    isRefetching: isRefetchingListeners,
    refetch: refetchListeners,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllListenersAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const listeners = Array.isArray(listenersData)
    ? listenersData
    : listenersData?.listeners || [];

  return {
    listeners,
    isLoadingListeners,
    isFetchingListeners,
    loadListenersError,
    isRefetchingListeners,
    refetchListeners,
  };
};

export const useInfiniteListeners = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true, folderID } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingListeners,
    error: loadListenersError,
    refetch: refetchListeners,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID), "infinite", searchQuery, folderID ?? null],
    queryFn: ({ pageParam = 1 }) =>
      getAllListenersAPI({
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

  const listeners = data?.pages?.flatMap((page) => page.listeners || []) || [];

  return {
    listeners,
    isLoadingListeners,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadListenersError,
    refetchListeners,
  };
};
