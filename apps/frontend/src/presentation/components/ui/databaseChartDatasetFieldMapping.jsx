import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormik } from "formik";
import { useCallback } from "react";
import { CONSTANTS } from "../../../constants";

export const DatabaseChartDatasetFieldMapping = ({
  open,
  onClose,
  datasetIndex,
  chartForm,
  initialValues,
  selectedQuery,
  datasetFields,
}) => {
    const datasetFieldMappingForm = useFormik({
      initialValues: {
        argsMap: {},
        datasetFields: {
          xAxis: "",
          yAxis: "",
          label: "",
          value: "",
        },
        ...initialValues,
      },
      enableReinitialize: true,
      onSubmit: (values) => {
        chartForm.setFieldValue(
          `databaseQueries[${datasetIndex}].datasetFields`,
          values.datasetFields
        );
        chartForm.setFieldValue(
          `databaseQueries[${datasetIndex}].argsMap`,
          values.argsMap
        );
        onClose();
      },
    });

      const _handleUpdateDatasetQueryArgs = useCallback(
        (arg, value) => {
          datasetFieldMappingForm.setFieldValue(`argsMap`, {
            ...datasetFieldMappingForm.values.argsMap,
            [arg]: value,
          });
        },
        []
      );

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>
          {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_TITLE}
        </DialogTitle>
        <DialogContent>
          {selectedQuery?.databaseQuery?.args?.length > 0 && (
            <div>
              <label className="block mb-2 text-xs font-normal text-slate-500">
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_ARGUMENTS_LABEL}
              </label>
              <div className="space-y-2">
                {selectedQuery.databaseQuery.args.map((arg, argIndex) => {
                  const argName = arg.replace(/[{}]/g, "");
                  return (
                    <div key={`arg-${argIndex}`}>
                      <input
                        type="text"
                        id={`arg-${argName}`}
                        className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
                        placeholder={`Value for ${argName}`}
                        value={
                          datasetFieldMappingForm.values.argsMap?.[argName] ||
                          ""
                        }
                        onChange={(e) =>
                          _handleUpdateDatasetQueryArgs(argName, e.target.value)
                        }
                        onBlur={datasetFieldMappingForm.handleBlur}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {datasetFields?.includes("xAxis") && (
              <div>
                <label
                  htmlFor={`datasetFields.xAxis`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_X_AXIS_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`datasetFields.xAxis`}
                  id={`datasetFields.xAxis`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={datasetFieldMappingForm.handleChange}
                  onBlur={datasetFieldMappingForm.handleBlur}
                  value={datasetFieldMappingForm.values.datasetFields.xAxis}
                />
              </div>
            )}
            {datasetFields?.includes("yAxis") && (
              <div>
                <label
                  htmlFor={`datasetFields.yAxis`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`datasetFields.yAxis`}
                  id={`datasetFields.yAxis`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={datasetFieldMappingForm.handleChange}
                  onBlur={datasetFieldMappingForm.handleBlur}
                  value={datasetFieldMappingForm.values.datasetFields.yAxis}
                />
              </div>
            )}
            {datasetFields?.includes("label") && (
              <div>
                <label
                  htmlFor={`datasetFields.label`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`datasetFields.label`}
                  id={`datasetFields.label`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={datasetFieldMappingForm.handleChange}
                  onBlur={datasetFieldMappingForm.handleBlur}
                  value={datasetFieldMappingForm.values.datasetFields.label}
                />
              </div>
            )}
            {datasetFields?.includes("value") && (
              <div>
                <label
                  htmlFor={`datasetFields.value`}
                  className="block mb-1 text-xs font-normal text-slate-500"
                >
                  {
                    CONSTANTS.STRINGS
                      .CHART_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL
                  }
                </label>
                <input
                  type="text"
                  name={`datasetFields.value`}
                  id={`datasetFields.value`}
                  className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                  required={true}
                  onChange={datasetFieldMappingForm.handleChange}
                  onBlur={datasetFieldMappingForm.handleBlur}
                  value={datasetFieldMappingForm.values.datasetFields.value}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className="">
          <button
            onClick={onClose}
            type="button"
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
          >
            {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_CANCEL}
          </button>

          <button
            type="button"
            onClick={datasetFieldMappingForm.handleSubmit}
            className={`px-2.5 py-1.5 text-white text-sm bg-red-500 rounded hover:bg-red-600 hover:outline-none hover:border-0 border-0 outline-none `}
          >
            {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_CONFIRM}
          </button>
        </DialogActions>
      </Dialog>
    );
};