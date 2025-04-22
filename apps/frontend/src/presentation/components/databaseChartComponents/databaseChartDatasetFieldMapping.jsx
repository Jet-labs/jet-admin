import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useMemo } from "react";
import ReactJson from "react-json-view";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { CollapseComponent } from "../ui/collapseComponent";

export const DatabaseChartDatasetFieldMapping = ({
  open,
  onClose,
  datasetIndex,
  chartForm,
  initialValues,
  selectedQuery,
  datasetFields,
}) => {
  DatabaseChartDatasetFieldMapping.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    datasetIndex: PropTypes.number.isRequired,
    chartForm: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired,
    selectedQuery: PropTypes.object.isRequired,
    datasetFields: PropTypes.array.isRequired,
  };

  const datasetFieldMappingForm = useFormik({
    initialValues: {
      databaseQueryArgValues: {},
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
    validationSchema:
      formValidations.datasetFieldMappingFormValidationSchema(datasetFields),
    onSubmit: (values) => {
      chartForm.setFieldValue(
        `databaseQueries[${datasetIndex}].datasetFields`,
        values.datasetFields
      );
      chartForm.setFieldValue(
        `databaseQueries[${datasetIndex}].databaseQueryArgValues`,
        values.databaseQueryArgValues
      );
      onClose();
    },
  });

  const _dataTypeSuggestionDataList = useMemo(() => {
    if (selectedQuery && selectedQuery.databaseQueryResultSchema) {
      const dataList = selectedQuery.databaseQueryResultSchema.items?.properties
        ? Object.keys(selectedQuery.databaseQueryResultSchema.items.properties)
        : Object.keys(selectedQuery.databaseQueryResultSchema);
      return (
        <datalist id="data-type-suggestions">
          {dataList.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      );
    }
    return null;
  }, [selectedQuery]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        <div className="rounded border border-slate-200">
          {_dataTypeSuggestionDataList}
          {selectedQuery && selectedQuery.databaseQueryResultSchema ? (
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
                    src={
                      selectedQuery.databaseQueryResultSchema.items?.properties
                        ? selectedQuery.databaseQueryResultSchema.items
                            .properties
                        : selectedQuery.databaseQueryResultSchema
                    }
                    theme={"ashes"}
                  />
                </Box>
              )}
            />
          ) : (
            <span className=" text-red-500 font-normal text-xs p-2">
              {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_NO_META}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {datasetFields?.includes("xAxis") && (
            <div>
              <label
                htmlFor={`datasetFields.xAxis`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_X_AXIS_LABEL}
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
                list="data-type-suggestions"
              />
            </div>
          )}
          {datasetFields?.includes("yAxis") && (
            <div>
              <label
                htmlFor={`datasetFields.yAxis`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_Y_AXIS_LABEL}
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
                list="data-type-suggestions"
              />
            </div>
          )}
          {datasetFields?.includes("label") && (
            <div>
              <label
                htmlFor={`datasetFields.label`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_LABEL_LABEL}
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
                list="data-type-suggestions"
              />
            </div>
          )}
          {datasetFields?.includes("value") && (
            <div>
              <label
                htmlFor={`datasetFields.value`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_VALUE_LABEL}
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
                list="data-type-suggestions"
              />
            </div>
          )}
          {datasetFields?.includes("radius") && (
            <div>
              <label
                htmlFor={`datasetFields.radius`}
                className="block mb-1 text-xs font-normal text-slate-500"
              >
                {CONSTANTS.STRINGS.CHART_EDITOR_FORM_DATASET_FIELD_RADIUS_LABEL}
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
                list="data-type-suggestions"
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
          {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_CANCEL}
        </button>

        <button
          type="button"
          onClick={datasetFieldMappingForm.handleSubmit}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
        >
          {CONSTANTS.STRINGS.CHART_DATASET_FIELD_MAPPING_CONFIRM}
        </button>
      </DialogActions>
    </Dialog>
  );
};
