import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { deletePolicyByIDAPI } from "../../../api/policy";
export const PolicyDeletionForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteRowConfirmationOpen, setIsDeleteRowConfirmationOpen] =
    useState(false);

  const policyDeleteAuthorization = useMemo(() => {
    if (pmUser && pmUser) {
      const u = pmUser;
      const c = u.extractPolicyDeleteAuthorization();
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
      deletePolicyByIDAPI({
        pmPolicyObjectID: id,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.POLICY_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.POLICIES,
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
    policyDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteRowConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {LOCAL_CONSTANTS.STRINGS.DELETE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDeleteRowConfirmationOpen}
          onAccepted={_handleDeleteRow}
          onDecline={_handleCloseDeleteRowConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.POLICY_DELETION_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.POLICY_DELETION_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
