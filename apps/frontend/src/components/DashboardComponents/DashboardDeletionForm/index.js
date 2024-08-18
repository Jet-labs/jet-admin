import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { deleteDashboardByIDAPI } from "../../../api/dashboards";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const DashboardDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [
    isDeleteDashboardConfirmationOpen,
    setIsDeleteDashboardConfirmationOpen,
  ] = useState(false);

  const dashboardDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractDashboardDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingDashboard,
    isSuccess: isDeletingDashboardSuccess,
    isError: isDeletingDashboardError,
    error: deleteDashboardError,
    mutate: deleteDashboard,
  } = useMutation({
    mutationFn: ({ id }) => {
      return deleteDashboardByIDAPI({ pmDashboardID: id });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.DASHBOARD_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS,
      ]);
      setIsDeleteDashboardConfirmationOpen(false);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path());
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
    deleteDashboard({ id });
  };
  return (
    dashboardDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteDashboardConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteDashboardConfirmationOpen}
          onAccepted={_handleDeleteDashboard}
          onDecline={_handleCloseDeleteDashboardConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.DASHBOARD_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.DASHBOARD_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
