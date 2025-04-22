import {
  CircularProgress
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { MdHistory } from "react-icons/md";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  getCronJobByIDAPI,
  updateCronJobAPI,
} from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { CronJobDeletionForm } from "./cronJobDeletionForm";
import { CronJobEditor } from "./cronJobEditor";

export const CronJobUpdationForm = ({ tenantID, cronJobID }) => {
  CronJobUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    cronJobID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingCronJob,
    data: cronJob,
    error: loadDatabaseChartError,
    isFetching: isFetchingDatabaseChart,
    isRefetching: isRefetechingDatabaseChart,
    refetch: refetchDatabaseChart,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      cronJobID,
    ],
    queryFn: () =>
      getCronJobByIDAPI({
        tenantID,
        cronJobID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingCronJob, mutate: updateCronJob } = useMutation({
    mutationFn: (data) => {
      return updateCronJobAPI({
        tenantID,
        cronJobID,
        cronJobData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CRON_JOB_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const cronJobUpdationForm = useFormik({
    initialValues: {
      cronJobTitle: "",
      cronJobDescription: "",
      cronJobSchedule: "",
      databaseQueryID: "",
      databaseQueryArgValues: {},
    },
    validationSchema: formValidations.cronJobUpdationFormValidationSchema,
    onSubmit: (data) => {
      updateCronJob(data);
    },
  });

  useEffect(() => {
    if (cronJob && cronJob.cronJobID) {
      cronJobUpdationForm.setValues({
        cronJobTitle: cronJob.cronJobTitle,
        cronJobDescription: cronJob.cronJobDescription,
        cronJobSchedule: cronJob.cronJobSchedule,
        databaseQueryID: cronJob.databaseQueryID,
        databaseQueryArgValues: cronJob.databaseQueryArgValues,
      });
    }
  }, [cronJob]);

  return (
    <section className="max-w-3xl w-full">
      <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-row justify-between items-center">
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
            {CONSTANTS.STRINGS.UPDATE_CRON_JOB_FORM_TITLE}
          </h1>

          {cronJob && (
            <span className="text-xs text-[#646cff] mt-2">{`Job ID: ${cronJob.cronJobID}`}</span>
          )}
        </div>
        <div className="flex flex-row justify-end items-center">
          <Link
            to={CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.path(
              tenantID,
              cronJobID
            )}
            className="p-1 hover:bg-[#646cff]/10 bg-transparent m-0 flex rounded flex-row justify-center items-center outline-none focus:outline-none"
          >
            <MdHistory className="text-[#646cff] h-5 w-5" />
          </Link>
        </div>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingCronJob}
        isFetching={isFetchingDatabaseChart}
        isRefetching={isRefetechingDatabaseChart}
        refetch={refetchDatabaseChart}
        error={loadDatabaseChartError}
      >
        <form
          className="space-y-3 md:space-y-4 mt-2 p-3"
          onSubmit={cronJobUpdationForm.handleSubmit}
        >
          <CronJobEditor
            tenantID={tenantID}
            cronJobEditorForm={cronJobUpdationForm}
            isLoadingCronJobEditorForm={isUpdatingCronJob}
          />

          <div className="flex justify-end">
            <CronJobDeletionForm tenantID={tenantID} cronJobID={cronJobID} />
            <button
              type="submit"
              className="flex ml-2 flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:outline-none "
              disabled={isUpdatingCronJob}
            >
              {isUpdatingCronJob ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                CONSTANTS.STRINGS.UPDATE_CRON_JOB_SUBMIT_BUTTON_TEXT
              )}
            </button>
          </div>
        </form>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
