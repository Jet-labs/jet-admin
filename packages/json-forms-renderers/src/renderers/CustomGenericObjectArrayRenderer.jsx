// Custom Generic Object Array Renderer — fallback for any object array
import React from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';
import { Trash2 } from 'lucide-react';
import { Button, Label } from '@jet-admin/ui';

export const CustomGenericObjectArrayRenderer = ({
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
  const propertyKeys = itemSchema?.properties ? Object.keys(itemSchema.properties) : [];

  const handleAddItem = () => {
    const newItem = itemSchema.properties
      ? Object.fromEntries(
          Object.entries(itemSchema.properties).map(([key, propSchema]) => [
            key,
            propSchema.default !== undefined ? propSchema.default : "",
          ])
        )
      : {};
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  if (propertyKeys.length === 0) {
    return null;
  }

  return (
    <div className="p-3 border border-border rounded-sm bg-brand-dark mb-3">
      <Label className="block mb-1 text-sm font-medium text-foreground">
        {label || uischema.label || "Items"}
      </Label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2">
            {propertyKeys.map((propKey) => (
              <div key={propKey} className="flex-grow">
                <JsonFormsDispatch
                  uischema={{
                    type: "Control",
                    scope: `#/properties/${propKey}`,
                    label: propKey.charAt(0).toUpperCase() + propKey.slice(1),
                  }}
                  schema={itemSchema}
                  path={`${path}.${index}`}
                  enabled={enabled}
                  renderers={renderers}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="destructive-ghost"
              size="sm"
              square
              onClick={() => handleRemoveItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-xs text-muted-foreground italic py-2">
          No items added yet.
        </div>
      )}

      <Button
        type="button"
        variant="primary-ghost"
        size="sm"
        onClick={handleAddItem}
        className="mt-3"
      >
        Add Item
      </Button>
    </div>
  );
};

CustomGenericObjectArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
};
