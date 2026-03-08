import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { WIDGET_ADVANCED_OPTIONS } from "@jet-admin/widget-types";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";


export const WidgetAdvancedOptions = ({ widgetForm, parentWidgetType }) => {
  WidgetAdvancedOptions.propTypes = {
    widgetForm: PropTypes.object.isRequired,
    parentWidgetType: PropTypes.string.isRequired,
  };

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

      if (!option.relevantWidgets.includes(parentWidgetType)) return null;

      const formValue = key
        .split(".")
        .reduce((acc, part) => acc?.[part], widgetForm.values);

      const defaultValue = option.defaultValue;

      const commonProps = {
        key,
        className:
          "w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded",
        value: formValue
          ? formValue
          : type === "boolean"
          ? "false"
          : defaultValue,
        onChange: (e) => {
          const value =
            type === "number"
              ? +e.target.value
              : type === "boolean"
              ? e.target.value === "true"
              : e.target.value;

          widgetForm.setFieldValue(key, value);
        },
      };

      switch (type) {
        case "boolean":
          return (
            <Select value={commonProps.value !== undefined ? String(commonProps.value) : "false"} onValueChange={(val) => {
              const value = type === "number" ? +val : type === "boolean" ? val === "true" : val;
              widgetForm.setFieldValue(key, value);
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
              widgetForm.setFieldValue(key, value);
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
    [widgetForm]
  );


  return (
    <div className="grid grid-cols-2 gap-4 p-0 mt-2">
      {WIDGET_ADVANCED_OPTIONS.filter((option) =>
        option.relevantWidgets.includes(parentWidgetType)
      ).map((option) => (
        <div key={option.key} className="col-span-2">
          <label className="block mb-2 text-xs font-medium text-slate-600">
            {option.name}
            <span className="text-slate-400 text-[10px] block">
              {option.description}
            </span>
          </label>
          {widgetForm && renderOption(option)}
        </div>
      ))}
    </div>
  );
};
