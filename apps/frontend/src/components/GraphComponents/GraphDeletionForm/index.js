import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { deleteGraphByIDAPI } from "../../../api/graphs";
import { useNavigate } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const GraphDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteGraphConfirmationOpen, setIsDeleteGraphConfirmationOpen] =
    useState(false);

  const graphDeleteAuthorization = useMemo(() => {
    if (pmUser) {
      return pmUser.extractGraphDeleteAuthorization(id);
    } else {
      return false;
    }
  }, [pmUser, id]);

  const {
    isPending: isDeletingGraph,
    isSuccess: isDeletingGraphSuccess,
    isError: isDeletingGraphError,
    error: deleteGraphError,
    mutate: deleteGraph,
  } = useMutation({
    mutationFn: ({ id }) => {
      return deleteGraphByIDAPI({ pmGraphID: id });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.GRAPH_DELETED_SUCCESS);
      setIsDeleteGraphConfirmationOpen(false);
      navigate(LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.path());
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.GRAPHS]);
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
    deleteGraph({ id });
  };
  return (
    graphDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteGraphConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
          disabled={isDeletingGraph}
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteGraphConfirmationOpen}
          onAccepted={_handleDeleteGraph}
          onDecline={_handleCloseDeleteGraphConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.GRAPH_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.GRAPH_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
