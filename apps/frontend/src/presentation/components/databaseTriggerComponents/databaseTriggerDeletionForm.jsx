import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseTriggerByNameAPI } from "../../../data/apis/databaseTrigger";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";
export const DatabaseTriggerDeletionForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  DatabaseTriggerDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    databaseTriggerName: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingDatabaseTrigger,
    mutate: deleteDatabaseTrigger,
  } = useMutation({
    mutationFn: () => {
      return deleteDatabaseTriggerByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_TRIGGERS(
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

  const _handleDeleteDashboard = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseTrigger();
  };

  return (
    <>
      <Button variant="destructive-ghost" size="icon" onClick={_handleDeleteDashboard} disabled={isDeletingDatabaseTrigger} type="button" className="ms-2">
        {isDeletingDatabaseTrigger ? (
          <Spinner size={16} />
        ) : (
            <MdDeleteOutline className="text-xl" />
        )}
      </Button>
    </>
  );
};
