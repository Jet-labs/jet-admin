import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseTableByNameAPI } from "../../../data/apis/databaseTable";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";
export const DatabaseTableDeletionForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  DatabaseTableDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingDatabaseTable, mutate: deleteDatabaseTable } =
    useMutation({
      mutationFn: () => {
        return deleteDatabaseTableByNameAPI({
          tenantID,
          databaseSchemaName,
          databaseTableName,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DATABASE_TABLE_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES(
            tenantID,
            databaseSchemaName
          ),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteDatabaseTable = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DATABASE_TABLE_DELETION_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DATABASE_TABLE_DELETION_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseTable();
  };

  return (
    <>
      <Button variant="destructive-ghost" size="icon" onClick={_handleDeleteDatabaseTable} disabled={isDeletingDatabaseTable} type="button">
        {isDeletingDatabaseTable ? (
          <Spinner size={16} />
        ) : (
            <MdDeleteOutline className="size-4" />
        )}
      </Button>
    </>
  );
};
