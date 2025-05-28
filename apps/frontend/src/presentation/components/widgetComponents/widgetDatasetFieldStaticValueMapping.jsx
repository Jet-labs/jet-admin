import { CONSTANTS } from "../../../constants";
import React from "react";
import PropTypes from "prop-types";

export const WidgetDatasetFieldStaticValueMapping = ({
  datasetIndex,
  widgetForm,
  datasetFields,
}) => {
  WidgetDatasetFieldStaticValueMapping.propTypes = {
    datasetIndex: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    datasetFields: PropTypes.array.isRequired,
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {datasetFields?.includes("text") && (
        <div className="col-span-2">
          <label
            htmlFor={`widgetForm.dataQueries[${datasetIndex}].staticValues.text`}
            className="block mb-1 text-xs font-normal text-slate-500"
          >
            {CONSTANTS.STRINGS.WIDGET_EDITOR_FORM_DATASET_FIELD_TEXT_LABEL}
          </label>
          <input
            type="text"
            name={`widgetForm.dataQueries[${datasetIndex}].staticValues.text`}
            id={`widgetForm.dataQueries[${datasetIndex}].staticValues.text`}
            className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
            required={true}
            onChange={widgetForm.handleChange}
            onBlur={widgetForm.handleBlur}
            value={
              widgetForm.values.dataQueries[datasetIndex]?.staticValues?.text
            }
          />
        </div>
      )}
    </div>
  );
};