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
export const PolicyDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteRowConfirmationOpen, setIsDeleteRowConfirmationOpen] =
    useState(false);

  const deleteRowAuthorization = useMemo(() => {
    if (pmUser && pmUser) {
      const u = pmUser;
      const c = u.extractAuthorizationForRowDeletionFromPolicyObject(
        LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME
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
    isPending: isDeletingRow,
    isSuccess: isDeleteRowSuccess,
    isError: isDeleteRowError,
    error: deleteRowError,
    mutate: deleteRow,
  } = useMutation({
    mutationFn: ({ id }) =>
      deleteRowByIDAPI({
        tableName: LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME,
        id,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted row successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(
          LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME
        ).toUpperCase()}`,
      ]);
      navigate(-1);
      setIsDeleteRowConfirmationOpen(false);
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
    deleteRow({ id });
  };
  return (
    deleteRowAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteRowConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
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
