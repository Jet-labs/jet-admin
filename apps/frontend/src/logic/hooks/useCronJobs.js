import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllCronJobsAPI } from "../../data/apis/cronJob";

export const useCronJobs = (tenantID, options = {}) => {
  const { search, page, pageSize } = options;
  const {
    isLoading: isLoadingCronJobs,
    data: cronJobsData,
    error: loadCronJobsError,
    isFetching: isFetchingCronJobs,
    isRefetching: isRefetchingCronJobs,
    refetch: refetchCronJobs,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      { search, page, pageSize },
    ],
    queryFn: () => getAllCronJobsAPI({ tenantID, search, page, pageSize }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  const cronJobs = Array.isArray(cronJobsData)
    ? cronJobsData
    : cronJobsData?.cronJobs || [];

  return {
    cronJobs,
    isLoadingCronJobs,
    isFetchingCronJobs,
    loadCronJobsError,
    isRefetchingCronJobs,
    refetchCronJobs,
  };
};

export const useInfiniteCronJobs = (tenantID, searchQuery = "", options = {}) => {
  const { enabled = true } = options;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingCronJobs,
    error: loadCronJobsError,
    refetch: refetchCronJobs,
  } = useInfiniteQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID), "infinite", searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllCronJobsAPI({
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

  const cronJobs = data?.pages?.flatMap((page) => page.cronJobs || []) || [];

  return {
    cronJobs,
    isLoadingCronJobs,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadCronJobsError,
    refetchCronJobs,
  };
};
