import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import "react-data-grid/lib/styles.css";
import { addAppVariableAPI } from "../../../api/appVariables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { AppVariableEditor } from "../AppVariableEditor";

export const AppVariableAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const appVariableAdditionForm = useFormik({
    initialValues: {
      pm_app_variable_title:
        LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
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
      addAppVariable(values);
    },
  });

  const {
    isPending: isAddingAppVariable,
    isSuccess: isAddingAppVariableSuccess,
    isError: isAddingAppVariableError,
    error: addAppVariableError,
    mutate: addAppVariable,
  } = useMutation({
    mutationFn: (appVariableData) => {
      return addAppVariableAPI({
        data: appVariableData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_VARIABLESS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  return (
    <div className="w-full !h-[calc(100vh-50px)]">
      <div
        className="flex flex-row items-center justify-between p-3 px-3 w-full"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start mt-1 ">
          {LOCAL_CONSTANTS.STRINGS.APP_VARIABLES_ADDITION_PAGE_TITLE}
        </span>
        <div className="!flex flex-row justify-end items-center">
          <Button
            variant="contained"
            className="!ml-3"
            onClick={appVariableAdditionForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      <Grid container>
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
          <AppVariableEditor appVariableForm={appVariableAdditionForm} />
        </Grid>
        <Grid item xl={6} lg={6} md={0} sm={0} xs={0} className="!p-3"></Grid>
      </Grid>
    </div>
  );
};
