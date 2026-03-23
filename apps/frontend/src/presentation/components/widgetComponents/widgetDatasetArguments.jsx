import { useFormik } from "formik";
import React, { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, InputArgsForm } from "@jet-admin/ui";
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
  const valuesFieldName = "inputArgs"

  const datasetArgumentsForm = useFormik({
    initialValues: {
      [valuesFieldName]: {},
      ...initialValues,
    },
    validationSchema: formValidations.datasetArgumentsFormValidationSchema(args),
    enableReinitialize: true,
    onSubmit: (values) => {
      const finalArgs = { ...values[valuesFieldName] };
      args.forEach(arg => {
         if (arg.type === 'object') {
            const val = finalArgs[arg.key];
            if (typeof val === 'string' && val.trim() !== '') {
               try { finalArgs[arg.key] = JSON.parse(val); } catch(e) {}
            }
         }
      });
      widgetForm.setFieldValue(
        `workflows[${datasetIndex}].${valuesFieldName}`,
        finalArgs
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
              <InputArgsForm
                args={args}
                values={datasetArgumentsForm.values[valuesFieldName] || {}}
                onChange={(key, value) => _handleUpdateDatasetQueryArgs(key, value)}
              />
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