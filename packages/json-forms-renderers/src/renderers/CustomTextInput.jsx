// Custom Text Input Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Textarea, Label } from '@jet-admin/ui';

export const CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;
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
      {isMulti ? (
        <Textarea
          id={path}
          name={path}
          disabled={isDisabled}
          className={hasErrors ? "border-red-500 focus:border-red-500" : ""}
          placeholder={
            hasErrors
              ? errors
              : uischema?.options?.placeholder || ""
          }
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
          rows={uischema?.options?.rows || 3}
        />
      ) : (
          <Input
          type={uischema?.options?.format === "password" ? "password" : "text"}
          id={path}
          name={path}
          disabled={isDisabled}
          className={hasErrors ? "border-red-500 focus:border-red-500" : ""}
          placeholder={
            hasErrors
              ? errors
              : uischema?.options?.placeholder || ""
          }
          onChange={(ev) => handleChange(path, ev.target.value)}
          value={data || ""}
        />
      )}
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
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
