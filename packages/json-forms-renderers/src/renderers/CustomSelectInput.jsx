// Custom Select Input Renderer
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import { Button, Label, SearchSelect } from '@jet-admin/ui';

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

  const hasErrors = errors && errors.length > 0;

  const selectOptions = options.map((optionValue) => ({
    value: optionValue,
    label: getDisplayName(optionValue),
  }));

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 ${hasErrors ? "text-red-500" : ""}`}
      >
        {label || description}
      </Label>
      <div className="flex items-center gap-2">
        <SearchSelect
          size="sm"
          value={data || ""}
          onChange={(val) => handleChange(path, val)}
          options={selectOptions}
          disabled={isDisabled}
          placeholder={uischema?.options?.placeholder || "Select an option"}
          className={`${hasErrors ? "border-red-500" : ""}`}
        />
        {showRefreshButton && onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            square
            onClick={handleRefreshClick}
            disabled={isRefreshing || isDisabled}
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
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
