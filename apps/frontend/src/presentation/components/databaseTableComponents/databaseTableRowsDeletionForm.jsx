import { useMutation } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import { databaseTableBulkRowDeletionAPI } from "../../../data/apis/databaseTable";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";
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
    const confirmed = await showConfirmation({
      title:
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_DELETE_ROWS_DIALOG_TITLE,
      message:
        CONSTANTS.STRINGS
          .DATABASE_TABLE_VIEW_CHANGES_DELETE_ROWS_DIALOG_DESCRIPTION,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    bulkDeleteDatabaseTableRows();
  };

  return (
    <>
      <Button
        variant="destructive-outline"
        size="sm"
        onClick={_handleBulkDeleteDatabaseTableRows}
        disabled={isBulkDeletingDatabaseTableRows}
      >
        {isBulkDeletingDatabaseTableRows ? (
          <>
            Deleting selected rows...
            <Spinner size={14} className="ml-2" />
          </>
        ) : (
          `Delete ${
            isAllRowSelectChecked
              ? databaseTableRowCount
              : rowSelectionModel?.length
          } ${rowSelectionModel?.length == 1 ? "row" : "rows"}`
        )}
      </Button>
    </>
  );
};
