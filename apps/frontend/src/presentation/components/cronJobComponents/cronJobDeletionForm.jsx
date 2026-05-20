import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteCronJobByIDAPI } from "../../../data/apis/cronJob";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
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
    mutationFn: () =>
      deleteCronJobByIDAPI({
        tenantID,
        cronJobID,
      }),
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

  const _handleDeleteClick = async () => {
    // Guard: only proceed if the user confirmed — showConfirmation should
    // resolve to `true` on confirm and `false` (or throw) on cancel.
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_CRON_JOB_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_CRON_JOB_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;
    deleteCronJob();
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      square
      onClick={_handleDeleteClick}
      disabled={isDeletingCronJob}
      className="shrink-0"
      aria-label="Delete scheduled job"
    >
      {isDeletingCronJob ? (
        <Spinner size={14} />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
    </Button>
  );
};