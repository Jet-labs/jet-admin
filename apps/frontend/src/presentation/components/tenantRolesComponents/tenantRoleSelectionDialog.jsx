import { Checkbox } from "@mui/material";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { TenantRoleSelectionInput } from "./tenantRoleSelectionInput";

export const TenantRoleSelectionDialog = ({
  tenantID,
  isUserTenantAdmin,
  initialSelectedTenantRoles = [],
  isTenantRoleSelectDialogOpen,
  handleCloseTenantRoleSelectDialog,
  handleSubmitTenantRoleSelectDialog,
  isAdminSelectionEnabled = true,
}) => {
  const [selectedTenantRoleIDs, setSelectedTenantRoleIDs] = useState(
    initialSelectedTenantRoles
  );

  const [userTenantRelationship, setUserTenantRelationship] = useState(
    isUserTenantAdmin
      ? CONSTANTS.ROLES.PRIMARY.ADMIN.value
      : CONSTANTS.ROLES.PRIMARY.MEMBER.value
  );

  // Render nothing if the menu is not open
  if (!isTenantRoleSelectDialogOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2 pl-4">
          <h2 className="text-lg font-medium text-slate-700">
            {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_TITLE}
          </h2>
          <button
            onClick={handleCloseTenantRoleSelectDialog}
            className="rounded p-1 font-thin text-slate-700 hover:text-[#646cff] bg-white outline-none focus:outline-none border-0"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {isAdminSelectionEnabled && (
              <div className="w-full flex flex-col bg-slate-200 justify-start items-start gap-2 p-2 border-slate-200 rounded">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                  <Checkbox
                    checked={
                      userTenantRelationship ==
                      CONSTANTS.ROLES.PRIMARY.ADMIN.value
                    }
                    onChange={(_, checked) => {
                      setUserTenantRelationship(
                        checked
                          ? CONSTANTS.ROLES.PRIMARY.ADMIN.value
                          : CONSTANTS.ROLES.PRIMARY.MEMBER.value
                      );
                    }}
                    className="!p-0 text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50"
                  />
                  <span className="text-sm font-medium mr-2 text-slate-700">
                    {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_MEMBERSHIP_LABEL}
                  </span>
                </div>
                <span className="text-xs font-normal text-slate-700">
                  {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_MEMBERSHIP_INFO}
                </span>
              </div>
            )}
            {userTenantRelationship == CONSTANTS.ROLES.PRIMARY.MEMBER.value && (
              <TenantRoleSelectionInput
                tenantID={tenantID}
                selectedTenantRoleIDs={selectedTenantRoleIDs}
                setSelectedTenantRoleIDs={setSelectedTenantRoleIDs}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 flex flex-row justify-stretch items-center w-full">
          <button
            onClick={() => {
              handleSubmitTenantRoleSelectDialog({
                roleIDs: selectedTenantRoleIDs,
                userTenantRelationship,
              });
            }}
            className={`flex w-full items-center justify-center rounded border border-[#646cff] bg-white px-4 py-2 text-sm font-medium text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50 `}
          >
            {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_SUBMIT}
          </button>
        </div>
      </div>
    </div>
  );
};

