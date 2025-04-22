import { useState } from "react";
import { FaCog, FaTimes } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { TenantRoleSelectionInput } from "../tenantRolesComponents/tenantRoleSelectionInput";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

export const APIKeyRoleSelectionDialog = ({
  tenantID,
  apiKeyEditorForm,
  isLoadingAPIKeyEditorForm,
}) => {
  APIKeyRoleSelectionDialog.propTypes = {
    tenantID: PropTypes.number.isRequired,
    apiKeyEditorForm: PropTypes.object.isRequired,
    isLoadingAPIKeyEditorForm: PropTypes.bool.isRequired,
  };

  const [isAPIKeyRoleSelectDialogOpen, setIsAPIKeyRoleSelectDialogOpen] =
    useState(false);

  const _handleOpenAPIKeyRoleSelectDialog = () => {
    setIsAPIKeyRoleSelectDialogOpen(true);
  };
  const _handleCloseAPIKeyRoleSelectDialog = () => {
    setIsAPIKeyRoleSelectDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={_handleOpenAPIKeyRoleSelectDialog}
        disabled={isLoadingAPIKeyEditorForm}
        type="button"
        className="!outline-none !hover:outline-none  items-center text-nowrap w-fit inline-flex rounded bg-[#646cff]/10 px-3 py-1 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50"
      >
        {isLoadingAPIKeyEditorForm ? (
          <CircularProgress size={16} className="mr-2 !text-[#646cff]" />
        ) : (
          <FaCog className="mr-2 h-4 w-4 " />
        )}
        {CONSTANTS.STRINGS.UPDATE_TENANT_API_KEY_BY_ID_MANAGE_ROLES}
      </button>
      {isAPIKeyRoleSelectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-2 pl-4">
              <h2 className="text-lg font-medium text-slate-700">
                {CONSTANTS.STRINGS.API_KEY_ROLE_SELECTION_TITLE}
              </h2>
              <button
                onClick={_handleCloseAPIKeyRoleSelectDialog}
                className="rounded p-1 font-thin text-slate-700 hover:text-[#646cff] bg-white outline-none focus:outline-none border-0"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <TenantRoleSelectionInput
                  tenantID={tenantID}
                  selectedTenantRoleIDs={apiKeyEditorForm?.values?.roleIDs}
                  setSelectedTenantRoleIDs={(roleIDs) =>
                    apiKeyEditorForm.setFieldValue("roleIDs", roleIDs)
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 pt-0 flex flex-row justify-stretch items-center w-full">
              <button
                onClick={() => {
                  _handleCloseAPIKeyRoleSelectDialog();
                }}
                type="button"
                className={`flex w-full items-center justify-center rounded border border-[#646cff] bg-white px-4 py-2 text-sm font-medium text-[#646cff] hover:bg-[#646cff]/10 focus:outline-none focus:ring-2 focus:ring-[#646cff]/50 `}
              >
                {CONSTANTS.STRINGS.API_KEY_ROLE_SELECTION_SUBMIT}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

