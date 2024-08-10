import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";

import { Button, CircularProgress, Grid, useTheme } from "@mui/material";
import { useMemo } from "react";
import { addAccountAPI } from "../../../api/accounts";
import { getAllPoliciesAPI } from "../../../api/policy";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { FieldComponent } from "../../FieldComponent";

export const AccountAdditionForm = ({ tableName }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

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

  const {
    isPending: isAddingAccount,
    isSuccess: isAddingAccountSuccess,
    isError: isAddingAccountError,
    error: addAccountError,
    mutate: addAccount,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addAccountAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.ACCOUNT_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.ACCOUNTS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const accountAdditionForm = useFormik({
    initialValues: {
      username: "",
      first_name: "",
      last_name: "",
      password: "",
      pm_policy_object_id: "",
      address1: "",
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      addAccount({ data: values });
    },
  });
  return (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full mt-3 ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.ACCOUNT_ADDITION_PAGE_TITLE}
          </span>
        </div>

        <div className="flex flex-row items-center justify-end w-min">
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isAddingAccount && <CircularProgress color="inherit" size={12} />
            }
            className="!ml-2"
            onClick={accountAdditionForm.handleSubmit}
          >
            <span className="!w-max">
              {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
            </span>
          </Button>
        </div>
      </div>
      <div
        className="px-4 mt-3 w-full 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full pb-3"
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <form onSubmit={accountAdditionForm.handleSubmit}>
          <Grid
            container
            spacing={{ xs: 1, md: 2 }}
            columns={{ xs: 1, sm: 1, md: 2 }}
            className="!mt-2"
          >
            <Grid item xs={12} sm={12} md={12} lg={12} key={"username"}>
              <FieldComponent
                type={"String"}
                name={"username"}
                readOnly={false}
                value={accountAdditionForm.values["username"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                setFieldValue={accountAdditionForm.setFieldValue}
                helperText={accountAdditionForm.errors["username"]}
                error={Boolean(accountAdditionForm.errors["username"])}
                required={true}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"first_name"}>
              <FieldComponent
                type={"String"}
                name={"first_name"}
                readOnly={false}
                value={accountAdditionForm.values["first_name"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                setFieldValue={accountAdditionForm.setFieldValue}
                helperText={accountAdditionForm.errors["first_name"]}
                error={Boolean(accountAdditionForm.errors["first_name"])}
                required={false}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"last_name"}>
              <FieldComponent
                type={"String"}
                name={"last_name"}
                readOnly={false}
                value={accountAdditionForm.values["last_name"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                setFieldValue={accountAdditionForm.setFieldValue}
                helperText={accountAdditionForm.errors["last_name"]}
                error={Boolean(accountAdditionForm.errors["last_name"])}
                required={false}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"address1"}>
              <FieldComponent
                type={"String"}
                name={"address1"}
                readOnly={false}
                value={accountAdditionForm.values["address1"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                setFieldValue={accountAdditionForm.setFieldValue}
                helperText={accountAdditionForm.errors["address1"]}
                error={Boolean(accountAdditionForm.errors["address1"])}
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
                value={accountAdditionForm.values["pm_policy_object_id"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                setFieldValue={accountAdditionForm.setFieldValue}
                helperText={accountAdditionForm.errors["pm_policy_object_id"]}
                error={Boolean(
                  accountAdditionForm.errors["pm_policy_object_id"]
                )}
                required={true}
                customMapping={customPolicyObjectMapping}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"password"}>
              <FieldComponent
                type={"String"}
                name={"password"}
                value={accountAdditionForm.values["password"]}
                onBlur={accountAdditionForm.handleBlur}
                onChange={accountAdditionForm.handleChange}
                helperText={accountAdditionForm.errors["password"]}
                error={Boolean(accountAdditionForm.errors["password"])}
                setFieldValue={accountAdditionForm.setFieldValue}
              />
            </Grid>
          </Grid>
        </form>
      </div>
    </div>
  );
};
