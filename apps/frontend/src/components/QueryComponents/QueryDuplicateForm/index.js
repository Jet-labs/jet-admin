import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { duplicateQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
export const QueryDuplicateForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [
    isDuplicateQueryConfirmationOpen,
    setIsDuplicateQueryConfirmationOpen,
  ] = useState(false);

  const queryAddAuthorization = useMemo(() => {
    return pmUser && pmUser.extractQueryAddAuthorization();
  }, [pmUser]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDuplicateQuerySuccess,
    isError: isDuplicateQueryError,
    error: duplicateQueryError,
    mutate: duplicateQuery,
  } = useMutation({
    mutationFn: ({ id }) => duplicateQueryAPI({ pmQueryID: id }),
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
    duplicateQuery({ id });
  };
  return (
    queryAddAuthorization && (
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
          message={`${LOCAL_CONSTANTS.STRINGS.QUERY_DUPLICATE_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
