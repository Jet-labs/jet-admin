import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormik } from "formik";
import { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";

export const DatabaseWidgetDatasetArguments = ({
  open,
  onClose,
  datasetIndex,
  widgetForm,
  initialValues,
  selectedQuery,
}) => {
  const datasetArgumentsForm = useFormik({
    initialValues: {
      databaseQueryArgValues: {},
      ...initialValues,
    },
    validationSchema: formValidations.datasetArgumentsFormValidationSchema(
      selectedQuery?.databaseQueryData?.args
    ),
    enableReinitialize: true,
    onSubmit: (values) => {
      widgetForm.setFieldValue(
        `databaseQueries[${datasetIndex}].databaseQueryArgValues`,
        values.databaseQueryArgValues
      );
      onClose();
    },
  });

  const _handleUpdateDatasetQueryArgs = useCallback((arg, value) => {
    datasetArgumentsForm.setFieldValue(`databaseQueryArgValues`, {
      ...datasetArgumentsForm.values.databaseQueryArgValues,
      [arg]: value,
    });
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.WIDGET_DATASET_ARGUMENTS_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        {selectedQuery?.databaseQueryData?.args?.length > 0 && (
          <div>
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_ARGUMENTS_LABEL}
            </label>
            <div className="space-y-2">
              {selectedQuery.databaseQueryData.args.map((arg, argIndex) => {
                const argName = arg.replace(/[{}]/g, "");
                return (
                  <div key={`arg-${argIndex}`}>
                    <input
                      type="text"
                      id={`arg-${argName}`}
                      className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
                      placeholder={`Value for ${argName}`}
                      value={
                        datasetArgumentsForm.values.databaseQueryArgValues?.[argName] || ""
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