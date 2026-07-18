import { useState } from "react";
import { Settings } from 'lucide-react';
import { CONSTANTS } from "../../../constants";
import { TenantRoleSelectionInput } from "../tenantRolesComponents/tenantRoleSelectionInput";
import PropTypes from "prop-types";
import React from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  DialogBody
} from "@jet-admin/ui";
export const APIKeyRoleSelectionDialog = ({
  tenantID,
  apiKeyEditorForm,
  isLoadingAPIKeyEditorForm = false,
}) => {
  APIKeyRoleSelectionDialog.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    apiKeyEditorForm: PropTypes.object.isRequired,
    isLoadingAPIKeyEditorForm: PropTypes.bool,
  };

  const [isAPIKeyRoleSelectDialogOpen, setIsAPIKeyRoleSelectDialogOpen] =
    useState(false);

  return (
    <>
      <Button
        onClick={() => setIsAPIKeyRoleSelectDialogOpen(true)}
        disabled={isLoadingAPIKeyEditorForm}
        type="button"
        variant="primary-ghost"
        className="w-fit text-nowrap"
      >
        {isLoadingAPIKeyEditorForm ? (
          <Spinner size={16} className="mr-2" />
        ) : (
            <Settings className="mr-2 h-4 w-4" />
        )}
        {CONSTANTS.STRINGS.UPDATE_TENANT_API_KEY_BY_ID_MANAGE_ROLES}
      </Button>
      <Dialog
        open={isAPIKeyRoleSelectDialogOpen}
        onOpenChange={setIsAPIKeyRoleSelectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {CONSTANTS.STRINGS.API_KEY_ROLE_SELECTION_TITLE}
            </DialogTitle>
            <DialogDescription>
              Choose which tenant roles this API key can access.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <TenantRoleSelectionInput
              tenantID={tenantID}
              selectedTenantRoleIDs={apiKeyEditorForm?.values?.roleIDs}
              setSelectedTenantRoleIDs={(roleIDs) =>
                apiKeyEditorForm.setFieldValue("roleIDs", roleIDs)
              }
            />
          </DialogBody>


          <DialogFooter>
            <Button
              onClick={() => setIsAPIKeyRoleSelectDialogOpen(false)}
              type="button"
              variant="outline"
            >
              {CONSTANTS.STRINGS.API_KEY_ROLE_SELECTION_CANCEL}
            </Button>

            <Button
              onClick={() => {
                setIsAPIKeyRoleSelectDialogOpen(false);
              }}
              type="button"

            >
              {CONSTANTS.STRINGS.API_KEY_ROLE_SELECTION_SUBMIT}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

