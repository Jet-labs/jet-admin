import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useState } from "react";
import { IoTrash } from "react-icons/io5";
import { exportRowByMultipleIDsAPI } from "../../../api/tables";
import { CONSTANTS } from "../../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { displayError } from "../../../utils/notification";
import { DataExportConfirmationDialog } from "../dataExportConfirmationDialog";
export const DataExportFormComponent = ({
  databaseTableName,
  filterQuery,
  selectedRowIDs,
  isAllRowSelectChecked,
}) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const [isExportRowsConfirmationOpen, setIsExportRowsConfirmationOpen] =
    useState(false);

  const {
    isPending: isExportingRows,
    isSuccess: isExportRowsSuccess,
    isError: isExportRowsError,
    error: exportRowsError,
    mutate: exportRows,
  } = useMutation({
    mutationFn: ({ databaseTableName, selectedRowIDs, format = "xlsx" }) =>
      exportRowByMultipleIDsAPI({
        databaseTableName,
        format,
        selectedRowIDs: isAllRowSelectChecked ? filterQuery : selectedRowIDs,
      }),
    retry: false,
    onSuccess: () => {
      //   displaySuccess(CONSTANTS.STRINGS.ROW_DELETED_SUCCESS);
      setIsExportRowsConfirmationOpen(false);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(databaseTableName),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOpenExportRowsConfirmation = () => {
    setIsExportRowsConfirmationOpen(true);
  };
  const _handleCloseExportRowsConfirmation = () => {
    setIsExportRowsConfirmationOpen(false);
  };

  const _handleExportRows = (format) => {
    exportRows({ databaseTableName, selectedRowIDs, format });
  };
  return (
    <>
      <Button
        onClick={_handleOpenExportRowsConfirmation}
        startIcon={<IoTrash className="!text-sm" />}
        size="medium"
        variant="outlined"
        className="!ml-2"
        color="info"
      >
        {CONSTANTS.STRINGS.EXPORT_BUTTON_TEXT}
      </Button>
      <DataExportConfirmationDialog
        open={isExportRowsConfirmationOpen}
        onAccepted={_handleExportRows}
        onDecline={_handleCloseExportRowsConfirmation}
      />
    </>
  );
};
