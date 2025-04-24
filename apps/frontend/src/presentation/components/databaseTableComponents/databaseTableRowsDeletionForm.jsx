import {
  CircularProgress
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import { databaseTableBulkRowDeletionAPI } from "../../../data/apis/databaseTable";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

export const DatabaseTableRowsDeletionForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  filterQuery,
  isAllRowSelectChecked,
  databaseTableRowCount,
  rowSelectionModel,
  multipleSelectedQuery,
  reloadDatabaseTableRows,
}) => {
  DatabaseTableRowsDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    filterQuery: PropTypes.string,
    isAllRowSelectChecked: PropTypes.bool.isRequired,
    databaseTableRowCount: PropTypes.number.isRequired,
    rowSelectionModel: PropTypes.array.isRequired,
    multipleSelectedQuery: PropTypes.string,
    reloadDatabaseTableRows: PropTypes.func,
  };
  const { showConfirmation } = useGlobalUI();
  const {
    mutate: bulkDeleteDatabaseTableRows,
    isPending: isBulkDeletingDatabaseTableRows,
  } = useMutation({
    mutationFn: () =>
      databaseTableBulkRowDeletionAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        query: isAllRowSelectChecked ? filterQuery : multipleSelectedQuery,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_DELETED_SUCCESS
      );
      reloadDatabaseTableRows?.();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleBulkDeleteDatabaseTableRows = async () => {
    await showConfirmation({
      title:
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_DELETE_ROWS_DIALOG_TITLE,
      message:
        CONSTANTS.STRINGS
          .DATABASE_TABLE_VIEW_CHANGES_DELETE_ROWS_DIALOG_DESCRIPTION,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    bulkDeleteDatabaseTableRows();
  };

  return (
    <>
      <button
        onClick={_handleBulkDeleteDatabaseTableRows}
        disabled={isBulkDeletingDatabaseTableRows} // Disable button during loading
        className={`!outline-none !hover:outline-none flex items-center rounded px-2 py-0.5 text-xs ${
          isBulkDeletingDatabaseTableRows
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "!outline-none !hover:outline-none flex items-center rounded bg-white px-2 py-0.5 text-xs text-[#ff6e64] border border-[#ff6e64] hover:bg-[#ffebe9] hover:border-[#ff6e64]"
        }`}
      >
        {isBulkDeletingDatabaseTableRows ? (
          <>
            Deleting selected rows...
            <CircularProgress size={16} color="inherit" className="!ml-2" />
          </>
        ) : (
          `Delete ${
            isAllRowSelectChecked
              ? databaseTableRowCount
              : rowSelectionModel?.length
          } ${rowSelectionModel?.length == 1 ? "row" : "rows"}`
        )}
      </button>
    </>
  );
};
