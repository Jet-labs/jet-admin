import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { CONSTANTS } from "../../../constants";
import {
    deleteTenantRoleByIDAPI
} from "../../../data/apis/tenantRole";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";
export const TenantRoleDeletionForm = ({ tenantID, tenantRoleID }) => {
  TenantRoleDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    tenantRoleID: PropTypes.number.isRequired,
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
      <button
        onClick={_handleDeleteTenantRole}
        disabled={isDeletingTenantRole}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 mr-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingTenantRole ? (
          <CircularProgress className="!text-xs" size={20} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
