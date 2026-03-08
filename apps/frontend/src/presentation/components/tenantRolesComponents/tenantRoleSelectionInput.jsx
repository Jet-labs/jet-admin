import { CONSTANTS } from "../../../constants";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { getAllTenantRolesAPI } from "../../../data/apis/tenantRole";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Checkbox, Label } from "@jet-admin/ui";
export const TenantRoleSelectionInput = ({
  label,
  tenantID,
  selectedTenantRoleIDs,
  setSelectedTenantRoleIDs,
}) => {
  TenantRoleSelectionInput.propTypes = {
    label: PropTypes.string,
    tenantID: PropTypes.number.isRequired,
    selectedTenantRoleIDs: PropTypes.array.isRequired,
    setSelectedTenantRoleIDs: PropTypes.func.isRequired,
  };
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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
  });
  const tenantRoleIDToRoleNameMapping = useMemo(() => {
    const map = {};
    if (tenantRoles && tenantRoles.roles) {
      tenantRoles.roles.forEach((role) => {
        map[role.roleID] = role;
      });
    }
    return map;
  }, [tenantRoles]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRole = (roleID) => {
    const newValue = selectedTenantRoleIDs.includes(roleID)
      ? selectedTenantRoleIDs.filter((id) => id !== roleID)
      : [...selectedTenantRoleIDs, roleID];
    setSelectedTenantRoleIDs(newValue);
  };

  if (!tenantRoles || !tenantRoleIDToRoleNameMapping) return null;
  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenantRoles}
      isFetching={isFetchingTenantRoles}
      isRefetching={isRefetchingTenantRoles}
      error={tenantRolesError}
      refetch={refetchTenantRoles}
    >
      <div ref={containerRef} className="space-y-1.5">
        <Label htmlFor="roleSelection">
          {label || CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_SELECT_ROLES_LABEL}
        </Label>

        <div className="relative w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full min-h-8 h-auto flex flex-wrap gap-1 justify-start px-2 py-1 font-normal"
          >
            {selectedTenantRoleIDs.length > 0 ? (
              selectedTenantRoleIDs.map((id) => {
                const role = tenantRoleIDToRoleNameMapping[id];
                return (
                  <span
                    key={role.roleID}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                  >
                    {role.roleTitle}
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-muted-foreground">Select roles...</span>
            )}
          </Button>
          {isOpen && tenantRoles.roles && (
            <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {tenantRoles.roles.map((tenantRole) => (
                <div
                  key={tenantRole.roleID}
                  className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                  onClick={() => toggleRole(tenantRole.roleID)}
                >
                  <Checkbox
                    checked={selectedTenantRoleIDs.includes(tenantRole.roleID)}
                    onCheckedChange={() => { }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{tenantRole.roleTitle}</span>
                    <span className="text-xs text-muted-foreground">{tenantRole.roleDescription}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
