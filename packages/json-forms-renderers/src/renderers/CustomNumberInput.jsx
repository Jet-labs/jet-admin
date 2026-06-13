// Custom Number Input Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { Label, TemplateAutocompleteInput } from '@jet-admin/ui';

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
    enabled,
  } = props;

  const options = uischema?.options || {};
  const isDisabled = enabled === false;
  const stateTree = options.stateTree || null;
  const templateMode = options.templateMode;

  const handleInputChange = (valueString) => {
    if (valueString === "") {
      handleChange(path, undefined);
    } else if (valueString.includes("{{")) {
      handleChange(path, valueString);
    } else {
      const numValue =
        schema.type === "integer"
          ? parseInt(valueString, 10)
          : parseFloat(valueString);

      if (!isNaN(numValue) && String(numValue) === valueString.trim()) {
        handleChange(path, numValue);
      } else {
        handleChange(path, valueString);
      }
    }
  };

  const stringValue = data === undefined || data === null ? "" : String(data);
  const isTemplateString = stringValue.includes("{{");

  // JSON Forms passes `errors` as a single string
  let displayErrors = errors || "";
  
  // Suppress "must be integer/number" AJV errors if a template is being used
  if (isTemplateString && (displayErrors.includes("must be integer") || displayErrors.includes("must be number"))) {
    displayErrors = "";
  }

  const hasErrors = displayErrors.length > 0;
  const placeholder = hasErrors ? displayErrors : uischema?.options?.placeholder || "";

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 ${hasErrors ? "text-red-500" : ""}`}
      >
        {label || description}
      </Label>
      <TemplateAutocompleteInput
        value={stringValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        liveStateTree={stateTree}
        mode={templateMode}
        readOnly={isDisabled}
        className={hasErrors ? "ring-1 ring-red-500 rounded-sm" : ""}
      />
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{displayErrors}</p>
      )}
    </div>
  );
};

CustomNumberInput.propTypes = {
  data: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};
