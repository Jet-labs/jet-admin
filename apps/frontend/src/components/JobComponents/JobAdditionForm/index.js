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
import { SiPostgresql } from "react-icons/si";
import { addJobAPI } from "../../../api/jobs";
import { getAllQueryAPI } from "../../../api/queries";
import { cron_job_usage_tip } from "../../../assets/tips";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { Tip } from "../../Tip";
import { CronJobScheduler } from "../CronJobScheduler";

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
    retry: 0,
    staleTime: 0,
  });
  const jobAdditionForm = useFormik({
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
      addJob(values);
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

  const _handleOnScheduleChange = useCallback(
    (value) => {
      jobAdditionForm?.setFieldValue("pm_job_schedule", value);
    },
    [jobAdditionForm]
  );
  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row items-center justify-between p-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start mt-1">
          {LOCAL_CONSTANTS.STRINGS.JOB_ADDITION_PAGE_TITLE}
        </span>
        <div className="!flex flex-row justify-end items-center">
          <Button
            variant="contained"
            className="!ml-3"
            onClick={jobAdditionForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
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
              value={jobAdditionForm.values.pm_job_title}
              onChange={jobAdditionForm.handleChange}
              onBlur={jobAdditionForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Select query`}</span>

            <Select
              name={`pm_query_id`}
              value={jobAdditionForm.values.pm_query_id}
              onBlur={jobAdditionForm.handleBlur}
              onChange={jobAdditionForm.handleChange}
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
              value={jobAdditionForm.values.pm_job_schedule}
              handleChange={_handleOnScheduleChange}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
