import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneCronJobAPI } from "../../../data/apis/cronJob";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const CronJobCloneForm = ({ tenantID, cronJobID }) => {
  CronJobCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningCronJob, mutate: cloneCronJob } = useMutation({
    mutationFn: () => {
      return cloneCronJobAPI({
        tenantID,
        cronJobID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CLONE_CRON_JOB_CLONING_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.CRON_JOBS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleCloneCronJob = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_CRON_JOB_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_CRON_JOB_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneCronJob();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        onClick={_handleCloneCronJob}
        disabled={isCloningCronJob}
        className="shrink-0"
        aria-label="Clone scheduled job"
      >
        {isCloningCronJob ? (
          <Spinner size={14} />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
