import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";

export const useDataQueries = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingDataQueries,
    data: dataQueriesData,
    error: loadDataQueriesError,
    isFetching: isFetchingDataQueries,
    isRefetching: isRefetchingDataQueries,
    refetch: refetchDataQueries,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllDataQueriesAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const dataQueries = Array.isArray(dataQueriesData)
    ? dataQueriesData
    : dataQueriesData?.dataQueries || [];

  return {
    dataQueries,
    isLoadingDataQueries,
    isFetchingDataQueries,
    loadDataQueriesError,
    isRefetchingDataQueries,
    refetchDataQueries,
  };
};

export const useInfiniteDataQueries = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingDataQueries,
    error: loadDataQueriesError,
    refetch: refetchDataQueries,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllDataQueriesAPI({
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

  const dataQueries = data?.pages?.flatMap((page) => page.dataQueries || []) || [];

  return {
    dataQueries,
    isLoadingDataQueries,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadDataQueriesError,
    refetchDataQueries,
  };
};
