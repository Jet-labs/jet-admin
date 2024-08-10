import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { deleteRowByIDAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { deleteAccountByIDAPI } from "../../../api/accounts";
export const AccountDeletionForm = ({ id, username }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteAccountConfirmationOpen, setIsDeleteAccountConfirmationOpen] =
    useState(false);

  const deleteAccountAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.isAuthorizedToDeleteAppConstant(id);
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
      displaySuccess("Deleted account successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_ACCOUNTS`]);
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
    deleteAccountAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteAccountConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteAccountConfirmationOpen}
          onAccepted={_handleDeleteAccount}
          onDecline={_handleCloseDeleteAccountConfirmation}
          title={"Delete account?"}
          message={`Are you sure you want to delete account - ${username}`}
        />
      </>
    )
  );
};
