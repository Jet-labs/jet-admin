import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
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
import { Button, Spinner } from "@jet-admin/ui";

export const CronJobUpdationForm = ({ tenantID, cronJobID }) => {
  CronJobUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingCronJob,
    data: cronJob,
    error: loadCronJobError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      cronJobID,
    ],
    queryFn: () => getCronJobByIDAPI({ tenantID, cronJobID }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingCronJob, mutate: updateCronJob } = useMutation({
    mutationFn: (data) =>
      updateCronJobAPI({
        tenantID,
        cronJobID,
        cronJobData: data,
      }),
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
      cronJobSchedule: "* * * * *",
      workflowID: "",
      workflowConfig: { inputArgs: {} },
      isDisabled: false,
      timeoutSeconds: "",
      retryAttempts: "",
      retryDelaySeconds: "",
    },
    validationSchema: formValidations.cronJobUpdationFormValidationSchema,
    onSubmit: (data) => {
      updateCronJob(data);
    },
  });

  // Populate form once the remote data arrives.
  // Using `setValues` directly — it is stable and safe to omit from deps.
  useEffect(() => {
    if (cronJob?.cronJobID) {
      cronJobUpdationForm.setValues({
        cronJobTitle: cronJob.cronJobTitle ?? "",
        cronJobDescription: cronJob.cronJobDescription ?? "",
        cronJobSchedule: cronJob.cronJobSchedule ?? "* * * * *",
        workflowID: cronJob.workflowID ?? "",
        workflowConfig: cronJob.workflowConfig ?? { inputArgs: {} },
        isDisabled: cronJob.isDisabled ?? false,
        timeoutSeconds: cronJob.timeoutSeconds ?? "",
        retryAttempts: cronJob.retryAttempts ?? "",
        retryDelaySeconds: cronJob.retryDelaySeconds ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronJob]);

  return (
    <section className="w-full bg-brand-dark">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-dark px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_CRON_JOB_FORM_TITLE}
          </h1>
          {cronJob?.cronJobID && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Job ID: {cronJob.cronJobID}
            </p>
          )}
        </div>

        {/* ── Header actions ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild type="button" variant="outline" size="sm">
            <Link
              to={CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.path(
                tenantID,
                cronJobID
              )}
            >
              {CONSTANTS.STRINGS.VIEW_CRON_JOB_HISTORY_BUTTON_TEXT}
            </Link>
          </Button>

          <CronJobDeletionForm tenantID={tenantID} cronJobID={cronJobID} />

          <Button
            type="submit"
            form="cron-job-updation-form"
            disabled={isUpdatingCronJob}
          >
            {isUpdatingCronJob && <Spinner className="mr-2" size={14} />}
            {CONSTANTS.STRINGS.UPDATE_CRON_JOB_SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────── */}
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingCronJob}
        error={loadCronJobError}
      >
        <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
          <form
            id="cron-job-updation-form"
            onSubmit={cronJobUpdationForm.handleSubmit}
            noValidate
          >
            <CronJobEditor
              tenantID={tenantID}
              cronJobEditorForm={cronJobUpdationForm}
              isLoadingCronJobEditorForm={isUpdatingCronJob}
            />
          </form>
        </div>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};