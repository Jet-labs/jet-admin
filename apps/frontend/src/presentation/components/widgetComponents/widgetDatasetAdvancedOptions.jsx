import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { WIDGET_DATASET_ADVANCED_OPTIONS } from "@jet-admin/widget-types";
import { CONSTANTS } from "../../../constants";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
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
            <Select value={commonProps.value !== undefined ? String(commonProps.value) : "false"} onValueChange={(val) => {
              const value = type === "number" ? +val : type === "boolean" ? val === "true" : val;
              datasetAdvancedOptionsForm.setFieldValue(datasetKey, value);
            }}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"true"} className="text-slate-500 text-xs">
                  Yes
                </SelectItem>
                <SelectItem value={"false"} className="text-slate-500 text-xs">
                  No
                </SelectItem>
              </SelectContent>
            </Select>
          );

        case "color":
          return <Input type="color" {...commonProps} />;

        case "select":
          return (
            <Select value={commonProps.value !== undefined ? String(commonProps.value) : undefined} onValueChange={(val) => {
              const value = type === "number" ? +val : val;
              datasetAdvancedOptionsForm.setFieldValue(datasetKey, value);
            }}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-slate-500 text-xs"
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        default:
          return (
            <Input
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold">
            {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_TITLE}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_CANCEL}
          </Button>

          <Button
            type="button"
            onClick={datasetAdvancedOptionsForm.handleSubmit}
            
          >
            {CONSTANTS.STRINGS.WIDGET_DATASET_ADV_CONFIRM}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
