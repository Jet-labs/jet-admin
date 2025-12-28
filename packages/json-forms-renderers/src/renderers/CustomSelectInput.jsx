// Custom Select Input Renderer
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TbRefresh } from 'react-icons/tb';

export const CustomSelectInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    schema,
    uischema,
    enabled,
  } = props;
  
  const options = schema.enum || [];
  const isDisabled = enabled === false;
  const showRefreshButton = uischema?.options?.showRefreshButton ?? false;
  const onRefresh = uischema?.options?.onRefresh;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to determine the display name for an option
  const getDisplayName = (optionValue) => {
    // Check if the uischema explicitly provides an enum mapping (array format)
    if (uischema.options && uischema.options.enumLabels) {
      if (Array.isArray(uischema.options.enumLabels)) {
        const labelMap = uischema.options.enumLabels.find(
          (item) => item.value === optionValue
        );
        if (labelMap) return labelMap.label;
      } else if (typeof uischema.options.enumLabels === 'object') {
        // Support object format: { value1: "Label 1", value2: "Label 2" }
        if (uischema.options.enumLabels[optionValue]) {
          return uischema.options.enumLabels[optionValue];
        }
      }
    }
    // Default: use the optionValue itself if no specific label found
    return optionValue;
  };

  const handleRefreshClick = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      <div className={`flex items-center gap-2 ${showRefreshButton ? '' : ''}`}>
        <select
          id={path}
          name={path}
          disabled={isDisabled}
          className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200"
          } text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
        >
          {!data && (
            <option value="" disabled>
              {uischema?.options?.placeholder || "Select an option"}
            </option>
          )}
          {options.map((optionValue) => (
            <option key={optionValue} value={optionValue}>
              {getDisplayName(optionValue)}
            </option>
          ))}
        </select>
        {showRefreshButton && onRefresh && (
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing || isDisabled}
            className="flex-shrink-0 bg-slate-50 p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            title="Refresh list"
          >
            <TbRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

CustomSelectInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};

