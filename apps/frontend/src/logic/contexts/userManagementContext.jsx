import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";

import { useAuthState } from "./authContext";
import { getAllTenantUsersAPI } from "../../data/apis/userManagement";

const UserManagementStateContext = React.createContext(undefined);
const UserManagementActionsContext = React.createContext(undefined);

const UserManagementContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingTenantUsers,
    isFetching: isFetchingTenantUsers,
    isRefetching: isRefetchingTenantUsers,
    data: tenantUsers,
    error: tenantUsersError,
    refetch: refetchTenantUsers,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_USERS(tenantID)],
    queryFn: () => {
      return getAllTenantUsersAPI({ tenantID });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <UserManagementStateContext.Provider
      value={{
        isLoadingTenantUsers,
        isFetchingTenantUsers,
        isRefetchingTenantUsers,
        tenantUsers,
      }}
    >
      <UserManagementActionsContext.Provider
        value={{
          refetchTenantUsers,
        }}
      >
        {children}
      </UserManagementActionsContext.Provider>
    </UserManagementStateContext.Provider>
  );
};

const useUserManagementState = () => {
  const context = React.useContext(UserManagementStateContext);
  if (context === undefined) {
    throw new Error("useUserManagementState error");
  }

  return context;
};

const useUserManagementActions = () => {
  const context = React.useContext(UserManagementActionsContext);
  if (context === undefined) {
    throw new Error("useUserManagementActions error");
  }

  return context;
};

export {
  UserManagementActionsContext,
  UserManagementContextProvider,
  UserManagementStateContext,
  useUserManagementActions,
  useUserManagementState
};

