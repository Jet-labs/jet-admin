import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { WIDGET_DATASET_ADVANCED_OPTIONS } from "@jet-admin/widget-types";
import { CONSTANTS } from "../../../constants";

export const WidgetDatasetAdvancedOptions = ({
  open,
  onClose,
  datasetIndex,
  widgetForm,
  initialValues,
  parentWidgetType,
}) => {
  WidgetDatasetAdvancedOptions.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    datasetIndex: PropTypes.number.isRequired,
    widgetForm: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired,
    parentWidgetType: PropTypes.string.isRequired,
  };

  const datasetAdvancedOptionsForm = useFormik({
    initialValues: {
      ...initialValues,
    },
    // validationSchema:
    //   formValidations.datasetAdvancedOptionsFormValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      widgetForm.setFieldValue(
        `dataQueries[${datasetIndex}].parameters`,
        values
      );
      onClose();
    },
  });

  const renderOption = useCallback(
    (option) => {
      const {
        key,
        type,
        description,
        options: selectOptions,
        // eslint-disable-next-line no-unused-vars
        ...rest
      } = option;

      const datasetKey = `${key}`;

      if (!option.relevantWidgets.includes(parentWidgetType)) return null;

      const formValue = key
        .split(".")
        .reduce((acc, part) => acc?.[part], datasetAdvancedOptionsForm.values);

      const defaultValue = option.defaultValue;

      const commonProps = {
        key: datasetKey,
        className:
          "w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded",
        value: formValue,
        onChange: (e) => {
          const value =
            type === "number"
              ? +e.target.value
              : type === "boolean"
              ? e.target.value === "true"
              : e.target.value;

          datasetAdvancedOptionsForm.setFieldValue(datasetKey, value);
        },
      };

      switch (type) {
        case "boolean":
          return (
            <select
              {...commonProps}
              defaultValue={defaultValue == true ? "true" : "false"}
              className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            >
              <option value={"true"} className="text-slate-500 text-xs">
                Yes
              </option>
              <option value={"false"} className="text-slate-500 text-xs">
                No
              </option>
            </select>
          );

        case "color":
          return <input type="color" {...commonProps} />;

        case "select":
          return (
            <select
              {...commonProps}
              className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            >
              {selectOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="text-slate-500 text-xs"
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          );

        default:
          return (
            <input
              {...commonProps}
              className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
              type={type}
              placeholder={description}
            />
          );
      }
    },
    [datasetAdvancedOptionsForm, datasetIndex, parentWidgetType]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="!p-4 !pb-0">
        {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_TITLE}
      </DialogTitle>
      <DialogContent className="!p-4 !space-y-4">
        {WIDGET_DATASET_ADVANCED_OPTIONS.filter((option) =>
          option.relevantWidgets.includes(parentWidgetType)
        ).map((option) => (
          <div key={option.key} className="col-span-2">
            <label className="block mb-2 text-xs font-medium text-slate-600">
              {option.name}
              <span className="text-slate-400 text-[10px] block">
                {option.description}
              </span>
            </label>
            {datasetAdvancedOptionsForm && renderOption(option)}
          </div>
        ))}
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={onClose}
          type="button"
          className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_CANCEL}
        </button>

        <button
          type="button"
          onClick={datasetAdvancedOptionsForm.handleSubmit}
          className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
        >
          {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_CONFIRM}
        </button>
      </DialogActions>
    </Dialog>
  );
};
