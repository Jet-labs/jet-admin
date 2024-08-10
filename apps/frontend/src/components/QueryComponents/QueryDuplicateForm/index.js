import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { duplicateQueryAPI } from "../../../api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { FaCopy } from "react-icons/fa6";
import { LOCAL_CONSTANTS } from "../../../constants";
export const QueryDuplicateForm = ({ pmQueryID }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [
    isDuplicateQueryConfirmationOpen,
    setIsDuplicateQueryConfirmationOpen,
  ] = useState(false);

  const isAuthorizedToAddQuery = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddQuery;
  }, [pmUser]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDuplicateQuerySuccess,
    isError: isDuplicateQueryError,
    error: duplicateQueryError,
    mutate: duplicateQuery,
  } = useMutation({
    mutationFn: ({ pmQueryID }) => duplicateQueryAPI({ pmQueryID }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.QUERY_ADDITION_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDuplicateQueryConfirmation = () => {
    setIsDuplicateQueryConfirmationOpen(true);
  };
  const _handleCloseDuplicateQueryConfirmation = () => {
    setIsDuplicateQueryConfirmationOpen(false);
  };

  const _handleDuplicateQuery = () => {
    duplicateQuery({ pmQueryID: pmQueryID });
  };
  return (
    isAuthorizedToAddQuery && (
      <>
        <Button
          onClick={_handleOpenDuplicateQueryConfirmation}
          startIcon={<FaCopy className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="primary"
        >
          {LOCAL_CONSTANTS.STRINGS.DUPLICATE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDuplicateQueryConfirmationOpen}
          onAccepted={_handleDuplicateQuery}
          onDecline={_handleCloseDuplicateQueryConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.QUERY_DUPLICATE_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.QUERY_DUPLICATE_CONFIRMATION_BODY} - ${pmQueryID}`}
        />
      </>
    )
  );
};
