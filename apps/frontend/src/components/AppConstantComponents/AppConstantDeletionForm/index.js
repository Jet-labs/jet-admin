import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { deleteAppConstantByIDAPI } from "../../../api/appConstants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const AppConstantDeletionForm = ({ pmAppConstantID }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [
    isDeleteAppConstantConfirmationOpen,
    setIsDeleteAppConstantConfirmationOpen,
  ] = useState(false);
  const navigate = useNavigate();

  const deleteAppConstantAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.isAuthorizedToDeleteAppConstant(pmAppConstantID);
    } else {
      return false;
    }
  }, [pmUser, pmAppConstantID]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteAppConstantSuccess,
    isError: isDeleteAppConstantError,
    error: deleteAppConstantError,
    mutate: deleteAppConstant,
  } = useMutation({
    mutationFn: ({ pmAppConstantID }) =>
      deleteAppConstantByIDAPI({ appConstantID: pmAppConstantID }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_CONSTANTS,
      ]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_APP_CONSTANTS.path());
      setIsDeleteAppConstantConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteAppConstantConfirmation = () => {
    setIsDeleteAppConstantConfirmationOpen(true);
  };
  const _handleCloseDeleteAppConstantConfirmation = () => {
    setIsDeleteAppConstantConfirmationOpen(false);
  };

  const _handleDeleteAppConstant = () => {
    deleteAppConstant({ pmAppConstantID: pmAppConstantID });
  };
  return (
    deleteAppConstantAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteAppConstantConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteAppConstantConfirmationOpen}
          onAccepted={_handleDeleteAppConstant}
          onDecline={_handleCloseDeleteAppConstantConfirmation}
          title={
            LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_DELETION_CONFIRMATION_TITLE
          }
          message={`${LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_DELETION_CONFIRMATION_BODY} - ${pmAppConstantID}`}
        />
      </>
    )
  );
};
