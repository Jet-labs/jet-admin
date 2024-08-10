import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchRowByIDAPI } from "../../../api/tables";

import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";

import { useEffect } from "react";

import {
  updatePMUserPasswordAPI,
  updatePMUserDataAPI,
} from "../../../api/accounts";
import { LOCAL_CONSTANTS } from "../../../constants";
import { Loading } from "../../../pages/Loading";
import { displayError, displaySuccess } from "../../../utils/notification";
import { FieldComponent } from "../../FieldComponent";

export const AccountPasswordChangeForm = ({ pmUserData }) => {
  const theme = useTheme();
  const {
    isPending: isUpdatingPMUserPassword,
    isSuccess: isUpdatePMUserPasswordSuccess,
    isError: isUpdatePMUserPasswordError,
    error: updatePMUserPasswordError,
    mutate: updatePMUserPassword,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updatePMUserPasswordAPI({ data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ACCOUNT_PASSWORD_UPDATED_SUCCESS);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const pmUserPasswordUpdateForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      if (values["password"] != values["confirm_password"]) {
        errors["password"] =
          LOCAL_CONSTANTS.ERROR_CODES.PASSWORD_DOES_NOT_MATCH.message;
      }
      return errors;
    },
    onSubmit: (values) => {
      updatePMUserPassword({ data: values });
    },
  });

  useEffect(() => {
    if (pmUserData) {
      pmUserPasswordUpdateForm.setFieldValue(
        "pm_user_id",
        pmUserData.pm_user_id
      );
      pmUserPasswordUpdateForm.setFieldValue("password", "");
      pmUserPasswordUpdateForm.setFieldValue("confirm_password", "");
    }
  }, [pmUserData]);

  return pmUserData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 mt-10">
      <div className=" flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full  mt-3">
        <div className="flex flex-col items-start justify-start">
          <span className="!text-base font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.ACCOUNT_PASSWORD_UPDATE_PAGE_TITLE}
          </span>
        </div>
        <div className="flex flex-row items-center justify-end w-min ">
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingPMUserPassword && (
                <CircularProgress color="inherit" size={12} />
              )
            }
            className="!ml-2 !w-max"
            onClick={pmUserPasswordUpdateForm.submitForm}
          >
            {LOCAL_CONSTANTS.STRINGS.ACCOUNT_PASSWORD_UPDATE_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      <div
        className="p-4 pt-0 mt-3 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full"
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <form className="" onSubmit={pmUserPasswordUpdateForm.handleSubmit}>
          <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
            <Grid item xs={12} sm={12} md={12} lg={12} key={"password"}>
              <FormControl
                fullWidth
                className="!flex !flex-col !justify-start !items-start"
                size="small"
              >
                <span
                  className="text-xs font-light mb-1"
                  style={{ color: theme.palette.text.secondary }}
                >
                  {"Password"}
                </span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="password"
                  name={"password"}
                  value={pmUserPasswordUpdateForm.values["password"]}
                  onBlur={pmUserPasswordUpdateForm.handleBlur}
                  onChange={pmUserPasswordUpdateForm.handleChange}
                  helperText={pmUserPasswordUpdateForm.errors["password"]}
                  error={Boolean(pmUserPasswordUpdateForm.errors["password"])}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"confirm_password"}>
              <FormControl
                fullWidth
                className="!flex !flex-col !justify-start !items-start"
                size="small"
              >
                <span
                  className="text-xs font-light mb-1"
                  style={{ color: theme.palette.text.secondary }}
                >
                  {"Confirm password"}
                </span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="password"
                  name={"confirm_password"}
                  value={pmUserPasswordUpdateForm.values["confirm_password"]}
                  onBlur={pmUserPasswordUpdateForm.handleBlur}
                  onChange={pmUserPasswordUpdateForm.handleChange}
                  helperText={
                    pmUserPasswordUpdateForm.errors["confirm_password"]
                  }
                  error={Boolean(
                    pmUserPasswordUpdateForm.errors["confirm_password"]
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </div>
    </div>
  ) : (
    <Loading />
  );
};
