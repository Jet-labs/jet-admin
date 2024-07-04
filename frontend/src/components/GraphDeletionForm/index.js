import { Button } from "@mui/material";
import { useAuthState } from "../../contexts/authContext";
import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../utils/notification";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { deleteGraphByIDAPI } from "../../api/graphs";
export const GraphDeletionForm = ({ graphID }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteGraphConfirmationOpen, setIsDeleteGraphConfirmationOpen] =
    useState(false);

  const deleteGraphAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.isAuthorizedToDeleteGraph(graphID);
    } else {
      return false;
    }
  }, [pmUser, graphID]);

  const {
    isPending: isDeletingGraph,
    isSuccess: isDeletingGraphSuccess,
    isError: isDeletingGraphError,
    error: deleteGraphError,
    mutate: deleteGraph,
  } = useMutation({
    mutationFn: () => {
      return deleteGraphByIDAPI({ graphID: graphID });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Deleted graph layout successfully");
      queryClient.invalidateQueries([`REACT_QUERY_KEY_GRAPH`]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteGraphConfirmation = () => {
    setIsDeleteGraphConfirmationOpen(true);
  };
  const _handleCloseDeleteGraphConfirmation = () => {
    setIsDeleteGraphConfirmationOpen(false);
  };

  const _handleDeleteGraph = () => {
    deleteGraph({ graphID: graphID });
  };
  return (
    deleteGraphAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteGraphConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          Delete
        </Button>
        <ConfirmationDialog
          open={isDeleteGraphConfirmationOpen}
          onAccepted={_handleDeleteGraph}
          onDecline={_handleCloseDeleteGraphConfirmation}
          title={"Delete graph?"}
          message={`Are you sure you want to delete graph id - ${graphID}`}
        />
      </>
    )
  );
};
