import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllTenantUsersAPI } from "../../data/apis/userManagement";

export const useTenantUsers = (tenantID) => {
  const {
    isLoading: isLoadingTenantUsers,
    isFetching: isFetchingTenantUsers,
    isRefetching: isRefetchingTenantUsers,
    data: tenantUsers,
    error: tenantUsersError,
    refetch: refetchTenantUsers,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_USERS(tenantID)],
    queryFn: () => getAllTenantUsersAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    isLoadingTenantUsers,
    isFetchingTenantUsers,
    isRefetchingTenantUsers,
    tenantUsers,
    tenantUsersError,
    refetchTenantUsers,
  };
};
