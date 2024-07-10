import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { deleteDashboardByIDAPI } from "../../../api/dashboards";
export const DashboardDeletionForm = ({ dashboardID }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [
    isDeleteDashboardConfirmationOpen,
    setIsDeleteDashboardConfirmationOpen,
  ] = useState(false);

  const deleteDashboardAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.isAuthorizedToDeleteDashboard(dashboardID);
    } else {
      return false;
    }
  }, [pmUser, dashboardID]);

  const {
    isPending: isDeletingDashboard,
    isSuccess: isDeletingDashboardSuccess,
    isError: isDeletingDashboardError,
    error: deleteDashboardError,
    mutate: deleteDashboard,
  } = useMutation({
    mutationFn: () => {
      return deleteDashboardByIDAPI({ dashboardID: dashboardID });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted dashboard layout successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_GRAPH`]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteDashboardConfirmation = () => {
    setIsDeleteDashboardConfirmationOpen(true);
  };
  const _handleCloseDeleteDashboardConfirmation = () => {
    setIsDeleteDashboardConfirmationOpen(false);
  };

  const _handleDeleteDashboard = () => {
    deleteDashboard({ dashboardID: dashboardID });
  };
  return (
    deleteDashboardAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteDashboardConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteDashboardConfirmationOpen}
          onAccepted={_handleDeleteDashboard}
          onDecline={_handleCloseDeleteDashboardConfirmation}
          title={"Delete dashboard?"}
          message={`Are you sure you want to delete dashboard id - ${dashboardID}`}
        />
      </>
    )
  );
};
