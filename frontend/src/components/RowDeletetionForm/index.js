import { useMutation } from "@tanstack/react-query";

import { Delete } from "@mui/icons-material";
import { Button } from "@mui/material";
import { deleteRowByIDAPI } from "../../api/delete";
import { useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import { displayError, displaySuccess } from "../../utils/notification";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { useMemo, useState } from "react";

export const RowDeletionForm = ({ tableName, id }) => {
  const { pmUser } = useAuthState();
  const [isDeleteRowConfirmationOpen, setIsDeleteRowConfirmationOpen] =
    useState(false);

  const deleteRowAuthorization = useMemo(() => {
    if (pmUser && pmUser && tableName) {
      const u = pmUser;
      const c = u.extractAuthorizationForRowDeletionFromPolicyObject(tableName);
      if (!c) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, [pmUser, tableName]);
  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteRowSuccess,
    isError: isDeleteRowError,
    error: deleteRowError,
    mutate: deleteRow,
  } = useMutation({
    mutationFn: ({ tableName, id }) => deleteRowByIDAPI({ tableName, id }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted row successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteRowConfirmation = () => {
    setIsDeleteRowConfirmationOpen(true);
  };
  const _handleCloseDeleteRowConfirmation = () => {
    setIsDeleteRowConfirmationOpen(false);
  };

  const _handleDeleteRow = () => {
    deleteRow({ tableName, id });
  };
  return (
    deleteRowAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteRowConfirmation}
          startIcon={<Delete fontSize="large" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteRowConfirmationOpen}
          onAccepted={_handleDeleteRow}
          onDecline={_handleCloseDeleteRowConfirmation}
          title={"Delete row?"}
          message={`Are you sure you want to delete row id - ${id}`}
        />
      </>
    )
  );
};
