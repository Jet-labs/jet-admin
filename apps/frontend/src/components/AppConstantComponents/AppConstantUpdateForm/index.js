import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { default as React, useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import {
  getAppConstantByIDAPI,
  updateAppConstantAPI,
} from "../../../api/appConstants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { AppConstantEditor } from "../AppConstantEditor";
import { AppConstantDeletionForm } from "../AppConstantDeletionForm";

export const AppConstantUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingAppConstantData,
    data: appConstantData,
    error: loadAppConstantDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_APP_CONSTANTS`, id],
    queryFn: () => getAppConstantByIDAPI({ appConstantID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  const appConstantForm = useFormik({
    initialValues: {
      pm_app_constant_title: "Untitled",
      pm_app_constant_value: JSON.stringify({}),
      is_internal: false,
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

  useEffect(() => {
    if (appConstantForm && appConstantData) {
      appConstantForm.setFieldValue(
        "pm_app_constant_id",
        appConstantData.pm_app_constant_id
      );
      appConstantForm.setFieldValue(
        "pm_app_constant_title",
        appConstantData.pm_app_constant_title
      );
      appConstantForm.setFieldValue("is_internal", appConstantData.is_internal);
      appConstantForm.setFieldValue(
        "pm_app_constant_value",
        appConstantData.pm_app_constant_value
      );
    }
  }, [appConstantData]);

  const {
    isPending: isUpdatingAppConstant,
    isSuccess: isUpdatingAppConstantSuccess,
    isError: isUpdatingAppConstantError,
    error: updateAppConstantError,
    mutate: updateAppConstant,
  } = useMutation({
    mutationFn: (appConstantData) => {
      return updateAppConstantAPI({
        data: appConstantData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess("AppConstant updated successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_JOBS"]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _updateAppConstant = () => {
    updateAppConstant(appConstantForm.values);
  };

  return (
    <div className="w-full !h-[calc(100vh-123px)]">
      <div
        className="flex flex-col items-start justify-start p-3 "
        style={{
          background: theme.palette.background.default,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start">{`Update app constant`}</span>
        <span className="text-xs font-medium text-start mt-1">{`AppConstant id : ${id}`}</span>
      </div>

      <Grid item sx={4} md={4} lg={4} className="w-full">
        <AppConstantEditor appConstantForm={appConstantForm} />

        <div className="!flex flex-row justify-end items-center mt-10 w-100 px-3">
          <AppConstantDeletionForm pmAppConstantID={id} />
          <Button
            variant="contained"
            className="!ml-3"
            onClick={_updateAppConstant}
          >{`Save app constant`}</Button>
        </div>
      </Grid>
    </div>
  );
};
