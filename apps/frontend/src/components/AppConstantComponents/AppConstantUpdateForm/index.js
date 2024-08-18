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
import { Tip } from "../../Tip";
import { app_constant_usage_tip } from "../../../assets/tips";
import { LOCAL_CONSTANTS } from "../../../constants";

export const AppConstantUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingAppConstantData,
    data: appConstantData,
    error: loadAppConstantDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_CONSTANTS, id],
    queryFn: () => getAppConstantByIDAPI({ pmAppConstantID: id }),
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
    onSubmit: (values) => {},
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
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_CONSTANTS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _updateAppConstant = () => {
    updateAppConstant(appConstantForm.values);
  };

  return (
    <div className="w-full !h-[calc(100vh-50px)] overflow-y-scroll">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 w-full"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start">
          {LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_UPDATE_PAGE_TITLE}
        </span>
        <span className="text-xs font-medium text-start mt-1">{`AppConstant id : ${id}`}</span>
      </div>

      <Grid
        container

        // style={{ background: theme.palette.background.paper }}
      >
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
          <AppConstantEditor appConstantForm={appConstantForm} />

          <div className="!flex flex-row justify-end items-center mt-10 w-full px-3">
            <AppConstantDeletionForm id={id} />
            <Button
              variant="contained"
              className="!ml-3"
              onClick={_updateAppConstant}
            >
              {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
            </Button>
          </div>
        </Grid>
        <Grid item xl={6} lg={6} md={0} sm={0} xs={0} className="!p-3">
          <Tip tip={app_constant_usage_tip}></Tip>
        </Grid>
      </Grid>
    </div>
  );
};
