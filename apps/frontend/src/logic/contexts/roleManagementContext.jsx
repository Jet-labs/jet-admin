import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";

import PropTypes from "prop-types";
import {
  getAllTenantPermissionsAPI,
  getAllTenantRolesAPI,
} from "../../data/apis/tenantRole";

const RoleManagementStateContext = React.createContext(undefined);
const RoleManagementActionsContext = React.createContext(undefined);

const RoleManagementContextProvider = ({ children }) => {
  RoleManagementContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingTenantRoles,
    isFetching: isFetchingTenantRoles,
    isRefetching: isRefetchingTenantRoles,
    data: tenantRoles,
    error: tenantRolesError,
    refetch: refetchTenantRoles,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID)],
    queryFn: () => {
      return getAllTenantRolesAPI({ tenantID });
    },
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingTenantPermissions,
    isFetching: isFetchingTenantPermissions,
    isRefetching: isRefetchingTenantPermissions,
    data: tenantPermissions,
    error: tenantPermissionsError,
    refetch: refetchTenantPermissions,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANT_PERMISSIONS(tenantID)],
    queryFn: () => {
      return getAllTenantPermissionsAPI({ tenantID });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <RoleManagementStateContext.Provider
      value={{
        isLoadingTenantRoles,
        isFetchingTenantRoles,
        isRefetchingTenantRoles,
        tenantRoles,
        isFetchingTenantPermissions,
        isLoadingTenantPermissions,
        isRefetchingTenantPermissions,
        tenantPermissions,
        tenantPermissionsError,
        tenantRolesError,
      }}
    >
      <RoleManagementActionsContext.Provider
        value={{
          refetchTenantRoles,
          refetchTenantPermissions,
        }}
      >
        {children}
      </RoleManagementActionsContext.Provider>
    </RoleManagementStateContext.Provider>
  );
};

const useRoleManagementState = () => {
  const context = React.useContext(RoleManagementStateContext);
  if (context === undefined) {
    throw new Error("useRoleManagementState error");
  }

  return context;
};

const useRoleManagementActions = () => {
  const context = React.useContext(RoleManagementActionsContext);
  if (context === undefined) {
    throw new Error("useRoleManagementActions error");
  }

  return context;
};

export {
  RoleManagementActionsContext,
  RoleManagementContextProvider,
  RoleManagementStateContext,
  useRoleManagementActions,
  useRoleManagementState,
};
