import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDashboardByIDAPI } from "../../../data/apis/dashboard";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";
export const DashboardDeletionForm = ({ tenantID, dashboardID }) => {
  DashboardDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    dashboardID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingDashboard, mutate: deleteDashboard } =
    useMutation({
      mutationFn: () => {
        return deleteDashboardByIDAPI({
          tenantID,
          dashboardID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DELETE_DASHBOARD_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteDashboard = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_DASHBOARD_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_DASHBOARD_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDashboard();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="sm"
      square
      onClick={_handleDeleteDashboard}
      disabled={isDeletingDashboard}
      type="button"
      className="shrink-0"
      aria-label="Delete dashboard"
    >
      {isDeletingDashboard ? (
        <Spinner size={16} />
      ) : (
        <MdDeleteOutline className="h-4 w-4" />
      )}
    </Button>
  );
};
