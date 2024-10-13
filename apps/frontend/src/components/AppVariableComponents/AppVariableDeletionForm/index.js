import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { deleteAppVariableByIDAPI } from "../../../api/appVariables";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const AppVariableDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [
    isDeleteAppVariableConfirmationOpen,
    setIsDeleteAppVariableConfirmationOpen,
  ] = useState(false);
  const navigate = useNavigate();

  const appVariableDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractAppVariableDeletionAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteAppVariableSuccess,
    isError: isDeleteAppVariableError,
    error: deleteAppVariableError,
    mutate: deleteAppVariable,
  } = useMutation({
    mutationFn: ({ id }) => deleteAppVariableByIDAPI({ pmAppVariableID: id }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_VARIABLESS,
      ]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_APP_VARIABLES.path());
      setIsDeleteAppVariableConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteAppVariableConfirmation = () => {
    setIsDeleteAppVariableConfirmationOpen(true);
  };
  const _handleCloseDeleteAppVariableConfirmation = () => {
    setIsDeleteAppVariableConfirmationOpen(false);
  };

  const _handleDeleteAppVariable = () => {
    deleteAppVariable({ id });
  };
  return (
    appVariableDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteAppVariableConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteAppVariableConfirmationOpen}
          onAccepted={_handleDeleteAppVariable}
          onDecline={_handleCloseDeleteAppVariableConfirmation}
          title={
            LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_DELETION_CONFIRMATION_TITLE
          }
          message={`${LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
