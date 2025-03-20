import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllUserTenantsAPI } from "../../data/apis/tenant";
import { useAuthState } from "./authContext";

const TenantStateContext = React.createContext(undefined);
const TenantActionsContext = React.createContext(undefined);

const TenantContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();

  const {
    isLoading: isLoadingTenants,
    isFetching: isFetchingTenants,
    isRefetching: isRefetchingTenants,
    data: tenants,
    error: tenantsError,
    refetch: refetchTenants,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS],
    queryFn: getAllUserTenantsAPI,
    enabled: Boolean(user),
    retry: 3,
    cacheTime: 0,
    staleTime: 0,
  });

  const _handleSaveTenantLocally = (tenant) => {
    localStorage.setItem(
      CONSTANTS.LOCAL_STORAGE_KEYS.TENANT,
      JSON.stringify(tenant)
    );
  };

  const _handleSaveTenantLocallyAndReload = (tenant) => {
    localStorage.setItem(
      CONSTANTS.LOCAL_STORAGE_KEYS.TENANT,
      JSON.stringify(tenant)
    );
    window.location.href = "/";
  };

  return (
    <TenantStateContext.Provider
      value={{
        tenants,
        isFetchingTenants,
        isRefetchingTenants,
        isLoadingTenants,
      }}
    >
      <TenantActionsContext.Provider
        value={{
          refetchTenants,
          saveTenantLocally: _handleSaveTenantLocally,
          saveTenantLocallyAndReload: _handleSaveTenantLocallyAndReload,
        }}
      >
        {children}
      </TenantActionsContext.Provider>
    </TenantStateContext.Provider>
  );
};

const useTenantState = () => {
  const context = React.useContext(TenantStateContext);
  if (context === undefined) {
    throw new Error("useTenantState error");
  }

  return context;
};

const useTenantActions = () => {
  const context = React.useContext(TenantActionsContext);
  if (context === undefined) {
    throw new Error("useTenantActions error");
  }

  return context;
};

export {
  TenantActionsContext,
  TenantContextProvider,
  TenantStateContext,
  useTenantActions,
  useTenantState,
};
