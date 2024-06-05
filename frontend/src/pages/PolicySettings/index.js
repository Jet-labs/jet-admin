import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchRowByIDAPI } from "../../api/tables";

import { Button, CircularProgress, Grid, Paper } from "@mui/material";

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { updateRowAPI } from "../../api/tables";
import { FieldComponent } from "../../components/FieldComponent";
import { RowDeletionForm } from "../../components/RowDeletetionForm";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { Loading } from "../Loading";

const PolicySettings = () => {
  const tableName = LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME;
  const { id } = useParams();
  const queryClient = new QueryClient();

  const {
    isLoading: isLoadingPolicyObjectData,
    data: policyObjectData,
    error: loadPolicyObjectDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`, id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  const {
    isPending: isUpdatingPolicyObject,
    isSuccess: isUpdatePolicyObjectSuccess,
    isError: isUpdatePolicyObjectError,
    error: updatePolicyObjectError,
    mutate: updateRow,
  } = useMutation({
    mutationFn: ({ tableName, id, data }) => {
      return updateRowAPI({ tableName, id, data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess("Updated policy successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
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
      updateRow({ tableName, id, data: values });
    },
  });

  useEffect(() => {
    if (policyObjectData) {
      policyObjectUpdateForm.setFieldValue("title", policyObjectData.title);
      policyObjectUpdateForm.setFieldValue(
        "pm_policy_object_id",
        policyObjectData.pm_policy_object_id
      );
      policyObjectUpdateForm.setFieldValue(
        "is_disabled",
        policyObjectData.is_disabled
      );
      policyObjectUpdateForm.setFieldValue("policy", policyObjectData.policy);
    }
  }, [policyObjectData]);

  return !isLoadingPolicyObjectData &&
    !isLoadingPolicyObjectData &&
    policyObjectData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Policy settings`}</span>
          <span className="text-xs font-thin text-start text-slate-300">{`Account settings | Username : ${policyObjectData.title}`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <RowDeletionForm tableName={tableName} id={id} />
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
            Update
          </Button>
        </div>
      </div>
      <Paper
        className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
        variant="outlined"
      >
        <form className="" onSubmit={policyObjectUpdateForm.handleSubmit}>
          <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={"pm_policy_object_id"}
            >
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.INT}
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
            <Grid item xs={12} sm={12} md={12} lg={12} key={"title"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                name={"title"}
                value={policyObjectUpdateForm.values["title"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={policyObjectUpdateForm.errors["title"]}
                error={Boolean(policyObjectUpdateForm.errors["title"])}
                required={true}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"is_disabled"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
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
            <Grid item xs={12} sm={12} md={12} lg={12} key={"policy"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.JSON}
                name={"policy"}
                value={policyObjectUpdateForm.values["policy"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={policyObjectUpdateForm.errors["policy"]}
                error={Boolean(policyObjectUpdateForm.errors["policy"])}
                required={true}
                customMapping={null}
                language={"json"}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  ) : (
    <Loading />
  );
};

export default PolicySettings;
