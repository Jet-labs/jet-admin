// Custom Field-Operator-Value Array Renderer (for Firestore where conditions)
import React from 'react';
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TemplateAutocompleteInput } from '@jet-admin/ui';

export const CustomFieldOperatorValueArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const isDisabled = enabled === false;
  // Template context propagated by the host form, so field/value keep {{ }} intellisense.
  const stateTree = uischema?.options?.stateTree || null;
  const templateMode = uischema?.options?.templateMode;

  // Get operator options from schema
  const operatorOptions = itemSchema?.properties?.operator?.enum || [
    "==", "!=", "<", "<=", ">", ">=", "array-contains", "array-contains-any", "in", "not-in"
  ];

  const handleAddItem = () => {
    const newItem = { field: "", operator: "==", value: "" };
    handleChange(path, [...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };

  const handleItemChange = (index, field, value) => {
    handleChange(`${path}.${index}.${field}`, value);
  };

  return (
    <div className="p-3 border border-border rounded-sm bg-background">
      <Label className="block mb-2 text-sm font-medium text-foreground">
        {label || uischema.label || "Conditions"}
      </Label>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-xs mb-2">{errors}</p>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${path}-${index}`} className="flex items-center gap-2">
            {/* Field */}
            <div className="flex-1">
              <TemplateAutocompleteInput
                placeholder="Field"
                value={item.field || ""}
                readOnly={isDisabled}
                onChange={(val) => handleItemChange(index, "field", val)}
                liveStateTree={stateTree}
                mode={templateMode}
                className={errors && errors.length > 0 ? "ring-1 ring-red-500 rounded-sm" : ""}
              />
            </div>
            {/* Operator */}
            <div className="w-36">
              <Select value={item.operator || "=="} onValueChange={(val) => handleItemChange(index, "operator", val)} disabled={isDisabled}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Value */}
            <div className="flex-1">
              <TemplateAutocompleteInput
                placeholder="Value"
                value={item.value || ""}
                readOnly={isDisabled}
                onChange={(val) => handleItemChange(index, "value", val)}
                liveStateTree={stateTree}
                mode={templateMode}
              />
            </div>
            {/* Delete Button */}
            <Button
              type="button"
              variant="destructive-ghost"
              size="icon"
              square
              onClick={() => handleRemoveItem(index)}
              disabled={isDisabled}
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
        disabled={isDisabled}
        className="mt-3"
      >
        Add Condition
      </Button>
    </div>
  );
};

CustomFieldOperatorValueArrayRenderer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  label: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
};
