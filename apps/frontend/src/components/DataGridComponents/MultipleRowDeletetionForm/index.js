import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { LOCAL_CONSTANTS } from "../../../constants";
import { generateFilterQuery } from "../../../utils/postgresUtils/tables";
export const MultipleRowsDeletionForm = ({
  tableName,
  filterQuery,
  selectedRowIDs,
  isAllRowSelectChecked,
}) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isDeleteRowsConfirmationOpen, setIsDeleteRowsConfirmationOpen] =
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
    isPending: isDeletingRows,
    isSuccess: isDeleteRowsSuccess,
    isError: isDeleteRowsError,
    error: deleteRowsError,
    mutate: deleteRows,
  } = useMutation({
    mutationFn: ({ tableName, selectedRowIDs }) =>
      deleteRowByMultipleIDsAPI({
        tableName,
        selectedRowIDs: isAllRowSelectChecked
          ? generateFilterQuery(filterQuery)
          : selectedRowIDs,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ROW_DELETED_SUCCESS);
      setIsDeleteRowsConfirmationOpen(false);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
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
    deleteRows({ tableName, selectedRowIDs });
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
          {LOCAL_CONSTANTS.STRINGS.ROW_MULTIPLE_DELETE_BUTTON}
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
