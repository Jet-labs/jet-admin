import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";
import { deleteUserTenantByIDAPI } from "../../../data/apis/tenant";

import { Button, Spinner } from "@jet-admin/ui";
export const TenantDeletionForm = ({ tenantID }) => {
  TenantDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingTenant, mutate: deleteTenant } = useMutation({
    mutationFn: () => {
      return deleteUserTenantByIDAPI({
        tenantID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_TENANT_SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS] });
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteTenant = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_TENANT_CONFIRMATION_TITLE,
      message: CONSTANTS.STRINGS.DELETE_TENANT_CONFIRMATION_DESCRIPTION,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteTenant();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="sm"
      square
      onClick={_handleDeleteTenant}
      disabled={isDeletingTenant}
      type="button"
    >
      {isDeletingTenant ? (
        <Spinner size={14} />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
};
