import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDashboardByIDAPI } from "../../../data/apis/dashboard";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
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
      type="button"
      variant="outline"
      size="icon"
      square
      className="shrink-0"
      aria-label="Clone dashboard"
      onClick={_handleCloneDashboard}
      disabled={isCloningDashboard}
    >
      {isCloningDashboard ? (
        <Spinner size={16} />
      ) : (
          <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};
