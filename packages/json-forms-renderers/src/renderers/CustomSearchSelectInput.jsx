import React from 'react';
import PropTypes from 'prop-types';
import { Label, SearchSelect } from '@jet-admin/ui';

export const CustomSearchSelectInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    required,
    uischema,
    enabled,
  } = props;
  
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0;
  
  // Extract options and callbacks from uischema.options
  const selectOptions = uischema?.options?.options || [];
  const onSearchChange = uischema?.options?.onSearchChange;
  const onLoadMore = uischema?.options?.onLoadMore;
  const hasNextPage = uischema?.options?.hasNextPage;
  const isFetchingNextPage = uischema?.options?.isFetchingNextPage;
  const isLoading = uischema?.options?.isLoading;
  const placeholder = uischema?.options?.placeholder || "Select an option...";

  return (
    <div className="space-y-1">
      <Label
        htmlFor={path}
        className={`${hasErrors ? "text-red-500" : ""}`}
      >
        {label || description} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <SearchSelect
        value={data ? String(data) : ""}
        onChange={(val) => handleChange(path, val)}
        options={selectOptions}
        disabled={isDisabled}
        placeholder={placeholder}
        className={`text-xs bg-background ${hasErrors ? "border-red-500" : ""}`}
        onSearchChange={onSearchChange}
        onLoadMore={onLoadMore}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
      />
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
    </div>
  );
};

CustomSearchSelectInput.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
  required: PropTypes.bool,
};
