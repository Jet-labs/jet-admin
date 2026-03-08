import { useFormik } from "formik";
import React, { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from "@jet-admin/ui";
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xs p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
                      <Input
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
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_CANCEL}
          </Button>

          <Button
            type="button"
            onClick={datasetArgumentsForm.handleSubmit}
            
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_CONFIRM}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};