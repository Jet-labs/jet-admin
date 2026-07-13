// Custom Dynamic Key-Value Input Renderer - Renders dynamic argument fields generically
import React from 'react';
import PropTypes from 'prop-types';
import { TemplateAutocompleteInput, Label } from '@jet-admin/ui';

export const CustomDynamicKeyValueInputRenderer = (props) => {
  const { data, path, handleChange, uischema, errors, enabled } = props;
  const keys = uischema?.options?.keys || uischema?.options?.args || [];
  const stateTree = uischema?.options?.stateTree || {};
  const formData = data || {};

  const handleArgChange = (argKey, value) => {
    const childPath = path ? `${path}.${argKey}` : argKey;
    handleChange(childPath, value);
  };

  if (keys.length === 0) {
    return null;
  }

  return (
    <div className="border border-border rounded p-3 bg-background">
      <Label className="block mb-2 text-sm font-medium text-foreground">
        {uischema.label || "Dynamic Inputs"}
      </Label>
      <div className="space-y-3">
        {keys.map((arg, index) => {
          const argName = arg.key;
          return (
            <div key={`arg-${index}`} className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>{argName}</span>
                {arg.type && <span className="text-[10px] bg-muted/50 px-1 rounded text-muted-foreground/80 font-mono">{arg.type}</span>}
              </Label>
              <TemplateAutocompleteInput
                value={formData[argName] || ''}
                onChange={(value) => handleArgChange(argName, value)}
                liveStateTree={stateTree}
                placeholder={`Value for ${argName}...`}
                size="sm"
                readOnly={enabled === false}
              />
            </div>
          );
        })}
      </div>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mt-2">{errors.join(", ")}</p>
      )}
    </div>
  );
};

CustomDynamicKeyValueInputRenderer.propTypes = {
  data: PropTypes.object,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  uischema: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
};
