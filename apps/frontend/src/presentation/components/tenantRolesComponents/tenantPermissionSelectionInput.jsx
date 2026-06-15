import { useTenantPermissions } from "../../../logic/hooks/useTenantPermissions";
import React, { useMemo } from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

import { Label, Spinner, MultiSearchSelect } from "@jet-admin/ui";

export const TenantPermissionSelectionInput = ({
  label,
  helperText,
  value = [],
  onChange,
  error,
}) => {
  const { tenantID } = useParams();
  const {
    tenantPermissions,
    tenantPermissionsError,
    isLoadingTenantPermissions,
  } = useTenantPermissions(tenantID);

  // Filter out asset permissions — those are managed separately
  const filteredPermissions = useMemo(() => {
    if (!tenantPermissions || !tenantPermissions.permissions) return [];
    return tenantPermissions.permissions.filter(
      (p) => !p.permissionTitle.startsWith("tenant:asset:")
    );
  }, [tenantPermissions]);

  // Build the options list for MultiSearchSelect
  const permissionOptions = useMemo(() => {
    return filteredPermissions.map((p) => ({
      value: p.permissionID,
      label: p.permissionTitle,
      description: p.permissionDescription,
    }));
  }, [filteredPermissions]);

  const handleChange = (newValue) => {
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
    <div className="space-y-1.5">
      <Label htmlFor="rolePermissions">
        {label || CONSTANTS.STRINGS.TENANT_PERMISSION_SELECTION_LABEL}
      </Label>
      <MultiSearchSelect
        value={value}
        onChange={handleChange}
        options={permissionOptions}
        placeholder="Select permissions..."
        searchPlaceholder="Search permissions..."
        badgeClassName="border-primary/50 bg-primary/10 text-primary"
      />
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

TenantPermissionSelectionInput.propTypes = {
  label: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
