// Custom Radio Input Renderer
import React from 'react';
import PropTypes from 'prop-types';

export const CustomRadioInput = (props) => {
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
  const orientation = uischema?.options?.orientation || 'horizontal'; // 'horizontal' or 'vertical'

  // Function to determine the display name for an option
  const getDisplayName = (optionValue) => {
    // Check if the uischema explicitly provides an enum mapping
    if (uischema.options && uischema.options.enumLabels) {
      if (Array.isArray(uischema.options.enumLabels)) {
        const labelMap = uischema.options.enumLabels.find(
          (item) => item.value === optionValue
        );
        if (labelMap) return labelMap.label;
      } else if (typeof uischema.options.enumLabels === 'object') {
        if (uischema.options.enumLabels[optionValue]) {
          return uischema.options.enumLabels[optionValue];
        }
      }
    }
    // Default: use the optionValue itself formatted nicely
    return optionValue.charAt(0).toUpperCase() + optionValue.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="mb-3">
      <label
        className={`block mb-2 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4'}`}>
        {options.map((optionValue) => (
          <label
            key={optionValue}
            className={`flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name={path}
              value={optionValue}
              checked={data === optionValue}
              disabled={isDisabled}
              onChange={(ev) => handleChange(path, ev.target.value)}
              className="w-4 h-4 text-indigo-600 bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:ring-2"
            />
            <span className={`text-sm ${data === optionValue ? 'text-slate-700 font-medium' : 'text-slate-600'}`}>
              {getDisplayName(optionValue)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

CustomRadioInput.propTypes = {
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
