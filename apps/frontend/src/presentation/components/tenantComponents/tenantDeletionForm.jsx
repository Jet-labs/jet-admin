import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
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
      queryClient.invalidateQueries([CONSTANTS.REACT_QUERY_KEYS.TENANTS]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteTenant = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_TENANT_CONFIRMATION_TITLE,
      message: CONSTANTS.STRINGS.DELETE_TENANT_CONFIRMATION_DESCRIPTION,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteTenant();
  };

  return (
    <>
      <Button variant="destructive-ghost" onClick={_handleDeleteTenant} disabled={isDeletingTenant} type="button">
        {isDeletingTenant ? (
          <Spinner className="mr-2" size={16} />
        ) : null}
        {isDeletingTenant
          ? "Deleting..."
          : CONSTANTS.STRINGS.DELETE_TENANT_CONFIRM_BUTTON}
      </Button>
    </>
  );
};
