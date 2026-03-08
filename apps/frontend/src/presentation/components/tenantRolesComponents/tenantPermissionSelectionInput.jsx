import { useRoleManagementState } from "../../../logic/contexts/roleManagementContext";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";

import { Badge, Button, Checkbox, Label, Spinner } from "@jet-admin/ui";
export const TenantPermissionSelectionInput = ({
  label,
  helperText,
  value,
  onChange,
  error,
}) => {
  TenantPermissionSelectionInput.propTypes = {
    label: PropTypes.string,
    helperText: PropTypes.string,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  };
  const {
    tenantPermissions,
    tenantPermissionsError,
    isLoadingTenantPermissions,
  } = useRoleManagementState();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const tenantPermissionIDToPermissionMapping = useMemo(() => {
    const map = {};
    if (tenantPermissions && tenantPermissions.permissions) {
      tenantPermissions.permissions.forEach((permission) => {
        map[permission.permissionID] = permission;
      });
    }
    return map;
  }, [tenantPermissions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePermission = (permissionID) => {
    const newValue = value.includes(permissionID)
      ? value.filter((id) => id !== permissionID)
      : [...value, permissionID];
    onChange({ target: { value: newValue } });
  };

  if (isLoadingTenantPermissions) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="rolePermissions">
          {label || CONSTANTS.STRINGS.TENANT_PERMISSION_SELECTION_LABEL}
        </Label>
        <div className="flex h-10 items-center rounded-md border border-border px-3 text-sm text-muted-foreground">
          <Spinner size={16} className="mr-2" />
          Loading permissions...
        </div>
      </div>
    );
  }

  if (tenantPermissionsError) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="rolePermissions">
          {label || CONSTANTS.STRINGS.TENANT_PERMISSION_SELECTION_LABEL}
        </Label>
        <p className="text-xs text-red-500">Unable to load permissions.</p>
      </div>
    );
  }

  if (!tenantPermissions || !tenantPermissions.permissions) return null;
  return (
    <div ref={containerRef} className="space-y-1.5">
      <Label htmlFor="rolePermissions">
        {label || CONSTANTS.STRINGS.TENANT_PERMISSION_SELECTION_LABEL}
      </Label>
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-auto min-h-9 w-full flex-wrap justify-start gap-1 px-2 py-1 text-left font-normal"
        >
          {value.length > 0 ? (
            value.map((id) => {
              const permission = tenantPermissionIDToPermissionMapping[id];
              if (!permission) return null;

              return (
                <Badge
                  key={id}
                  variant="outline"
                  className="border-primary/50 bg-primary/10 text-primary"
                >
                  {permission.permissionTitle}
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-muted-foreground">
              Select permissions...
            </span>
          )}
        </Button>
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg">
            {tenantPermissions.permissions.map((tenantPermission) => (
              <div
                key={tenantPermission.permissionID}
                className="flex cursor-pointer items-start gap-2 p-2 hover:bg-muted"
                onClick={() => togglePermission(tenantPermission.permissionID)}
              >
                <Checkbox
                  checked={value?.includes(tenantPermission.permissionID)}
                  onCheckedChange={() => { }}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">
                    {tenantPermission.permissionTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tenantPermission.permissionDescription}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
};
