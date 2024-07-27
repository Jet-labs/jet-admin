import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import "react-data-grid/lib/styles.css";
import { addAppConstantAPI } from "../../../api/appConstants";
import { QUERY_PLUGINS_MAP } from "../../../plugins/queries";
import { displayError, displaySuccess } from "../../../utils/notification";
import { AppConstantEditor } from "../AppConstantEditor";

export const AppConstantAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

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
      displaySuccess("App constant added successfully");
      queryClient.invalidateQueries(["REACT_QUERY_KEY_APP_CONSTANTS"]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _addAppConstant = () => {
    addAppConstant(appConstantForm.values);
  };

  return (
    <div className="w-full !h-[calc(100vh-123px)]">
      <div
        className="flex flex-col items-center justify-start p-3 px-6 w-full"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full w-full">
          <span className="text-lg font-bold text-start mt-1 ">{`Add new app constant`}</span>
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-start w-full"
        // style={{ background: theme.palette.background.paper }}
      >
        <div className="flex flex-col justify-start items-center 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full w-full">
          <AppConstantEditor appConstantForm={appConstantForm} />

          <div className="!flex flex-row justify-end items-start mt-10 w-full px-3">
            <Button
              variant="contained"
              className="!ml-3"
              onClick={_addAppConstant}
            >{`Save app constant`}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
