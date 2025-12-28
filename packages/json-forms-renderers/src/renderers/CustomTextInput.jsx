// Custom Text Input Renderer
import React from 'react';
import PropTypes from 'prop-types';

export const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;

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
      {isMulti ? (
        <textarea
          id={path}
          name={path}
          disabled={isDisabled}
          className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200"
          } text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={
            errors && errors.length > 0
              ? errors
              : uischema?.options?.placeholder || ""
          }
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
          rows={uischema?.options?.rows || 3}
        />
      ) : (
        <input
          type={uischema?.options?.format === "password" ? "password" : "text"}
          id={path}
          name={path}
          disabled={isDisabled}
          className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200"
          } text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={
            errors && errors.length > 0
              ? errors
              : uischema?.options?.placeholder || ""
          }
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
        />
      )}
    </div>
  );
};

CustomTextInput.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};
