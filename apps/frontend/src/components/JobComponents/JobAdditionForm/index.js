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
import React, { useCallback } from "react";
import "react-data-grid/lib/styles.css";
import { getAllQueryAPI } from "../../../api/queries";
import { displayError, displaySuccess } from "../../../utils/notification";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";
import { addJobAPI } from "../../../api/jobs";
import { CronJobScheduler } from "../CronJobScheduler";
import { Tip } from "../../Tip";
import { cron_job_usage_tip } from "../../../assets/tips";
import { LOCAL_CONSTANTS } from "../../../constants";

export const JobAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  const jobBuilderForm = useFormik({
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
      console.log({ values });
    },
  });

  const {
    isPending: isAddingJob,
    isSuccess: isAddingJobSuccess,
    isError: isAddingJobError,
    error: addJobError,
    mutate: addJob,
  } = useMutation({
    mutationFn: (jobData) => {
      return addJobAPI({
        data: jobData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.JOB_ADDITION_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.JOBS]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _addJob = () => {
    addJob(jobBuilderForm.values);
  };

  const _handleOnScheduleChange = useCallback(
    (value) => {
      jobBuilderForm?.setFieldValue("pm_job_schedule", value);
    },
    [jobBuilderForm]
  );
  return (
    <div className="w-full !h-[calc(100vh-50px)] overflow-y-scroll">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">
          {LOCAL_CONSTANTS.STRINGS.JOB_ADDITION_PAGE_TITLE}
        </span>
      </div>

      <Grid container className="!h-full">
        <Grid item sx={6} md={6} lg={6} className="w-full">
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Title`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_job_title"}
              value={jobBuilderForm.values.pm_job_title}
              onChange={jobBuilderForm.handleChange}
              onBlur={jobBuilderForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Select query`}</span>

            <Select
              name={`pm_query_id`}
              value={jobBuilderForm.values.pm_query_id}
              onBlur={jobBuilderForm.handleBlur}
              onChange={jobBuilderForm.handleChange}
              required={true}
              size="small"
              fullWidth={true}
            >
              {queries?.map((query) => {
                console.log({ query });
                return (
                  <MenuItem value={query.pm_query_id}>
                    <div className="!flex flex-row justify-start items-center">
                      {QUERY_PLUGINS_MAP[query.pm_query_type].icon}
                      <span className="ml-2">{query.pm_query_title}</span>
                    </div>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <div className="!flex flex-row justify-end items-center mt-10 w-100 px-3">
            <Button variant="contained" className="!ml-3" onClick={_addJob}>
              {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
            </Button>
          </div>
          <div className="!mt-10 px-3 pb-3">
            <Tip tip={cron_job_usage_tip}></Tip>
          </div>
        </Grid>
        <Grid item sx={6} md={6} lg={6} className="w-full !h-full !p-2">
          <span className="text-xs font-light  !capitalize mb-1">{`Schedule the job`}</span>
          <CronJobScheduler
            value={jobBuilderForm.values.pm_job_schedule}
            handleChange={_handleOnScheduleChange}
          />
        </Grid>
      </Grid>
    </div>
  );
};
