import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  getCronJobByIDAPI,
  updateCronJobAPI,
  deleteCronJobByIDAPI,
} from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { CronJobEditor } from "./cronJobEditor";
import { Spinner, PageHeader } from "@jet-admin/ui";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { CronJobCloneForm } from "./cronJobCloneForm";
import { CronJobDeletionForm } from "./cronJobDeletionForm";

export const CronJobUpdationForm = ({ tenantID, cronJobID }) => {
  CronJobUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    cronJobID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();

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
      workflowConfig: { inputValues: {} },
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
        workflowConfig: cronJob.workflowConfig ?? { inputValues: {} },
        isDisabled: cronJob.isDisabled ?? false,
        timeoutSeconds: cronJob.timeoutSeconds ?? "",
        retryAttempts: cronJob.retryAttempts ?? "",
        retryDelaySeconds: cronJob.retryDelaySeconds ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronJob]);

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_CRON_JOB_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_CRON_JOBS_TITLE}
        id={cronJob?.cronJobID}
        onSave={cronJobUpdationForm.handleSubmit}
        onHistory={() => navigate(CONSTANTS.ROUTES.VIEW_CRON_JOB_HISTORY_BY_ID.path(tenantID, cronJobID))}
        hasHistory={true}
        isSaving={isUpdatingCronJob}
      >
        <CronJobDeletionForm tenantID={tenantID} cronJobID={cronJobID} />
        <CronJobCloneForm tenantID={tenantID} cronJobID={cronJobID} />
      </PageHeader>

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