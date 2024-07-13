import { Button, CircularProgress, Grid, useTheme } from "@mui/material";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";

import { FieldComponent } from "../../FieldComponent";

import { addRowAPI } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";

import samplePolicy from "../../../sample_admin_policy.json";
import { PolicyDeletionForm } from "../PolicyDeletionForm";
import { GUIPolicyEditor } from "../PolicyEditorComponents/GUIPolicyEditor";
export const PolicyAdditionForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = new QueryClient();

  const {
    isPending: isAddingPolicyObject,
    isSuccess: isAddPolicyObjectSuccess,
    isError: isAddPolicyObjectError,
    error: addPolicyObjectError,
    mutate: addRow,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addRowAPI({
        tableName: LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME,

        data,
      });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess("Added policy successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(
          LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME
        ).toUpperCase()}`,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const policyObjectAdditionForm = useFormik({
    initialValues: {
      title: "",
      pm_policy_object_id: "",
      is_disabled: false,
      policy: samplePolicy,
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      addRow({ data: values });
    },
  });

  return (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Add policy`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <PolicyDeletionForm id={id} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isAddingPolicyObject && (
                <CircularProgress color="inherit" size={12} />
              )
            }
            className="!ml-2"
            onClick={policyObjectAdditionForm.submitForm}
          >
            Add policy
          </Button>
        </div>
      </div>
      <form
        className="!flex !flex-col justify-start items-stretch 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full"
        onSubmit={policyObjectAdditionForm.handleSubmit}
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
                type={LOCAL_CONSTANTS.DATA_TYPES.INT}
                name={"pm_policy_object_id"}
                value={policyObjectAdditionForm.values["pm_policy_object_id"]}
                onBlur={policyObjectAdditionForm.handleBlur}
                onChange={policyObjectAdditionForm.handleChange}
                setFieldValue={policyObjectAdditionForm.setFieldValue}
                helperText={
                  policyObjectAdditionForm.errors["pm_policy_object_id"]
                }
                error={Boolean(
                  policyObjectAdditionForm.errors["pm_policy_object_id"]
                )}
                required={true}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"title"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                name={"title"}
                value={policyObjectAdditionForm.values["title"]}
                onBlur={policyObjectAdditionForm.handleBlur}
                onChange={policyObjectAdditionForm.handleChange}
                setFieldValue={policyObjectAdditionForm.setFieldValue}
                helperText={policyObjectAdditionForm.errors["title"]}
                error={Boolean(policyObjectAdditionForm.errors["title"])}
                required={true}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"is_disabled"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
                name={"is_disabled"}
                value={policyObjectAdditionForm.values["is_disabled"]}
                onBlur={policyObjectAdditionForm.handleBlur}
                onChange={policyObjectAdditionForm.handleChange}
                setFieldValue={policyObjectAdditionForm.setFieldValue}
                helperText={policyObjectAdditionForm.errors["is_disabled"]}
                error={Boolean(policyObjectAdditionForm.errors["is_disabled"])}
                required={true}
                customMapping={null}
              />
            </Grid>
          </Grid>
        </div>
        <GUIPolicyEditor
          policy={policyObjectAdditionForm.values["policy"]}
          handleChange={(value) => {
            policyObjectAdditionForm.setFieldValue("policy", value);
          }}
          containerClass="!mt-4"
        />
      </form>
    </div>
  );
};
