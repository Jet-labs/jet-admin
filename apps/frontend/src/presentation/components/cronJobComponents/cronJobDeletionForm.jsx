import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteCronJobByIDAPI } from "../../../data/apis/cronJob";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";
export const CronJobDeletionForm = ({ tenantID, cronJobID }) => {
  CronJobDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingCronJob, mutate: deleteCronJob } = useMutation({
    mutationFn: () => {
      return deleteCronJobByIDAPI({
        tenantID,
        cronJobID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CRON_JOB_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteNotification = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_CRON_JOB_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_CRON_JOB_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteCronJob();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="icon"
      onClick={_handleDeleteNotification}
      disabled={isDeletingCronJob}
      type="button"
      className="shrink-0"
      aria-label="Delete scheduled job"
    >
      {isDeletingCronJob ? (
        <Spinner size={16} />
      ) : (
        <MdDeleteOutline className="h-4 w-4" />
      )}
    </Button>
  );
};
