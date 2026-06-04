import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const ButtonConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-4">
      {/* Button Text */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Button Text</Label>
        <TemplateAutocompleteInput
          value={config.text || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.text', val)}
          placeholder="Click Me"
          liveStateTree={liveStateTree}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Variant */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Variant</Label>
          <Select
            value={config.variant || "default"}
            onValueChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.variant', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Size */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Size</Label>
          <Select
            value={config.size || "default"}
            onValueChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.size', val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="icon">Icon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1.5 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

ButtonConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default ButtonConfigEditor;
