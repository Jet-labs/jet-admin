import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import "react-data-grid/lib/styles.css";
import { addAppConstantAPI } from "../../../api/appConstants";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { AppConstantEditor } from "../AppConstantEditor";

export const AppConstantAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const appConstantAdditionForm = useFormik({
    initialValues: {
      pm_app_constant_title:
        LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
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
      addAppConstant(values);
    },
  });

  const {
    isPending: isAddingAppConstant,
    isSuccess: isAddingAppConstantSuccess,
    isError: isAddingAppConstantError,
    error: addAppConstantError,
    mutate: addAppConstant,
  } = useMutation({
    mutationFn: (appConstantData) => {
      return addAppConstantAPI({
        data: appConstantData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.APP_CONSTANTS,
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
          {LOCAL_CONSTANTS.STRINGS.APP_CONSTANT_ADDITION_PAGE_TITLE}
        </span>
        <div className="!flex flex-row justify-end items-center">
          <Button
            variant="contained"
            className="!ml-3"
            onClick={appConstantAdditionForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      <Grid container>
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
          <AppConstantEditor appConstantForm={appConstantAdditionForm} />
        </Grid>
        <Grid item xl={6} lg={6} md={0} sm={0} xs={0} className="!p-3"></Grid>
      </Grid>
    </div>
  );
};
