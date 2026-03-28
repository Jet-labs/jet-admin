import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDashboardByIDAPI } from "../../../data/apis/dashboard";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";
export const DashboardCloneForm = ({ tenantID, dashboardID }) => {
  DashboardCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    dashboardID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningDashboard, mutate: cloneDashboard } = useMutation(
    {
      mutationFn: () => {
        return cloneDashboardByIDAPI({
          tenantID,
          dashboardID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.CLONE_DASHBOARD_CLONING_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );

  const _handleCloneDashboard = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_DASHBOARD_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_DASHBOARD_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    cloneDashboard();
  };

  return (
    <Button
      onClick={_handleCloneDashboard}
      disabled={isCloningDashboard}
      type="button"
      variant="primary-ghost"
      size="sm"
      square
      className="shrink-0"
      aria-label="Clone dashboard"
    >
      {isCloningDashboard ? (
        <Spinner size={16} />
      ) : (
        <FaRegClone className="h-4 w-4" />
      )}
    </Button>
  );
};
