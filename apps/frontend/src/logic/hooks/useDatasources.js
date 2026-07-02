import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatasourcesAPI } from "../../data/apis/datasource";

export const useDatasources = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingDatasources,
    data: datasourcesData,
    error: loadDatasourcesError,
    isFetching: isFetchingDatasources,
    isRefetching: isRefetchingDatasources,
    refetch: refetchDatasources,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllDatasourcesAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const datasources = Array.isArray(datasourcesData)
    ? datasourcesData
    : datasourcesData?.datasources || [];

  return {
    datasources,
    isLoadingDatasources,
    isFetchingDatasources,
    loadDatasourcesError,
    isRefetchingDatasources,
    refetchDatasources,
  };
};

export const useInfiniteDatasources = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingDatasources,
    error: loadDatasourcesError,
    refetch: refetchDatasources,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllDatasourcesAPI({
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

  const datasources = data?.pages?.flatMap((page) => page.datasources || []) || [];

  return {
    datasources,
    isLoadingDatasources,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadDatasourcesError,
    refetchDatasources,
  };
};
