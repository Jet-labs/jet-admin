import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { deleteJobByIDAPI } from "../../../api/jobs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const JobDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteJobConfirmationOpen, setIsDeleteJobConfirmationOpen] =
    useState(false);
  const navigate = useNavigate();

  const jobDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractJobDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteJobSuccess,
    isError: isDeleteJobError,
    error: deleteJobError,
    mutate: deleteJob,
  } = useMutation({
    mutationFn: ({ id }) => deleteJobByIDAPI({ pmJobID: id }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.JOB_DELETED_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.JOBS]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_JOBS.path());
      setIsDeleteJobConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteJobConfirmation = () => {
    setIsDeleteJobConfirmationOpen(true);
  };
  const _handleCloseDeleteJobConfirmation = () => {
    setIsDeleteJobConfirmationOpen(false);
  };

  const _handleDeleteJob = () => {
    deleteJob({ id });
  };
  return (
    jobDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteJobConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteJobConfirmationOpen}
          onAccepted={_handleDeleteJob}
          onDecline={_handleCloseDeleteJobConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.JOB_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.JOB_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
