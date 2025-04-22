import {
  Checkbox,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useRoleManagementState } from "../../../logic/contexts/roleManagementContext";
import { useMemo } from "react";
import { CONSTANTS } from "../../../constants";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const TenantPermissionSelectionInput = ({
  label,
  value,
  onChange,
}) => {
  const { tenantPermissions } = useRoleManagementState();

  const tenantPermissionIDToPermissionMapping = useMemo(() => {
    const map = {};
    if (tenantPermissions && tenantPermissions.permissions) {
      tenantPermissions.permissions.forEach((permission) => {
        map[permission.permissionID] = permission;
      });
    }
    return map;
  }, [tenantPermissions]);
  if (!tenantPermissions || !tenantPermissions.permissions) return null;
  return (
    <div>
      <label
        htmlFor="rolePermissions"
        className="block mb-1 text-sm font-medium text-slate-500"
      >
        {label || CONSTANTS.STRINGS.TENANT_PERMISSION_SELECTION_LABEL}
      </label>
      {/* Combinator Select */}
      <div className="relative w-full">
        <Select
          size="small"
          id="rolePermissions"
          multiple
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1 !important", // Change border color here
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1 !important", // Change hover border color
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#334155 !important", // Change focused border color
              borderWidth: 1,
            },
            "& MuiSelect-select": {
              color: "#cbd5e1 !important",
            },
          }}
          value={value}
          onChange={onChange}
          input={<OutlinedInput />}
          renderValue={(selected) => (
            <div className="flex flex-wrap gap-1">
              {selected.map((id) => {
                const permission = tenantPermissionIDToPermissionMapping[id];
                return (
                  <span
                    key={id}
                    className="px-2 py-1 bg-[#646cff]/10 text-[#646cff] rounded text-xs font-medium"
                  >
                    {permission?.permissionName}
                  </span>
                );
              })}
            </div>
          )}
          MenuProps={MenuProps}
          className="!w-full"
        >
          {tenantPermissions.permissions.map((tenantPermission) => (
            <MenuItem
              key={tenantPermission.permissionID}
              value={tenantPermission.permissionID}
            >
              <Checkbox
                checked={value?.includes(tenantPermission.permissionID)}
              />
              <ListItemText
                primary={tenantPermission.permissionName}
                secondary={tenantPermission.permissionDescription}
              />
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};
