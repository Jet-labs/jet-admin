import {
  Checkbox,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { CONSTANTS } from "../../../constants";
import { useCallback, useMemo } from "react";
import { getAllTenantRolesAPI } from "../../../data/apis/tenantRole";
import { useQuery } from "@tanstack/react-query";

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

export const TenantRoleSelectionInput = ({
  label,
  tenantID,
  selectedTenantRoleIDs,
  setSelectedTenantRoleIDs,
}) => {
  console.log({ selectedTenantRoleIDs });
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

  const _handleOnTenantRoleSelectionChange = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;
      setSelectedTenantRoleIDs(
        // On autofill we get a stringified value.
        typeof value === "string" ? value.split(",") : value
      );
    },
    [selectedTenantRoleIDs, setSelectedTenantRoleIDs]
  );
  if (!tenantRoles || !tenantRoleIDToRoleNameMapping) return null;
  return (
    <div>
      <label
        htmlFor="roleSelection"
        className="block text-sm font-medium text-slate-500 mb-1"
      >
        {label || CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_SELECT_ROLES_LABEL}
      </label>
      {/* Combinator Select */}
      <div className="relative w-full">
        <Select
          size="small"
          id="roleSelection"
          multiple
          value={selectedTenantRoleIDs}
          onChange={_handleOnTenantRoleSelectionChange}
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
          }}
          input={<OutlinedInput />}
          renderValue={(selected) => (
            <div className="flex flex-wrap gap-1">
              {selected.map((id) => {
                const role = tenantRoleIDToRoleNameMapping[id];
                console.log({ role });
                return (
                  <span
                    key={role.roleID}
                    className="px-2 py-1 bg-[#646cff]/10 text-[#646cff] rounded text-xs font-medium"
                  >
                    {role.roleName}
                  </span>
                );
              })}
            </div>
          )}
          MenuProps={MenuProps}
          className="!w-full"
        >
          {tenantRoles.roles.map((tenantRole) => (
            <MenuItem key={tenantRole.roleID} value={tenantRole.roleID}>
              <Checkbox
                checked={selectedTenantRoleIDs.includes(tenantRole.roleID)}
              />
              <ListItemText
                primary={tenantRole.roleName}
                secondary={tenantRole.roleDescription}
              />
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};
