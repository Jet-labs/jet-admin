import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllTenantPermissionsAPI } from "../../data/apis/tenantRole";

export const useTenantPermissions = (tenantID) => {
  const {
    isLoading: isLoadingTenantPermissions,
    isFetching: isFetchingTenantPermissions,
    isRefetching: isRefetchingTenantPermissions,
    data: tenantPermissions,
    error: tenantPermissionsError,
    refetch: refetchTenantPermissions,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_PERMISSIONS(tenantID)],
    queryFn: () => getAllTenantPermissionsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    isLoadingTenantPermissions,
    isFetchingTenantPermissions,
    isRefetchingTenantPermissions,
    tenantPermissions,
    tenantPermissionsError,
    refetchTenantPermissions,
  };
};
