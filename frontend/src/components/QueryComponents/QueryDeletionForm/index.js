import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { deleteQueryByIDAPI } from "../../../api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
export const QueryDeletionForm = ({ pmQueryID }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteQueryConfirmationOpen, setIsDeleteQueryConfirmationOpen] =
    useState(false);

  const deleteQueryAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.isAuthorizedToDeleteQuery(pmQueryID);
    } else {
      return false;
    }
  }, [pmUser, pmQueryID]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDeleteQuerySuccess,
    isError: isDeleteQueryError,
    error: deleteQueryError,
    mutate: deleteQuery,
  } = useMutation({
    mutationFn: ({ pmQueryID }) => deleteQueryByIDAPI({ pmQueryID }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted row successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_QUERIES"]);
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
    deleteQuery({ pmQueryID: pmQueryID });
  };
  return (
    deleteQueryAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteQueryConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteQueryConfirmationOpen}
          onAccepted={_handleDeleteQuery}
          onDecline={_handleCloseDeleteQueryConfirmation}
          title={"Delete query?"}
          message={`Are you sure you want to delete query id - ${pmQueryID}`}
        />
      </>
    )
  );
};
