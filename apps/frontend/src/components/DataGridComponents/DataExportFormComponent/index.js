import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { exportRowByMultipleIDsAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { LOCAL_CONSTANTS } from "../../../constants";
import { DataExportConfirmationDialog } from "../DataExportConfirmationDialog";
import { generateFilterQuery } from "../../../utils/postgresUtils/tables";
export const DataExportFormComponent = ({
  tableName,
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
    mutationFn: ({ tableName, selectedRowIDs, format = "xlsx" }) =>
      exportRowByMultipleIDsAPI({
        tableName,
        format,
        selectedRowIDs: isAllRowSelectChecked
          ? generateFilterQuery(filterQuery)
          : selectedRowIDs,
      }),
    retry: false,
    onSuccess: () => {
      //   displaySuccess(LOCAL_CONSTANTS.STRINGS.ROW_DELETED_SUCCESS);
      setIsExportRowsConfirmationOpen(false);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  console.log({
    selectedRowIDs: isAllRowSelectChecked
      ? generateFilterQuery(filterQuery)
      : selectedRowIDs,
  });
  const _handleOpenExportRowsConfirmation = () => {
    setIsExportRowsConfirmationOpen(true);
  };
  const _handleCloseExportRowsConfirmation = () => {
    setIsExportRowsConfirmationOpen(false);
  };

  const _handleExportRows = (format) => {
    exportRows({ tableName, selectedRowIDs, format });
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
        {LOCAL_CONSTANTS.STRINGS.EXPORT_BUTTON_TEXT}
      </Button>
      <DataExportConfirmationDialog
        open={isExportRowsConfirmationOpen}
        onAccepted={_handleExportRows}
        onDecline={_handleCloseExportRowsConfirmation}
      />
    </>
  );
};
