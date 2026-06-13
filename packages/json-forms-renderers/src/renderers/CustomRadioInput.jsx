// Custom Radio Input Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { Label, RadioGroup, RadioGroupItem } from '@jet-admin/ui';

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

  const hasErrors = errors && errors.length > 0;

  return (
    <div className="">
      <Label
        className={`block mb-2 ${hasErrors ? "text-red-500" : ""}`}
      >
        {label || description}
      </Label>
      <RadioGroup
        value={data || ""}
        onValueChange={(val) => handleChange(path, val)}
        disabled={isDisabled}
        className={`flex ${orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4'}`}
      >
        {options.map((optionValue) => (
          <div key={optionValue} className="flex items-center gap-2">
            <RadioGroupItem value={optionValue} id={`${path}-${optionValue}`} />
            <Label
              htmlFor={`${path}-${optionValue}`}
              className={`text-sm ${data === optionValue ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              {getDisplayName(optionValue)}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
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
