import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormik } from "formik";
import { useCallback } from "react";
import { CONSTANTS } from "../../../constants";
import ReactJson from "react-json-view";
import { CollapseComponent } from "../ui/collapseComponent";
import { Box } from "@mui/material";

export const DatabaseWidgetDatasetFieldMapping = ({
  open,
  onClose,
  datasetIndex,
  widgetForm,
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
        radius: "",
      },
      ...initialValues,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      widgetForm.setFieldValue(
        `databaseQueries[${datasetIndex}].datasetFields`,
        values.datasetFields
      );
      widgetForm.setFieldValue(
        `databaseQueries[${datasetIndex}].argsMap`,
        values.argsMap
      );
      onClose();
    },
  });

  const _handleUpdateDatasetQueryArgs = useCallback((arg, value) => {
    datasetFieldMappingForm.setFieldValue(`argsMap`, {
      ...datasetFieldMappingForm.values.argsMap,
      [arg]: value,
    });
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        <div className="rounded border border-slate-200">
          {selectedQuery && selectedQuery.databaseQueryResultSchema && false ? (
            <CollapseComponent
              showButtonText={"Query result metadata"}
              hideButtonText={"Hide"}
              containerClass={"p-1"}
              content={() => (
                <Box
                  sx={{ bgcolor: "background.secondary" }}
                  className="!max-h-32 !overflow-y-auto"
                >
                  <ReactJson
                    src={selectedQuery.databaseQueryResultSchema}
                    theme={"ashes"}
                  />
                </Box>
              )}
            />
          ) : (
            <span className=" text-red-500 font-normal text-xs p-2">
              {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_NO_META}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {datasetFields?.includes("text") && (
            <div>
              <label
                htmlFor={`datasetFields.text`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_TEXT_LABEL}
              </label>
              <input
                type="text"
                name={`datasetFields.text`}
                id={`datasetFields.text`}
                className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                required={true}
                onChange={datasetFieldMappingForm.handleChange}
                onBlur={datasetFieldMappingForm.handleBlur}
                value={datasetFieldMappingForm.values.datasetFields.text}
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
                    .WIDGET_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL
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
                {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL}
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
                {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL}
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
          {datasetFields?.includes("radius") && (
            <div>
              <label
                htmlFor={`datasetFields.radius`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {
                  CONSTANTS.STRINGS
                    .WIDGET_EDITOR_FORM_DATASET_FIELD_RADIUS_LABEL
                }
              </label>
              <input
                type="text"
                name={`datasetFields.radius`}
                id={`datasetFields.radius`}
                className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
                required={true}
                onChange={datasetFieldMappingForm.handleChange}
                onBlur={datasetFieldMappingForm.handleBlur}
                value={datasetFieldMappingForm.values.datasetFields.radius}
              />
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={onClose}
          type="button"
          className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_CANCEL}
        </button>

        <button
          type="button"
          onClick={datasetFieldMappingForm.handleSubmit}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_FIELD_MAPPING_CONFIRM}
        </button>
      </DialogActions>
    </Dialog>
  );
};