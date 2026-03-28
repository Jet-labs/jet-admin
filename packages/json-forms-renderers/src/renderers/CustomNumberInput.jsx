// Custom Number Input Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Label } from '@jet-admin/ui';

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

  const hasErrors = errors && errors.length > 0;

  return (
    <div className="mb-3">
      <Label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          hasErrors ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        {label || description}
      </Label>
      <Input
        type="number"
        id={path}
        name={path}
        className={hasErrors ? "border-red-500 focus:border-red-500" : ""}
        placeholder={
          hasErrors
            ? errors
            : uischema?.options?.placeholder || ""
        }
        onChange={handleInputChange}
        value={data === undefined || data === null ? "" : data}
        min={schema.minimum}
        max={schema.maximum}
        step={step}
      />
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
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
