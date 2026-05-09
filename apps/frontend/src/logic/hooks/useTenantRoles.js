import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllTenantRolesAPI } from "../../data/apis/tenantRole";

export const useTenantRoles = (tenantID) => {
  const {
    isLoading: isLoadingTenantRoles,
    isFetching: isFetchingTenantRoles,
    isRefetching: isRefetchingTenantRoles,
    data: tenantRoles,
    error: tenantRolesError,
    refetch: refetchTenantRoles,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID)],
    queryFn: () => getAllTenantRolesAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    isLoadingTenantRoles,
    isFetchingTenantRoles,
    isRefetchingTenantRoles,
    tenantRoles,
    tenantRolesError,
    refetchTenantRoles,
  };
};
