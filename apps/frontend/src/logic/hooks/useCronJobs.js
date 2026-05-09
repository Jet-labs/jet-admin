import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllCronJobsAPI } from "../../data/apis/cronJob";

export const useCronJobs = (tenantID) => {
  const {
    isLoading: isLoadingCronJobs,
    data: cronJobs,
    error: loadCronJobsError,
    isFetching: isFetchingCronJobs,
    isRefetching: isRefetchingCronJobs,
    refetch: refetchCronJobs,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID)],
    queryFn: () => getAllCronJobsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    cronJobs,
    isLoadingCronJobs,
    isFetchingCronJobs,
    loadCronJobsError,
    isRefetchingCronJobs,
    refetchCronJobs,
  };
};
