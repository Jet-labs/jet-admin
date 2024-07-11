import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchAllRowsAPI, fetchRowByIDAPI } from "../../../api/tables";

import { Button, CircularProgress, Grid, Paper, useTheme } from "@mui/material";

import { useEffect, useMemo } from "react";

import { Loading } from "../../../pages/Loading";
import { displayError, displaySuccess } from "../../../utils/notification";
import { LOCAL_CONSTANTS } from "../../../constants";
import { FieldComponent } from "../../FieldComponent";
import { updatePMUserDataAPI } from "../../../api/accounts";
import { AccountDeletionForm } from "../AccountDeletetionForm";
import { AccountPasswordChangeForm } from "../AccountPasswordChangeForm";

export const AccountUpdationForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = new QueryClient();

  const {
    isLoading: isLoadingPMUserData,
    data: pmUserData,
    error: loadPMUserDataError,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(
        LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME
      ).toUpperCase()}`,
      id,
    ],
    queryFn: () =>
      fetchRowByIDAPI({
        tableName: LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME,
        id,
      }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  const {
    isLoading: isLoadingPolicyObjectData,
    data: policyObjectData,
    error: loadPolicyObjectDataError,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(
        LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME
      ).toUpperCase()}`,
    ],
    queryFn: () =>
      fetchAllRowsAPI({
        tableName: LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME,
        filterQuery: {},
        sortModel: {},
      }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
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
      displaySuccess("Updated user successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(
          LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME
        ).toUpperCase()}`,
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

  const customPolicyObjectMapping = useMemo(() => {
    const map = {};
    if (policyObjectData && policyObjectData.rows) {
      policyObjectData.rows.forEach((policyObject) => {
        map[policyObject.pm_policy_object_id] = policyObject.title;
      });
      return map;
    } else {
      return null;
    }
  }, [policyObjectData]);

  return !isLoadingPMUserData && !isLoadingPolicyObjectData && pmUserData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Account settings`}</span>
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
            Update
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
                type={"String"}
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
                type={"String"}
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
                type={"String"}
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
                type={"Int"}
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
