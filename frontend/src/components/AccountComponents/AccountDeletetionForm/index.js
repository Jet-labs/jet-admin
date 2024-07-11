import { useMutation } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { deleteRowByIDAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { LOCAL_CONSTANTS } from "../../../constants";
export const AccountDeletionForm = ({ id, username }) => {
  const { pmUser } = useAuthState();
  const [isDeleteAccountConfirmationOpen, setIsDeleteAccountConfirmationOpen] =
    useState(false);

  const deleteAccountAuthorization = useMemo(() => {
    if (pmUser && pmUser) {
      const u = pmUser;
      const c = u.extractAuthorizationForRowDeletionFromPolicyObject(
        LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME
      );
      if (!c) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, [pmUser]);
  const {
    isPending: isDeletingAccount,
    isSuccess: isDeleteAccountSuccess,
    isError: isDeleteAccountError,
    error: deleteAccountError,
    mutate: deleteAccount,
  } = useMutation({
    mutationFn: ({ id }) =>
      deleteRowByIDAPI({
        tableName: LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME,
        id,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted row successfully");
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
