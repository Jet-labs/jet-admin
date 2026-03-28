// Custom Checkbox Input Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Label } from '@jet-admin/ui';

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

  const onToggle = (checked) => {
    handleChange(path, checked);
  };

  return (
    <div className="flex items-center mb-3">
      <Checkbox
        id={path}
        checked={!!data}
        disabled={!enabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor={path} className="ml-2 text-sm font-medium text-foreground">
        {label || description || uischema.label}
      </Label>
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
