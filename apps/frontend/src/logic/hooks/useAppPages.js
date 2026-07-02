import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllAppPagesAPI } from "../../data/apis/appPage";

export const useAppPages = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingAppPages,
    data: appPagesData,
    error: loadAppPagesError,
    isFetching: isFetchingAppPages,
    isRefetching: isRefetchingAppPages,
    refetch: refetchAppPages,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllAppPagesAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const appPages = Array.isArray(appPagesData)
    ? appPagesData
    : appPagesData?.appPages || [];

  return {
    appPages,
    isLoadingAppPages,
    isFetchingAppPages,
    loadAppPagesError,
    isRefetchingAppPages,
    refetchAppPages,
  };
};

export const useInfiniteAppPages = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingAppPages,
    error: loadAppPagesError,
    refetch: refetchAppPages,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllAppPagesAPI({
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

  const appPages = data?.pages?.flatMap((page) => page.appPages || []) || [];

  return {
    appPages,
    isLoadingAppPages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadAppPagesError,
    refetchAppPages,
  };
};
