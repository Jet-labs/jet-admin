import { Button } from "@mui/material";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo, useState } from "react";
import { duplicateQueryAPI } from "../../../api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { IoTrash } from "react-icons/io5";
import { FaCopy } from "react-icons/fa6";
export const QueryDuplicateForm = ({ queryID }) => {
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
    mutationFn: ({ queryID }) => duplicateQueryAPI({ queryID }),
    retry: false,
    onSuccess: () => {
      displaySuccess("Duplicated row successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_QUERIES"]);
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
    duplicateQuery({ queryID: queryID });
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
          Duplicate
        </Button>
        <ConfirmationDialog
          open={isDuplicateQueryConfirmationOpen}
          onAccepted={_handleDuplicateQuery}
          onDecline={_handleCloseDuplicateQueryConfirmation}
          title={"Duplicate query?"}
          message={`Are you sure you want to duplicate query id - ${queryID}`}
        />
      </>
    )
  );
};
