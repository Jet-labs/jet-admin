import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { deleteQueryByIDAPI } from "../../../api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const QueryDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteQueryConfirmationOpen, setIsDeleteQueryConfirmationOpen] =
    useState(false);
  const navigate = useNavigate();

  const queryDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractQueryDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteQuerySuccess,
    isError: isDeleteQueryError,
    error: deleteQueryError,
    mutate: deleteQuery,
  } = useMutation({
    mutationFn: ({ id }) => deleteQueryByIDAPI({ pmQueryID: id }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.QUERY_DELETED_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES]);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.path());
      setIsDeleteQueryConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteQueryConfirmation = () => {
    setIsDeleteQueryConfirmationOpen(true);
  };
  const _handleCloseDeleteQueryConfirmation = () => {
    setIsDeleteQueryConfirmationOpen(false);
  };

  const _handleDeleteQuery = () => {
    deleteQuery({ id });
  };
  return (
    queryDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteQueryConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteQueryConfirmationOpen}
          onAccepted={_handleDeleteQuery}
          onDecline={_handleCloseDeleteQueryConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.QUERY_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.QUERY_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
