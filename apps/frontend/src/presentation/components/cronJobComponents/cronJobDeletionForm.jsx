import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteCronJobByIDAPI } from "../../../data/apis/cronJob";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

export const CronJobDeletionForm = ({ tenantID, cronJobID }) => {
  CronJobDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    cronJobID: PropTypes.number.isRequired,
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
    <>
      <button
        onClick={_handleDeleteNotification}
        disabled={isDeletingCronJob}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 mr-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingCronJob ? (
          <CircularProgress className="!text-xs" size={20} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
