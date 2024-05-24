import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchAllRowsAPI, fetchRowByIDAPI } from "../../api/get";

import { Button, CircularProgress, Grid, Paper } from "@mui/material";

import { updateRowAPI } from "../../api/put";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { FieldComponent } from "../../components/FieldComponent";
import { RowDeletionForm } from "../../components/RowDeletetionForm";
import { ErrorComponent } from "../../components/ErrorComponent";
import { Loading } from "../Loading";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

const AccountSettings = () => {
  const tableName = LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME;
  const { id } = useParams();
  const queryClient = new QueryClient();

  const {
    isLoading: isLoadingPMUserData,
    data: pmUserData,
    error: loadPMUserDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_${String(tableName).toUpperCase()}`, id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
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
      `REACT_QUERY_KEY_${String(
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
    isPending: isUpdatingPMUser,
    isSuccess: isUpdatePMUserSuccess,
    isError: isUpdatePMUserError,
    error: updatePMUserError,
    mutate: updateRow,
  } = useMutation({
    mutationFn: ({ tableName, id, data }) => {
      return updateRowAPI({ tableName, id, data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess("Updated user successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_${String(tableName).toUpperCase()}`,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const pmUserUpdateForm = useFormik({
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
    if (pmUserData) {
      pmUserUpdateForm.setFieldValue("username", pmUserData.username);
      pmUserUpdateForm.setFieldValue(
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

  useEffect(() => {
  }, [customPolicyObjectMapping]);

  return !isLoadingPMUserData && !isLoadingPolicyObjectData && pmUserData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Account settings`}</span>
          <span className="text-xs font-thin text-start text-slate-300">{`Account settings | Username : ${pmUserData.username}`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <RowDeletionForm tableName={tableName} id={id} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingPMUser && <CircularProgress color="inherit" size={12} />
            }
            className="!ml-2"
            onClick={pmUserUpdateForm.submitForm}
          >
            Update
          </Button>
        </div>
      </div>
      <Paper
        className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
        variant="outlined"
      >
        <form className="" onSubmit={pmUserUpdateForm.handleSubmit}>
          <Grid container rowSpacing={2} columnSpacing={3} className="!mt-2">
            <Grid item xs={12} sm={12} md={12} lg={12} key={"username"}>
              <FieldComponent
                type={"String"}
                name={"username"}
                value={pmUserUpdateForm.values["username"]}
                onBlur={pmUserUpdateForm.handleBlur}
                onChange={pmUserUpdateForm.handleChange}
                setFieldValue={pmUserUpdateForm.setFieldValue}
                helperText={pmUserUpdateForm.errors["username"]}
                error={Boolean(pmUserUpdateForm.errors["username"])}
                required={true}
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
                value={pmUserUpdateForm.values["pm_policy_object_id"]}
                onBlur={pmUserUpdateForm.handleBlur}
                onChange={pmUserUpdateForm.handleChange}
                setFieldValue={pmUserUpdateForm.setFieldValue}
                helperText={pmUserUpdateForm.errors["pm_policy_object_id"]}
                error={Boolean(pmUserUpdateForm.errors["pm_policy_object_id"])}
                required={true}
                customMapping={customPolicyObjectMapping}
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

export default AccountSettings;
