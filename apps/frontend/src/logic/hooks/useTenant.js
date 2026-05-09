import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllUserTenantsAPI } from "../../data/apis/tenant";
import { useAuthState } from "./useAuth";

export const useTenantState = () => {
  const { user } = useAuthState();

  const {
    isLoading: isLoadingTenants,
    isFetching: isFetchingTenants,
    isRefetching: isRefetchingTenants,
    data: tenants,
    error: tenantsError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS],
    queryFn: getAllUserTenantsAPI,
    enabled: Boolean(user),
    retry: 3,
    cacheTime: 0,
    staleTime: 0,
  });

  return {
    tenants,
    isFetchingTenants,
    isRefetchingTenants,
    isLoadingTenants: isLoadingTenants || !user,
    tenantsError,
  };
};

export const useTenantActions = () => {
  const { user } = useAuthState();

  const { refetch: refetchTenants } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS],
    queryFn: getAllUserTenantsAPI,
    enabled: Boolean(user),
    retry: 3,
    cacheTime: 0,
    staleTime: 0,
  });

  const saveTenantLocally = (tenant) => {
    localStorage.setItem(
      CONSTANTS.LOCAL_STORAGE_KEYS.TENANT,
      JSON.stringify(tenant)
    );
  };

  const saveTenantLocallyAndReload = (tenant) => {
    localStorage.setItem(
      CONSTANTS.LOCAL_STORAGE_KEYS.TENANT,
      JSON.stringify(tenant)
    );
    window.location.href = "/";
  };

  return {
    refetchTenants,
    saveTenantLocally,
    saveTenantLocallyAndReload,
  };
};
