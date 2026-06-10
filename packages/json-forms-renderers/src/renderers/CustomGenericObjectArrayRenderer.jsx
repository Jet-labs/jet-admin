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
  // Propagate template context (stateTree / templateMode) down to nested controls
  // so inner text inputs keep their {{ }} intellisense.
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode,
  };

  const handleAddItem = () => {
    if (!itemSchema) return;
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

  return (
    <div className="p-3 border border-border rounded-sm bg-background">
      <Label className="block mb-1 text-sm font-medium text-foreground">
        {label || uischema.label || "Items"}
      </Label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="flex flex-col gap-2">
        {propertyKeys.length > 0 ? items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center space-x-2">
            {propertyKeys.map((propKey) => (
              <div key={propKey} className="flex-grow">
                <JsonFormsDispatch
                  uischema={{
                    type: "Control",
                    scope: `#/properties/${propKey}`,
                    label: propKey.charAt(0).toUpperCase() + propKey.slice(1),
                    options: { ...templateOptions },
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
              size="icon"
              square
              onClick={() => handleRemoveItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )) : (
          <div className="text-xs text-muted-foreground italic py-2">
            Schema has no properties defined.
          </div>
        )}
      </div>

      {items.length === 0 && propertyKeys.length > 0 && (
        <div className="text-xs text-muted-foreground italic py-2">
          No items added yet.
        </div>
      )}

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
