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
      deleteAppConstantByIDAPI({ pmAppConstantID }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted app constant successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_JOBS"]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_JOBS.path());
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
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteAppConstantConfirmationOpen}
          onAccepted={_handleDeleteAppConstant}
          onDecline={_handleCloseDeleteAppConstantConfirmation}
          title={"Delete app constant?"}
          message={`Are you sure you want to delete app constant id - ${pmAppConstantID}`}
        />
      </>
    )
  );
};
