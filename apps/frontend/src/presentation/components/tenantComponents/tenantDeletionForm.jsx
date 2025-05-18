import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";
import { deleteUserTenantByIDAPI } from "../../../data/apis/tenant";

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
      <button
        onClick={_handleDeleteTenant}
        disabled={isDeletingTenant}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 ms-2 px-3 py-1.5 text-xs font-medium text-center text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingTenant ? (
          <CircularProgress className="mr-2" size={16} color="white" />
        ) : null}
        {isDeletingTenant
          ? "Deleting..."
          : CONSTANTS.STRINGS.DELETE_TENANT_CONFIRM_BUTTON}
      </button>
    </>
  );
};
