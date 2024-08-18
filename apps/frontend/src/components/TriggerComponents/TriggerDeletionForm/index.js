import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { deleteTriggerByIDAPI } from "../../../api/triggers";
export const TriggerDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteTriggerConfirmationOpen, setIsDeleteTriggerConfirmationOpen] =
    useState(false);
  const navigate = useNavigate();

  const triggerDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractTriggerDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteTriggerSuccess,
    isError: isDeleteTriggerError,
    error: deleteTriggerError,
    mutate: deleteTrigger,
  } = useMutation({
    mutationFn: ({ id }) => deleteTriggerByIDAPI({ pmTriggerID: id }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.TRIGGER_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TRIGGERS,
      ]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_TRIGGERS.path());
      setIsDeleteTriggerConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteTriggerConfirmation = () => {
    setIsDeleteTriggerConfirmationOpen(true);
  };
  const _handleCloseDeleteTriggerConfirmation = () => {
    setIsDeleteTriggerConfirmationOpen(false);
  };

  const _handleDeleteTrigger = () => {
    deleteTrigger({ id });
  };

  return (
    triggerDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteTriggerConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className=""
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteTriggerConfirmationOpen}
          onAccepted={_handleDeleteTrigger}
          onDecline={_handleCloseDeleteTriggerConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.TRIGGER_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.TRIGGER_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
