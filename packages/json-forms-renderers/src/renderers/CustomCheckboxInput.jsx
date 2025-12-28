// Custom Checkbox Input Renderer
import React from 'react';
import PropTypes from 'prop-types';

export const CustomCheckboxInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    enabled,
    uischema,
  } = props;

  const onToggle = (ev) => {
    handleChange(path, ev.target.checked);
  };

  return (
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        id={path}
        name={path}
        checked={!!data}
        disabled={!enabled}
        onChange={onToggle}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <label htmlFor={path} className="ml-2 text-sm font-medium text-slate-700">
        {label || description || uischema.label}
      </label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mt-1 ml-2">{errors}</p>
      )}
    </div>
  );
};

CustomCheckboxInput.propTypes = {
  data: PropTypes.bool,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object.isRequired,
};
