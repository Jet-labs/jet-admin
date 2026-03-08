import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { TenantRoleSelectionInput } from "./tenantRoleSelectionInput";
import PropTypes from "prop-types";

import { Button, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@jet-admin/ui";
export const TenantRoleSelectionDialog = ({
  tenantID,
  isUserTenantAdmin,
  initialSelectedTenantRoles = [],
  isTenantRoleSelectDialogOpen,
  handleCloseTenantRoleSelectDialog,
  handleSubmitTenantRoleSelectDialog,
  isAdminSelectionEnabled = true,
}) => {
  TenantRoleSelectionDialog.propTypes = {
    tenantID: PropTypes.number.isRequired,
    isUserTenantAdmin: PropTypes.bool.isRequired,
    initialSelectedTenantRoles: PropTypes.array,
    isTenantRoleSelectDialogOpen: PropTypes.bool.isRequired,
    handleCloseTenantRoleSelectDialog: PropTypes.func.isRequired,
    handleSubmitTenantRoleSelectDialog: PropTypes.func.isRequired,
    isAdminSelectionEnabled: PropTypes.bool,
  };
  const [selectedTenantRoleIDs, setSelectedTenantRoleIDs] = useState(
    initialSelectedTenantRoles
  );

  const [userTenantRelationship, setUserTenantRelationship] = useState(
    isUserTenantAdmin
      ? CONSTANTS.ROLES.PRIMARY.ADMIN.value
      : CONSTANTS.ROLES.PRIMARY.MEMBER.value
  );

  return (
    <Dialog open={isTenantRoleSelectDialogOpen} onOpenChange={(open) => {
      if (!open) handleCloseTenantRoleSelectDialog();
    }}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle>{CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {isAdminSelectionEnabled && (
              <div className="w-full flex flex-col bg-muted justify-start items-start gap-2 p-2 border-border rounded">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                  <Checkbox
                    checked={
                      userTenantRelationship ==
                      CONSTANTS.ROLES.PRIMARY.ADMIN.value
                    }
                    onCheckedChange={(checked) => {
                      setUserTenantRelationship(
                        checked
                          ? CONSTANTS.ROLES.PRIMARY.ADMIN.value
                          : CONSTANTS.ROLES.PRIMARY.MEMBER.value
                      );
                    }}
                  />
                  <span className="text-sm font-medium mr-2 text-foreground">
                    {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_MEMBERSHIP_LABEL}
                  </span>
                </div>
                <span className="text-xs font-normal text-muted-foreground">
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

        <DialogFooter className="p-4 pt-0 w-full">
          <Button
            onClick={() => {
              handleSubmitTenantRoleSelectDialog({
                roleIDs: selectedTenantRoleIDs,
                userTenantRelationship,
              });
            }}
            variant="default" className="w-full"
          >
            {CONSTANTS.STRINGS.TENANT_ROLE_SELECTION_SUBMIT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
