import { Button, CircularProgress, Grid, useTheme } from "@mui/material";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";

import { useEffect, useState } from "react";
import { FieldComponent } from "../../FieldComponent";
import { GUIPolicyEditor } from "../PolicyEditorComponents/GUIPolicyEditor";

import { fetchRowByIDAPI, updateRowAPI } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Loading } from "../../../pages/Loading";
import { PolicyDeletionForm } from "../PolicyDeletionForm";
import { getPolicyByIDAPI, updatePolicyAPI } from "../../../api/policy";
import { PolicyDuplicateForm } from "../PolicyDuplicateForm";

export const PolicyUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = new QueryClient();

  const {
    isLoading: isLoadingPolicyObjectData,
    data: policyObjectData,
    error: loadPolicyObjectDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.POLICIES, id],
    queryFn: () =>
      getPolicyByIDAPI({
        pmPolicyObjectID: id,
      }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });

  const {
    isPending: isUpdatingPolicyObject,
    isSuccess: isUpdatePolicyObjectSuccess,
    isError: isUpdatePolicyObjectError,
    error: updatePolicyObjectError,
    mutate: updateRow,
  } = useMutation({
    mutationFn: ({ data }) => {
      return updatePolicyAPI({
        data,
      });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.POLICY_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.POLICIES,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const policyObjectUpdateForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      updateRow({ id, data: values });
    },
  });

  useEffect(() => {
    if (policyObjectData) {
      policyObjectUpdateForm.setFieldValue("pm_policy_object_id", id);
      policyObjectUpdateForm.setFieldValue(
        "pm_policy_object_title",
        policyObjectData.pmPolicyObjectTitle
      );
      policyObjectUpdateForm.setFieldValue(
        "is_disabled",
        policyObjectData.isDisabled
      );
      policyObjectUpdateForm.setFieldValue(
        "pm_policy_object",
        policyObjectData.pmPolicyObject
      );
    }
  }, [policyObjectData]);

  console.log({ policyObjectData });

  return !isLoadingPolicyObjectData &&
    !isLoadingPolicyObjectData &&
    policyObjectData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.POLICY_UPDATE_PAGE_TITLE}
          </span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <PolicyDeletionForm id={id} />
          <PolicyDuplicateForm id={id} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingPolicyObject && (
                <CircularProgress color="inherit" size={12} />
              )
            }
            className="!ml-2"
            onClick={policyObjectUpdateForm.submitForm}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </Button>
        </div>
      </div>
      <form
        className="!flex !flex-col justify-start items-stretch 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full"
        onSubmit={policyObjectUpdateForm.handleSubmit}
      >
        <div
          className="p-4 mt-3 w-full pt-0"
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.palette.divider,
          }}
        >
          <Grid container rowSpacing={2} className="!mt-2">
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
                value={policyObjectUpdateForm.values["pm_policy_object_id"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={
                  policyObjectUpdateForm.errors["pm_policy_object_id"]
                }
                error={Boolean(
                  policyObjectUpdateForm.errors["pm_policy_object_id"]
                )}
                required={true}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={"pm_policy_object_title"}
            >
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.text.name}
                name={"pm_policy_object_title"}
                value={policyObjectUpdateForm.values["pm_policy_object_title"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={
                  policyObjectUpdateForm.errors["pm_policy_object_title"]
                }
                error={Boolean(
                  policyObjectUpdateForm.errors["pm_policy_object_title"]
                )}
                required={true}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"is_disabled"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES.bool.name}
                name={"is_disabled"}
                value={policyObjectUpdateForm.values["is_disabled"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={policyObjectUpdateForm.errors["is_disabled"]}
                error={Boolean(policyObjectUpdateForm.errors["is_disabled"])}
                required={true}
                customMapping={null}
              />
            </Grid>
          </Grid>
        </div>
        <GUIPolicyEditor
          policy={policyObjectUpdateForm.values["pm_policy_object"]}
          handleChange={(value) => {
            policyObjectUpdateForm.setFieldValue("pm_policy_object", value);
          }}
          containerClass="!mt-4"
        />
      </form>
    </div>
  ) : (
    <Loading />
  );
};
