import { Button, CircularProgress, Grid } from "@mui/material";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useFormik } from "formik";
import { isNull } from "lodash";
import { useEffect, useState } from "react";
import { sendActionAPI } from "../../api/actions";
import { FieldComponent } from "../../components/FieldComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";

export const ActionItem = ({
  actionTitle,
  actionSubmitFunction,
  actionFormData,
}) => {
  const [fieldDataMap, setFieldDataMap] = useState();
  const formDataQueries = useQueries({
    queries: Object.keys(actionFormData.fields).map((field) => {
      if (
        (actionFormData.fields[field].type === "SINGLE_SELECT" ||
          actionFormData.fields[field].type === "MULTIPLE_SELECT") &&
        actionFormData.fields[field].options.method === "dynamic"
      )
        return {
          queryKey: [actionTitle, field],
          queryFn: actionFormData.fields[field].options.data.queryFn,
        };
    }),
  });

  const isFormDataQueriesSuccess = formDataQueries.some((q) => q.data);

  useEffect(() => {
    const _fieldDataMap = {};
    Object.keys(actionFormData.fields).forEach((field, index) => {
      if (actionFormData.fields[field].options?.method == "dynamic") {
        if (
          actionFormData.fields[field].options.mapping &&
          formDataQueries[index].data?.rows
        ) {
          const _data = formDataQueries[index].data.rows.map((row) => {
            return {
              label: row[actionFormData.fields[field].options.mapping.label],
              value: row[actionFormData.fields[field].options.mapping.value],
            };
          });

          _fieldDataMap[field] = _data;
        } else {
          _fieldDataMap[field] = formDataQueries[index].data?.rows;
        }
      } else if (actionFormData.fields[field].options?.method == "static") {
        _fieldDataMap[field] = actionFormData.fields[field].options.data;
      } else {
        _fieldDataMap[field] = null;
      }
    });
    setFieldDataMap(_fieldDataMap);
  }, [isFormDataQueriesSuccess]);
  const {
    isPending: isSendingAction,
    isSuccess: isActionSuccess,
    isError: isActionError,
    error: actionError,
    mutate: sendAction,
  } = useMutation({
    mutationFn: (values) => {
      return sendActionAPI(actionSubmitFunction(values));
    },

    retry: false,
    onSuccess: () => {
      displaySuccess("Action successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const actionForm = useFormik({
    initialValues: actionFormData.initialValues,
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      Object.keys(actionFormData.fields)?.forEach((field) => {
        if (
          (isNull(values[field]) ||
            (Array.isArray(values[field]) && values[field].length == 0)) &&
          actionFormData.fields[field].required
        ) {
          errors[field] = "Required";
        }
      });
      return errors;
    },

    onSubmit: (values) => {
      let _values = {};
      Object.keys(values).forEach((key) => {
        if (
          actionFormData.fields[key].type ==
          LOCAL_CONSTANTS.DATA_TYPES.SINGLE_SELECT
        ) {
          _values[key] = values[key].value ? values[key].value : values[key];
        } else if (
          actionFormData.fields[key].type ==
          LOCAL_CONSTANTS.DATA_TYPES.MULTIPLE_SELECT
        ) {
          const _fieldValue = values[key].map((v) => {
            return v.value;
          });
          _values[key] = _fieldValue;
        } else {
          _values[key] = values[key];
        }
      });

      sendAction(_values);
    },
  });
  return (
    <form
      className="flex flex-col justify-start items-center w-full h-full"
      onSubmit={actionForm.handleSubmit}
    >
      <Grid container rowSpacing={2} columnGap={2} className="">
        {formDataQueries &&
          fieldDataMap &&
          Object.keys(actionFormData.fields).map((field, index) => {
            return (
              <Grid item xs={12} sm={12} md={12} lg={6} key={index}>
                <FieldComponent
                  readOnly={false}
                  type={actionFormData.fields[field].type}
                  name={field}
                  value={actionForm.values[field]}
                  onBlur={actionForm.handleBlur}
                  onChange={actionForm.handleChange}
                  helperText={actionForm.errors[field]}
                  error={actionForm.errors[field]}
                  required={actionFormData.fields[field].required}
                  selectOptions={fieldDataMap[field]}
                />
              </Grid>
            );
          })}
        <Grid lg={12}>
          <Button
            disabled={isSendingAction}
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isSendingAction && <CircularProgress color="inherit" size={12} />
            }
            className="!mt-3"
            // onClick={_handelSubmitAction}
          >
            Send action
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
