import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseNotificationByIDAPI } from "../../../data/apis/databaseNotification";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import React from "react";
import PropTypes from "prop-types";

import { Button, Spinner } from "@jet-admin/ui";
export const DatabaseNotificationDeletionForm = ({
  tenantID,
  databaseNotificationID,
}) => {
  DatabaseNotificationDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseNotificationID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingDatabaseNotification,
    mutate: deleteDatabaseNotification,
  } = useMutation({
    mutationFn: () => {
      return deleteDatabaseNotificationByIDAPI({
        tenantID,
        databaseNotificationID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_NOTIFICATION_DELETION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_NOTIFICATIONS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteNotification = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_NOTIFICATION_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_NOTIFICATION_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseNotification();
  };

  return (
    <>
      <Button variant="destructive-ghost" size="sm" onClick={_handleDeleteNotification} disabled={isDeletingDatabaseNotification} type="button"  className="mr-2">
        {isDeletingDatabaseNotification ? (
          <Spinner size={16} />
        ) : (
            <MdDeleteOutline className="text-xl" />
        )}
      </Button>
    </>
  );
};
