import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchAllRowsAPI, fetchRowByIDAPI } from "../../../api/tables";

import { Button, CircularProgress, Grid, Paper, useTheme } from "@mui/material";

import { useEffect, useMemo } from "react";

import { Loading } from "../../../pages/Loading";
import { displayError, displaySuccess } from "../../../utils/notification";
import { LOCAL_CONSTANTS } from "../../../constants";
import { FieldComponent } from "../../FieldComponent";
import { getAccountByIDAPI, updatePMUserDataAPI } from "../../../api/accounts";
import { AccountDeletionForm } from "../AccountDeletetionForm";
import { AccountPasswordChangeForm } from "../AccountPasswordChangeForm";
import { getAllPoliciesAPI } from "../../../api/policy";

export const AccountUpdationForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = new QueryClient();

  const {
    isLoading: isLoadingPMUserData,
    data: pmUserData,
    error: loadPMUserDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.ACCOUNTS, id],
    queryFn: () =>
      getAccountByIDAPI({
        pmAccountID: id,
      }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingPolicyObjectData,
    data: policyObjectData,
    error: loadPolicyObjectDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.POLICIES],
    queryFn: () => getAllPoliciesAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isPending: isUpdatingPMUserData,
    isSuccess: isUpdatePMUserDataSuccess,
    isError: isUpdatePMUserError,
    error: updatePMUserDataError,
    mutate: updatePMUserData,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updatePMUserDataAPI({ data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ACCOUNT_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.ACCOUNTS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const accountUpdateForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      updatePMUserData({ data: values });
    },
  });

  useEffect(() => {
    if (pmUserData) {
      accountUpdateForm.setFieldValue("pm_user_id", pmUserData.pm_user_id);
      accountUpdateForm.setFieldValue("first_name", pmUserData.first_name);
      accountUpdateForm.setFieldValue("last_name", pmUserData.last_name);
      accountUpdateForm.setFieldValue("address1", pmUserData.address1);
      accountUpdateForm.setFieldValue(
        "pm_policy_object_id",
        pmUserData.pm_policy_object_id
      );
    }
  }, [pmUserData]);

  console.log({ pmUserData });

  const customPolicyObjectMapping = useMemo(() => {
    const map = {};
    if (policyObjectData) {
      policyObjectData.forEach((policyObject) => {
        map[policyObject.pmPolicyObjectID] = policyObject.pmPolicyObjectTitle;
      });
      return map;
    } else {
      return null;
    }
  }, [policyObjectData]);

  return !isLoadingPMUserData && !isLoadingPolicyObjectData && pmUserData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full  mt-3">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.ACCOUNT_UPDATE_PAGE_TITLE}
          </span>
          <span
            className="text-xs font-thin text-start "
            style={{ color: theme.palette.text.secondary }}
          >{`User ID : ${pmUserData.pm_user_id} | Username : ${pmUserData.username}`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <AccountDeletionForm id={id} username={pmUserData.username} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingPMUserData && (
                <CircularProgress color="inherit" size={12} />
              )
            }
            className="!ml-2"
            onClick={accountUpdateForm.submitForm}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
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
        <form className="" onSubmit={accountUpdateForm.handleSubmit}>
          <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
            <Grid item xs={12} sm={12} md={12} lg={12} key={"first_name"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.text.name}
                name={"first_name"}
                readOnly={false}
                value={accountUpdateForm.values["first_name"]}
                onBlur={accountUpdateForm.handleBlur}
                onChange={accountUpdateForm.handleChange}
                setFieldValue={accountUpdateForm.setFieldValue}
                helperText={accountUpdateForm.errors["first_name"]}
                error={Boolean(accountUpdateForm.errors["first_name"])}
                required={false}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"last_name"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.text.name}
                name={"last_name"}
                readOnly={false}
                value={accountUpdateForm.values["last_name"]}
                onBlur={accountUpdateForm.handleBlur}
                onChange={accountUpdateForm.handleChange}
                setFieldValue={accountUpdateForm.setFieldValue}
                helperText={accountUpdateForm.errors["last_name"]}
                error={Boolean(accountUpdateForm.errors["last_name"])}
                required={false}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"address1"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.text.name}
                name={"address1"}
                readOnly={false}
                value={accountUpdateForm.values["address1"]}
                onBlur={accountUpdateForm.handleBlur}
                onChange={accountUpdateForm.handleChange}
                setFieldValue={accountUpdateForm.setFieldValue}
                helperText={accountUpdateForm.errors["address1"]}
                error={Boolean(accountUpdateForm.errors["address1"])}
                required={false}
                customMapping={null}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={"pm_policy_object_id"}
            >
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.int4.name}
                name={"pm_policy_object_id"}
                value={accountUpdateForm.values["pm_policy_object_id"]}
                onBlur={accountUpdateForm.handleBlur}
                onChange={accountUpdateForm.handleChange}
                setFieldValue={accountUpdateForm.setFieldValue}
                helperText={accountUpdateForm.errors["pm_policy_object_id"]}
                error={Boolean(accountUpdateForm.errors["pm_policy_object_id"])}
                required={true}
                customMapping={customPolicyObjectMapping}
              />
            </Grid>
          </Grid>
        </form>
      </div>
      {pmUserData && <AccountPasswordChangeForm pmUserData={pmUserData} />}
    </div>
  ) : (
    <Loading />
  );
};
