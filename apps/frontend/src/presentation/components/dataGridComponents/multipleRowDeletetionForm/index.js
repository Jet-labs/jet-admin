import { useMutation, useQueryClient } from "@tanstack/@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import {
  deleteRowByIDAPI,
  deleteRowByMultipleIDsAPI,
} from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { CONSTANTS } from "../../../constants";
export const MultipleRowsDeletionForm = ({
  databaseTableName,
  filterQuery,
  selectedRowIDs,
  isAllRowSelectChecked,
}) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteRowsConfirmationOpen, setIsDeleteRowsConfirmationOpen] =
    useState(false);

  const rowDeleteAuthorization = useMemo(() => {
    if (pmUser && pmUser && databaseTableName) {
      const u = pmUser;
      const c = u.extractRowDeleteAuthorization(databaseTableName);
      if (!c) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, [pmUser, databaseTableName]);
  const {
    isPending: isDeletingRows,
    isSuccess: isDeleteRowsSuccess,
    isError: isDeleteRowsError,
    error: deleteRowsError,
    mutate: deleteRows,
  } = useMutation({
    mutationFn: ({ databaseTableName, selectedRowIDs }) =>
      deleteRowByMultipleIDsAPI({
        databaseTableName,
        selectedRowIDs: isAllRowSelectChecked ? filterQuery : selectedRowIDs,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ROW_DELETED_SUCCESS);
      setIsDeleteRowsConfirmationOpen(false);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(databaseTableName),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDeleteRowsConfirmation = () => {
    setIsDeleteRowsConfirmationOpen(true);
  };
  const _handleCloseDeleteRowsConfirmation = () => {
    setIsDeleteRowsConfirmationOpen(false);
  };

  const _handleDeleteRows = () => {
    deleteRows({ databaseTableName, selectedRowIDs });
  };
  return (
    rowDeleteAuthorization && (
      <>
        <Button
          onClick={_handleOpenDeleteRowsConfirmation}
          startIcon={<IoTrash className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="error"
        >
          {CONSTANTS.STRINGS.ROW_MULTIPLE_DELETE_BUTTON}
        </Button>
        <ConfirmationDialog
          open={isDeleteRowsConfirmationOpen}
          onAccepted={_handleDeleteRows}
          onDecline={_handleCloseDeleteRowsConfirmation}
          title={"Delete rows?"}
          message={`Are you sure you want to delete multiple rows`}
        />
      </>
    )
  );
};
