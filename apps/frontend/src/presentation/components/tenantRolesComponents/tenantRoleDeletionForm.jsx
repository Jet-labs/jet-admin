import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { CONSTANTS } from "../../../constants";
import {
    deleteTenantRoleByIDAPI
} from "../../../data/apis/tenantRole";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";
import { Button, Spinner } from "@jet-admin/ui";
export const TenantRoleDeletionForm = ({ tenantID, tenantRoleID }) => {
  TenantRoleDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    tenantRoleID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingTenantRole, mutate: deleteTenantRole } =
    useMutation({
      mutationFn: () => {
        return deleteTenantRoleByIDAPI({
          tenantID,
          tenantRoleID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.TENANT_ROLE_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.TENANT_ROLES(tenantID),
          tenantRoleID,
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteTenantRole = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.TENANT_ROLE_DELETION_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.TENANT_ROLE_DELETION_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteTenantRole();
  };

  return (
    <>
      <Button
        variant="destructive-ghost"
        onClick={_handleDeleteTenantRole}
        disabled={isDeletingTenantRole}
        type="button"
      >
        {isDeletingTenantRole ? (
          <Spinner className="mr-2" size={16} />
        ) : (
            <Trash2 className="mr-2 h-4 w-4" />
        )}
        {isDeletingTenantRole ? "Deleting..." : "Delete role"}
      </Button>
    </>
  );
};
