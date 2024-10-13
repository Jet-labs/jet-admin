import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { default as React, useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import {
  getAppVariableByIDAPI,
  updateAppVariableAPI,
} from "../../../api/appVariables";
import { displayError, displaySuccess } from "../../../utils/notification";
import { AppVariableEditor } from "../AppVariableEditor";
import { AppVariableDeletionForm } from "../AppVariableDeletionForm";
import { Tip } from "../../Tip";
import { app_variable_usage_tip } from "../../../assets/tips";
import { LOCAL_CONSTANTS } from "../../../constants";

export const AppVariableUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingAppVariableData,
    data: appVariableData,
    error: loadAppVariableDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_VARIABLESS, id],
    queryFn: () => getAppVariableByIDAPI({ pmAppVariableID: id }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });
  const appVariableUpdateForm = useFormik({
    initialValues: {
      pm_app_variable_title: "Untitled",
      pm_app_variable_value: JSON.stringify({}),
      is_internal: false,
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      updateAppVariable(values);
    },
  });

  useEffect(() => {
    if (appVariableUpdateForm && appVariableData) {
      appVariableUpdateForm.setFieldValue(
        "pm_app_variable_id",
        appVariableData.pm_app_variable_id
      );
      appVariableUpdateForm.setFieldValue(
        "pm_app_variable_title",
        appVariableData.pm_app_variable_title
      );
      appVariableUpdateForm.setFieldValue(
        "is_internal",
        appVariableData.is_internal
      );
      appVariableUpdateForm.setFieldValue(
        "pm_app_variable_value",
        appVariableData.pm_app_variable_value
      );
    }
  }, [appVariableData]);

  const {
    isPending: isUpdatingAppVariable,
    isSuccess: isUpdatingAppVariableSuccess,
    isError: isUpdatingAppVariableError,
    error: updateAppVariableError,
    mutate: updateAppVariable,
  } = useMutation({
    mutationFn: (appVariableData) => {
      return updateAppVariableAPI({
        data: appVariableData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_VARIABLESS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _updateAppVariable = () => {
    updateAppVariable(appVariableUpdateForm.values);
  };

  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row items-center justify-between p-3 w-full"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start">
            {LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_UPDATE_PAGE_TITLE}
          </span>
          <span className="text-xs font-medium text-start mt-1">{`App variable id : ${id}`}</span>
        </div>

        <div className="!flex flex-row justify-end items-center">
          <AppVariableDeletionForm id={id} />
          <Button
            variant="contained"
            className="!ml-3"
            onClick={appVariableUpdateForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      <Grid
        container

        // style={{ background: theme.palette.background.paper }}
      >
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
          <AppVariableEditor appVariableForm={appVariableUpdateForm} />
        </Grid>
        <Grid item xl={6} lg={6} md={0} sm={0} xs={0} className="!p-3"></Grid>
      </Grid>
    </div>
  );
};
