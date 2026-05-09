import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDashboardsAPI } from "../../data/apis/dashboard";

export const useDashboards = (tenantID) => {
  const {
    isLoading: isLoadingDashboards,
    data: dashboards,
    error: loadDashboardsError,
    isFetching: isFetchingDashboards,
    isRefetching: isRefetchingDashboards,
    refetch: refetchDashboards,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID)],
    queryFn: () => getAllDashboardsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    dashboards,
    isLoadingDashboards,
    isFetchingDashboards,
    loadDashboardsError,
    isRefetchingDashboards,
    refetchDashboards,
  };
};
