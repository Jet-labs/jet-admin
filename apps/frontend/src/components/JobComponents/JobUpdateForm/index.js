import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { default as React, useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { SiPostgresql } from "react-icons/si";
import { getJobByIDAPI, updateJobAPI } from "../../../api/jobs";
import { getAllQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CronJobScheduler } from "../CronJobScheduler";
import { JobDeletionForm } from "../JobDeletionForm";

export const JobUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingJobData,
    data: jobData,
    error: loadJobDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.JOBS, id],
    queryFn: () => getJobByIDAPI({ pmJobID: id }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });
  
  const jobUpdateForm = useFormik({
    initialValues: {
      pm_job_title: "Untitled",
      pm_query_id: "",
      pm_job_schedule: "",
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      updateJob(values);
    },
  });

  useEffect(() => {
    if (jobUpdateForm && jobData) {
      jobUpdateForm.setFieldValue("pm_job_id", jobData.pm_job_id);
      jobUpdateForm.setFieldValue("pm_job_title", jobData.pm_job_title);
      jobUpdateForm.setFieldValue("pm_query_id", jobData.pm_query_id);
      jobUpdateForm.setFieldValue("pm_job_schedule", jobData.pm_job_schedule);
    }
  }, [jobData]);

  const {
    isPending: isAddingJob,
    isSuccess: isAddingJobSuccess,
    isError: isAddingJobError,
    error: addJobError,
    mutate: updateJob,
  } = useMutation({
    mutationFn: (jobData) => {
      return updateJobAPI({
        data: jobData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.JOB_UPDATED_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.JOBS]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOnScheduleChange = useCallback(
    (value) => {
      jobUpdateForm?.setFieldValue("pm_job_schedule", value);
    },
    [jobUpdateForm]
  );
  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row items-center justify-between p-3 "
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-col items-start justify-start ">
          <span className="text-lg font-bold text-start">
            {LOCAL_CONSTANTS.STRINGS.JOB_UPDATE_PAGE_TITLE}
          </span>
          <span className="text-xs font-medium text-start mt-1">{`Job id : ${id}`}</span>
        </div>
        <div className="!flex flex-row justify-end items-center">
          <JobDeletionForm id={id} />
          <Button
            variant="contained"
            className="!ml-3"
            onClick={jobUpdateForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      <Grid container className="!h-full">
        <Grid item sx={12} md={12} lg={6} className="w-full">
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Title`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_job_title"}
              value={jobUpdateForm.values.pm_job_title}
              onChange={jobUpdateForm.handleChange}
              onBlur={jobUpdateForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Select query`}</span>

            <Select
              name={`pm_query_id`}
              value={jobUpdateForm.values.pm_query_id}
              onBlur={jobUpdateForm.handleBlur}
              onChange={jobUpdateForm.handleChange}
              required={true}
              size="small"
              fullWidth={true}
            >
              {queries?.map((query) => {
                return (
                  <MenuItem value={query.pm_query_id}>
                    <div className="!flex flex-row justify-start items-center">
                      <SiPostgresql className="!text-lg" />
                      <span className="ml-2">{query.pm_query_title}</span>
                    </div>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <div className="!mt-2 px-3 pb-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Schedule the job`}</span>
            <CronJobScheduler
              value={jobUpdateForm.values.pm_job_schedule}
              handleChange={_handleOnScheduleChange}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
