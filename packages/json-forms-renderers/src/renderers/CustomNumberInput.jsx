// Custom Number Input Renderer
import React from 'react';
import PropTypes from 'prop-types';

export const CustomNumberInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    uischema,
    schema,
  } = props;

  const handleInputChange = (ev) => {
    const valueString = ev.target.value;
    if (valueString === "") {
      handleChange(path, undefined);
    } else {
      const numValue =
        schema.type === "integer"
          ? parseInt(valueString, 10)
          : parseFloat(valueString);

      if (!isNaN(numValue)) {
        handleChange(path, numValue);
      }
    }
  };

  const step =
    uischema.options?.step ||
    schema.multipleOf ||
    (schema.type === "integer" ? 1 : "any");

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
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs">{errors}</span>
      )}
      <input
        type="number"
        id={path}
        name={path}
        className={`placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${
          errors && errors.length > 0
            ? "border-red-500 focus:border-red-500"
            : "border-slate-200"
        } text-slate-700 rounded block w-full px-2.5 py-1.5`}
        placeholder={
          errors && errors.length > 0
            ? errors
            : uischema?.options?.placeholder || ""
        }
        onChange={handleInputChange}
        value={data === undefined || data === null ? "" : data}
        min={schema.minimum}
        max={schema.maximum}
        step={step}
      />
    </div>
  );
};

CustomNumberInput.propTypes = {
  data: PropTypes.number,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
};
