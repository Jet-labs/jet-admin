import { useMutation } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import {
  databaseTableBulkRowAdditionAPI,
  databaseTableBulkRowUpdationAPI,
} from "../../data/apis/databaseTable";
import { displayError, displaySuccess } from "../../utils/notification";

export const useDatabaseTableMutations = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  onBulkAddSuccess,
  onBulkUpdateSuccess,
  reloadDatabaseTableRows,
  invalidateDatabaseTableRows,
}) => {
  // --- Bulk Addition Mutation ---
  const {
    mutate: bulkAddRows,
    isPending: isAdding,
    error: addError,
  } = useMutation({
    mutationFn: (
      { databaseTableRowData } // Expects an array of row data objects
    ) =>
      {
        console.log({ databaseTableRowData });
        return databaseTableBulkRowAdditionAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowData, // Pass the array directly
      })},
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_SAVED_SUCCESS
      );
      invalidateDatabaseTableRows?.(); // Invalidate queries to refetch data
      reloadDatabaseTableRows?.(); // Invalidate queries to refetch data
      onBulkAddSuccess?.(); // Call external success callback (e.g., clear new rows state)
    },
    onError: (error) => {
      displayError(error);
    },
  });

  // --- Bulk Update Mutation ---
  const {
    mutate: bulkUpdateRows,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (
      { databaseTableRowData } // Expects an array of { query: string, data: object }
    ) =>
      {
        return databaseTableBulkRowUpdationAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowData, // Pass the array directly
      })},
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_UPDATED_SUCCESS
      );
      invalidateDatabaseTableRows?.(); // Invalidate queries to refetch data
      reloadDatabaseTableRows?.(); // Invalidate queries to refetch data
      onBulkUpdateSuccess?.(); // Call external success callback (e.g., clear changes state)
    },
    onError: (error) => {
      displayError(error);
    },
  });

  return {
    bulkAddRows,
    isAdding,
    addError,
    bulkUpdateRows,
    isUpdating,
    updateError,
  };
};
