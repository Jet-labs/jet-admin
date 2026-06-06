// Custom Key-Value-Type Array Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';
import { Trash2 } from 'lucide-react';
import { Button, Label } from '@jet-admin/ui';

export const CustomKeyValueTypeArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
  renderers,
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  // Propagate template context (stateTree / templateMode) down to nested controls
  // so inner text inputs keep their {{ }} intellisense.
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode,
  };

  const handleAddItem = () => {
    const newItem = itemSchema.properties
      ? Object.fromEntries(
          Object.entries(itemSchema.properties).map(([key, propSchema]) => [
            key,
            propSchema.default !== undefined ? propSchema.default : "",
          ])
        )
      : { key: "", value: "", type: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  return (
    <div className="p-3 border border-border rounded-sm bg-background">
      <Label className="block mb-1 text-sm font-medium text-foreground">
        {label || uischema.label || "Items"}
      </Label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="gap-2">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2">
            {/* Key Field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/key",
                  label: "Key",
                  options: { ...uischema.options?.keyOptions, ...templateOptions },
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Value Type */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/type",
                  label: "Value Type",
                  options: { ...uischema.options?.typeOptions, ...templateOptions },
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            {/* Value Field */}
            <div className="flex-grow">
              <JsonFormsDispatch
                uischema={{
                  type: "Control",
                  scope: "#/properties/value",
                  label: "Value",
                  options: { ...uischema.options?.valueOptions, ...templateOptions },
                }}
                schema={itemSchema}
                path={`${path}.${index}`}
                enabled={enabled}
                renderers={renderers}
              />
            </div>
            <Button
              type="button"
              variant="destructive-ghost"
              size="icon"
              square
              onClick={() => handleRemoveItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="mt-3"
      >
        Add Item
      </Button>
    </div>
  );
};

CustomKeyValueTypeArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
