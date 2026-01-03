import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

/**
 * Reusable component for configuring input arguments for both queries and workflows.
 * Works with dataQueryOptions.args for queries and workflowOptions.args for workflows.
 */
export const WidgetDatasetArguments = ({
  open,
  onClose,
  datasetIndex,
  widgetForm,
  initialValues,
  selectedWorkflow,
}) => {
  WidgetDatasetArguments.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    datasetIndex: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired,
    selectedWorkflow: PropTypes.object,
  };

  // Get args based on data source type
  const args = selectedWorkflow?.workflowOptions?.args || []

  // Get the field name for storing values based on type
  const valuesFieldName = "workflowArgValues"

  const datasetArgumentsForm = useFormik({
    initialValues: {
      [valuesFieldName]: {},
      ...initialValues,
    },
    validationSchema: formValidations.datasetArgumentsFormValidationSchema(args),
    enableReinitialize: true,
    onSubmit: (values) => {
      widgetForm.setFieldValue(
        `workflows[${datasetIndex}].${valuesFieldName}`,
        values[valuesFieldName]
      );
      onClose();
    },
  });

  const _handleUpdateDatasetQueryArgs = useCallback((arg, value) => {
    datasetArgumentsForm.setFieldValue(valuesFieldName, {
      ...datasetArgumentsForm.values[valuesFieldName],
      [arg]: value,
    });
  }, [datasetArgumentsForm, valuesFieldName]);

  const title = CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_TITLE;

  const label = CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_ARGUMENTS_LABEL;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="!p-4 !pb-0">
        {title}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        {args?.length > 0 ? (
          <div>
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {label}
            </label>
            <div className="space-y-2">
              {args.map((arg, argIndex) => {
                const argName = arg.key;
                return (
                  <div key={`arg-${argIndex}`}>
                    <label className="block mb-1 text-xs text-slate-600">
                      {argName}
                      {arg.required && <span className="text-red-500 ml-0.5">*</span>}
                      {arg.type && <span className="text-slate-400 ml-1">({arg.type})</span>}
                    </label>
                    <input
                      type="text"
                      id={`arg-${argName}`}
                      className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
                      placeholder={`Value for ${argName}`}
                      value={
                        datasetArgumentsForm.values[valuesFieldName]?.[argName] || ""
                      }
                      onChange={(e) =>
                        _handleUpdateDatasetQueryArgs(argName, e.target.value)
                      }
                      onBlur={datasetArgumentsForm.handleBlur}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
              No input parameters defined.
          </p>
        )}
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={onClose}
          type="button"
          className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_CANCEL}
        </button>

        <button
          type="button"
          onClick={datasetArgumentsForm.handleSubmit}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_CONFIRM}
        </button>
      </DialogActions>
    </Dialog>
  );
};