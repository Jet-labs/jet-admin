import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { deleteRowByIDAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const RowDeletionForm = ({ tableName, id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isDeleteRowConfirmationOpen, setIsDeleteRowConfirmationOpen] =
    useState(false);

  const rowDeleteAuthorization = useMemo(() => {
    if (pmUser && pmUser && tableName) {
      const u = pmUser;
      const c = u.extractRowDeleteAuthorization(tableName);
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
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ROW_DELETED_SUCCESS);
      setIsDeleteRowConfirmationOpen(false);
      navigate(-1);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
      ]);
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
    rowDeleteAuthorization && (
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
