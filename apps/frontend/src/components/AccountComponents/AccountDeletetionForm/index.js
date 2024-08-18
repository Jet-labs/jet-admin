import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { deleteAccountByIDAPI } from "../../../api/accounts";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
export const AccountDeletionForm = ({ id, username }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteAccountConfirmationOpen, setIsDeleteAccountConfirmationOpen] =
    useState(false);

  const accountDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractAccountDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);
  const {
    isPending: isDeletingAccount,
    isSuccess: isDeleteAccountSuccess,
    isError: isDeleteAccountError,
    error: deleteAccountError,
    mutate: deleteAccount,
  } = useMutation({
    mutationFn: ({ id }) =>
      deleteAccountByIDAPI({
        pmAccountID: id,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ACCOUNT_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.ACCOUNTS,
      ]);
      navigate(-1);
      setIsDeleteAccountConfirmationOpen(false);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteAccountConfirmation = () => {
    setIsDeleteAccountConfirmationOpen(true);
  };
  const _handleCloseDeleteAccountConfirmation = () => {
    setIsDeleteAccountConfirmationOpen(false);
  };

  const _handleDeleteAccount = () => {
    deleteAccount({ id });
  };
  return (
    accountDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteAccountConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteAccountConfirmationOpen}
          onAccepted={_handleDeleteAccount}
          onDecline={_handleCloseDeleteAccountConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.ACCOUNT_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.ACCOUNT_DELETION_CONFIRMATION_BODY} - ${username}`}
        />
      </>
    )
  );
};
