// Custom String Array Renderer for arrays of simple strings
import React from 'react';
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { Button, Label, TemplateAutocompleteInput } from '@jet-admin/ui';

export const CustomStringArrayRenderer = (props) => {
  const { data, path, handleChange, label, uischema, enabled, visible } = props;

  const arrayData = Array.isArray(data) ? data : [];
  // Template context propagated by the host form, so each item keeps {{ }} intellisense.
  const stateTree = uischema?.options?.stateTree || null;
  const templateMode = uischema?.options?.templateMode;

  const handleAddItem = () => {
    handleChange(path, [...arrayData, '']);
  };

  const handleRemoveItem = (index) => {
    const newData = arrayData.filter((_, i) => i !== index);
    handleChange(path, newData);
  };

  const handleItemChange = (index, value) => {
    const newData = [...arrayData];
    newData[index] = value;
    handleChange(path, newData);
  };

  if (visible === false) {
    return null;
  }

  return (
    <div className="p-3 border border-border rounded-sm bg-background">
      <Label className="block mb-1 text-sm font-medium text-foreground">
        {label || uischema?.label || "Items"}
      </Label>
      
      <div className="gap-2">
        {arrayData.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2 mb-2">
            <div className="flex-grow">
              <TemplateAutocompleteInput
                value={item || ''}
                onChange={(val) => handleItemChange(index, val)}
                placeholder="Enter value..."
                liveStateTree={stateTree}
                mode={templateMode}
                readOnly={!enabled}
              />
            </div>
            <Button
              type="button"
              variant="destructive-ghost"
              size="icon"
              square
              onClick={() => handleRemoveItem(index)}
              disabled={!enabled}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {arrayData.length === 0 && (
        <div className="text-xs text-muted-foreground italic py-2">
          No items added yet.
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        disabled={!enabled}
        className="mt-3"
      >
        Add Item
      </Button>
    </div>
  );
};

CustomStringArrayRenderer.propTypes = {
  data: PropTypes.array,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  uischema: PropTypes.object,
  enabled: PropTypes.bool,
  visible: PropTypes.bool,
};
